import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const adminDomain = process.env.NEXT_PUBLIC_ADMIN_DOMAIN || "hq.prohori.app";
  const isAdminDomain = host === adminDomain || host.startsWith("hq.localhost");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const adminSegment = process.env.NEXT_PUBLIC_ADMIN_SEGMENT || "hq";
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.ADMIN_EMAIL || "admin@prohori.app";

  let pathname = request.nextUrl.pathname;
  let supabaseResponse = NextResponse.next({ request });

  // ── Subdomain Rewrite ──
  // If we are on the admin domain and the path doesn't already start with the segment, rewrite it.
  if (isAdminDomain && !pathname.startsWith(`/${adminSegment}`)) {
    pathname = `/${adminSegment}${pathname === "/" ? "" : pathname}`;
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    supabaseResponse = NextResponse.rewrite(url);
  }

  const adminRootPath = isAdminDomain ? "/" : `/${adminSegment}`;
  const adminLoginPath = isAdminDomain ? "/login" : `/${adminSegment}/login`;

  // ── Admin login page - always allow through without redirect ──
  if (pathname === `/${adminSegment}/login` || pathname === `/${adminSegment}/login/`) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll() {},
        },
      });
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email === adminEmail) {
        return NextResponse.redirect(new URL(adminRootPath, request.url));
      }
    } catch {
      // User not logged in or error - allow through to login page
    }
    return supabaseResponse;
  }

  // ── Auth pages — allow through ──
  if (pathname.startsWith("/auth/") || pathname.startsWith("/api/")) {
    return supabaseResponse;
  }

  // ── For all other protected pages, check auth ──
  const isAdminRoute = pathname.startsWith(`/${adminSegment}`);
  const isDashboardRoute = pathname.startsWith("/dashboard");

  if (!isAdminRoute && !isDashboardRoute) {
    return supabaseResponse;
  }

  let user = null;
  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          // If we had a rewrite response, we should maintain its cookies instead of creating a new NextResponse.next()
          // We can just append cookies to the existing response.
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });
    const res = await supabase.auth.getUser();
    user = res.data.user;
  } catch {}

  // Admin portal protection
  if (isAdminRoute) {
    if (!user || user.email !== adminEmail) {
      return NextResponse.redirect(new URL(adminLoginPath, request.url));
    }
    return supabaseResponse;
  }

  // User dashboard protection
  if (isDashboardRoute) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    
    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
