import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";
  const adminSegment = process.env.ADMIN_URL_SEGMENT || "admin-secret-portal";
  const authorizedEmails = (process.env.ADMIN_AUTHORIZED_EMAILS || '').split(',').map(e => e.trim());

  // Check if we are on the HQ subdomain
  const isHqSubdomain = hostname.startsWith("hq.");

  if (isHqSubdomain) {
    if (!session) {
       // Redirect to main site landing page
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
