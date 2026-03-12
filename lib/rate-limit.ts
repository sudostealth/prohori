/**
 * lib/rate-limit.ts
 * In-memory rate limiter for Next.js API routes.
 * No Redis required — suitable for single-instance deployments.
 *
 * Usage:
 *   const limiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });
 *   const result = limiter.check(ip);
 *   if (!result.success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
 */

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  success: boolean;
  /** Remaining requests in the current window */
  remaining: number;
  /** Total limit for the window */
  limit: number;
  /** When the current window resets */
  resetAt: Date;
}

interface RequestRecord {
  count: number;
  resetAt: number; // epoch ms
}

export function createRateLimiter(config: RateLimitConfig) {
  const store = new Map<string, RequestRecord>();

  // Periodically clean up expired entries to prevent memory leaks
  const cleanupIntervalMs = Math.max(config.windowMs * 2, 60_000);
  setInterval(() => {
    const now = Date.now();
    Array.from(store.entries()).forEach(([key, record]) => {
      if (record.resetAt <= now) {
        store.delete(key);
      }
    });
  }, cleanupIntervalMs).unref(); // .unref() prevents the interval from keeping the process alive

  return {
    check(identifier: string): RateLimitResult {
      const now = Date.now();
      const existing = store.get(identifier);

      if (!existing || existing.resetAt <= now) {
        // First request or window expired — start fresh
        const resetAt = now + config.windowMs;
        store.set(identifier, { count: 1, resetAt });
        return {
          success: true,
          remaining: config.maxRequests - 1,
          limit: config.maxRequests,
          resetAt: new Date(resetAt),
        };
      }

      if (existing.count >= config.maxRequests) {
        return {
          success: false,
          remaining: 0,
          limit: config.maxRequests,
          resetAt: new Date(existing.resetAt),
        };
      }

      existing.count += 1;
      return {
        success: true,
        remaining: config.maxRequests - existing.count,
        limit: config.maxRequests,
        resetAt: new Date(existing.resetAt),
      };
    },

    reset(identifier: string): void {
      store.delete(identifier);
    },
  };
}

// ── Pre-configured limiters for each endpoint ──────────────────────────────

/** AI endpoint — expensive, strict limit */
export const aiRateLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 60_000, // 10 req / 60s
});

/** Coupon validation — moderate limit */
export const couponRateLimiter = createRateLimiter({
  maxRequests: 20,
  windowMs: 60_000, // 20 req / 60s
});

/** Wazuh connection CRUD — low limit */
export const wazuhConnectionRateLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 60_000, // 5 req / 60s
});

/**
 * Extract a reliable client IP from a Next.js request.
 */
export function getClientIp(request: { headers: { get: (key: string) => string | null } }): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Returns standard rate-limit response headers.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': result.resetAt.toISOString(),
  };
}
