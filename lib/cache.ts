/**
 * lib/cache.ts
 * Lightweight in-memory TTL cache for server-side Next.js route data.
 * Zero dependencies — uses a Map under the hood.
 *
 * Usage:
 *   import { cache } from '@/lib/cache';
 *   const plans = cache.get('plans:all') ?? await fetchPlans();
 *   cache.set('plans:all', plans, 60_000); // cache for 60 seconds
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number; // epoch ms
}

class TtlCache {
  private store = new Map<string, CacheEntry<unknown>>();

  /** Retrieve a cached value, or undefined if missing/expired. */
  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  /**
   * Store a value with a TTL.
   * @param ttlMs - Time-to-live in milliseconds (default: 60 seconds)
   */
  set<T>(key: string, value: T, ttlMs = 60_000): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /** Remove a specific key. */
  invalidate(key: string): void {
    this.store.delete(key);
  }

  /** Remove all keys matching a prefix. */
  invalidatePrefix(prefix: string): void {
    Array.from(this.store.keys()).forEach((key) => {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    });
  }

  /** Remove all cached entries. */
  clear(): void {
    this.store.clear();
  }

  /** Return the number of currently stored (possibly expired) entries. */
  size(): number {
    return this.store.size;
  }
}

// Singleton — shared across all API route invocations within the same process
export const cache = new TtlCache();

// ── Cache key constants ──────────────────────────────────────────────────────
export const CACHE_KEYS = {
  PLANS_ALL: 'plans:all',
  PLANS_MONTHLY: 'plans:monthly',
  PLANS_YEARLY: 'plans:yearly',
  COUPON: (code: string) => `coupon:${code.toUpperCase()}`,
} as const;

// ── TTL constants ────────────────────────────────────────────────────────────
export const CACHE_TTL = {
  PLANS: 60_000,   // 60 seconds — plans change rarely
  COUPON: 30_000,  // 30 seconds — short TTL for coupon validity
} as const;
