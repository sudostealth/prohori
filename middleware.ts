import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

async function hasActiveSubscription(supabaseUrl: string, supabaseKey: string, userId: string): Promise<boolean> {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/check_subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ user_id: userId }),
    });
    
    if (response.ok) {
      const data = await response.json();
      return data === true;
    }
    
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', userId)
      .single();
    
    if (!company) return false;
    
    const { data: subscription } = await supabase
      .from('active_subscriptions')
      .select('expires_at')
      .eq('company_id', company.id)
      .eq('status', 'active')
      .gte('expires_at', new Date().toISOString())
      .single();
    
    return !!subscription;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const adminSegment = process.env.NEXT_PUBLIC_ADMIN_SEGMENT || "hq";
  const adminEmail = process.env.ADMIN_EMAIL || "admin@prohori.app";
  const pathname = request.nextUrl.pathname;

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
        return NextResponse.redirect(new URL(`/${adminSegment}`, request.url));
      }
    } catch {
      // User not logged in or error - allow through to login page
    }
    return NextResponse.next();
  }

  // ── Auth pages — allow through ──
  if (pathname.startsWith("/auth/")) {
    return supabaseResponse;
  }

  // ── Billing page and API — allow through (no subscription check) ──
  if (pathname === "/dashboard/billing" || pathname.startsWith("/api/")) {
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
          if (supabaseResponse.status === 200) {
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          }
        },
      },
    });
    const res = await supabase.auth.getUser();
    user = res.data.user;
  } catch {}

  // Admin portal protection
  if (isAdminRoute) {
    if (!user || user.email !== adminEmail) {
      return NextResponse.redirect(new URL(`/${adminSegment}/login`, request.url));
    }
    return supabaseResponse;
  }

  // User dashboard protection
  if (isDashboardRoute) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    
    // Check subscription status for non-admin users
    // Skip for the owner account initially to allow signup flow
    const { data: profile } = await createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll() {},
      },
    }).from('profiles').select('is_admin').eq('id', user.id).single();
    
    // Allow admin users to access without subscription
    if (profile?.is_admin) {
      return supabaseResponse;
    }
    
    // Check subscription for regular users
    const hasSubscription = await hasActiveSubscription(supabaseUrl, supabaseKey, user.id);
    
    if (!hasSubscription) {
      // Redirect to billing if no active subscription
      const billingUrl = new URL("/dashboard/billing", request.url);
      return NextResponse.redirect(billingUrl);
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
