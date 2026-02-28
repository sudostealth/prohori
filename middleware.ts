import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const url = req.nextUrl;

  // Basic Health Check / Debug route bypass
  if (url.pathname === '/api/debug' || url.pathname === '/api/health') {
    return res;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
    return new NextResponse(
      JSON.stringify({ error: 'Configuration Error: Missing Supabase URL' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }

  // Configure cookie options for cross-subdomain auth
  const isProd = process.env.NODE_ENV === 'production';
  // Use domain only in production to avoid localhost cookie rejections
  const cookieDomain = isProd ? process.env.NEXT_PUBLIC_COOKIE_DOMAIN : undefined;

  let session = null;

  try {
    const supabase = createMiddlewareClient({ req, res }, {
      cookieOptions: cookieDomain ? {
        domain: cookieDomain,
        path: '/',
        sameSite: 'lax',
        secure: true,
      } : undefined
    });

    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch (error) {
    console.error('Supabase Auth Error in Middleware:', error);
    session = null;
  }

  const hostname = req.headers.get("host") || "";
  const adminSegment = process.env.NEXT_PUBLIC_ADMIN_URL_SEGMENT || "admin-secret-portal";
  const authorizedEmails = (process.env.ADMIN_AUTHORIZED_EMAILS || '').split(',').map(e => e.trim());

  // Check if we are on the HQ subdomain
  const isHqSubdomain = hostname.startsWith("hq.");

  if (isHqSubdomain) {
    if (!session) {
       const mainDomain = hostname.replace("hq.", "");
       const protocol = url.protocol;
       return NextResponse.redirect(`${protocol}//${mainDomain}/`);
    }

    const userEmail = session.user.email;
    const isAdmin = userEmail && authorizedEmails.includes(userEmail);

    if (!isAdmin) {
       // Redirect to main site dashboard
       const mainDomain = hostname.replace("hq.", "");
       const protocol = url.protocol;
       return NextResponse.redirect(`${protocol}//${mainDomain}/dashboard`);
    }

    // User is Admin. Rewrite URL to map to the admin segment path.
    const path = url.pathname;

    // Skip rewrite for API, Auth routes, and static assets if any slipped through matcher
    if (path.startsWith('/api') || path.startsWith('/auth') || path.includes('.')) {
        return res;
    }

    // Rewrite to admin segment if not already there
    if (!path.startsWith(`/${adminSegment}`)) {
        return NextResponse.rewrite(new URL(`/${adminSegment}${path}`, req.url));
    }
  }

  // --- Main Domain Logic ---

  const isAdminPath = req.nextUrl.pathname.startsWith(`/${adminSegment}`);
  const isDashboardPath =
    req.nextUrl.pathname.startsWith("/dashboard") ||
    [
      "/ai-analyst",
      "/compliance",
      "/bug-bounty",
      "/hrm",
      "/billing",
      "/settings",
    ].some((p) => req.nextUrl.pathname.startsWith(p));

  // Protect user dashboard routes
  if (isDashboardPath && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If someone tries to access the admin segment directly on the main domain, redirect to HQ subdomain
  if (isAdminPath) {
      const protocol = url.protocol;
      const hqDomain = `hq.${hostname}`;
      const newPath = req.nextUrl.pathname.replace(`/${adminSegment}`, "") || "/";

      if (!isHqSubdomain) {
          // Only redirect if NOT already on HQ subdomain (prevent loops)
          return NextResponse.redirect(`${protocol}//${hqDomain}${newPath}`);
      }
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
