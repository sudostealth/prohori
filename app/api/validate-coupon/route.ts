import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withMonitoring } from "@/lib/monitor";
import { couponRateLimiter, getClientIp, rateLimitHeaders } from "@/lib/rate-limit";
import { cache, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";
import { logAdminAction, AUDIT_ACTIONS } from "@/lib/audit-logger";

async function handlePost(req: NextRequest): Promise<NextResponse> {
  // Rate limit — 20 requests per 60s per IP
  const ip = getClientIp(req);
  const rateCheck = couponRateLimiter.check(ip);

  if (!rateCheck.success) {
    return NextResponse.json(
      { valid: false, message: "Too many requests. Please wait." },
      { status: 429, headers: rateLimitHeaders(rateCheck) }
    );
  }

  try {
    const { code } = await req.json();
    if (!code) return NextResponse.json({ valid: false, message: "No code provided" });

    // Check cache first
    const cacheKey = CACHE_KEYS.COUPON(code);
    const cached = cache.get<{ valid: boolean; discount?: number; type?: string; message: string }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, { headers: rateLimitHeaders(rateCheck) });
    }

    const supabase = createClient();
    const { data: coupon, error } = await supabase
      .from("coupon_codes")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !coupon) {
      const result = { valid: false, message: "Invalid coupon code" };
      // Cache invalid result briefly (30s) to reduce DB hammering on invalid codes
      cache.set(cacheKey, result, CACHE_TTL.COUPON);
      return NextResponse.json(result);
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      const result = { valid: false, message: "This coupon has expired" };
      cache.set(cacheKey, result, CACHE_TTL.COUPON);
      return NextResponse.json(result);
    }

    if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
      const result = { valid: false, message: "Coupon usage limit reached" };
      cache.set(cacheKey, result, CACHE_TTL.COUPON);
      return NextResponse.json(result);
    }

    // Log coupon validation
    await logAdminAction({
      action: AUDIT_ACTIONS.COUPON_VALIDATED,
      resource: 'coupon_codes',
      resourceId: coupon.id,
      userId: 'anonymous',
      details: { coupon_code: code.toUpperCase(), discount: coupon.value },
      req,
    });

    const result = {
      valid: true,
      discount: coupon.value,
      type: coupon.discount_type,
      message: `${coupon.discount_type === "percentage" ? `${coupon.value}% off` : `৳${coupon.value} off`}`,
    };

    cache.set(cacheKey, result, CACHE_TTL.COUPON);
    return NextResponse.json(result, { headers: rateLimitHeaders(rateCheck) });
  } catch {
    return NextResponse.json({ valid: false, message: "Server error" }, { status: 500 });
  }
}

export const POST = withMonitoring(handlePost);
