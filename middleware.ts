import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const adminSegment = process.env.ADMIN_URL_SEGMENT || "admin-secret-portal";
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

  // Protect admin routes — email check is done in admin layout (or next.js middleware if preferred, but doing it in layout as per prompt)
  if (isAdminPath && !req.nextUrl.pathname.includes("/login") && !session) {
    return NextResponse.redirect(new URL(`/${adminSegment}/login`, req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/ai-analyst/:path*",
    "/compliance/:path*",
    "/bug-bounty/:path*",
    "/hrm/:path*",
    "/billing/:path*",
    "/settings/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
