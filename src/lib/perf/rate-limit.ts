/**
 * Lightweight in-memory rate limiter for Mysti / SoulTI payment endpoints.
 *
 * Caveats:
 * - Per-instance only. Production behind multiple lambdas will allow up to
 *   `limit × instanceCount` requests per window. That is still a meaningful
 *   reduction over no limit, and avoids adding Redis as a dependency.
 * - For stricter guarantees (e.g. notify URL replay protection, gift-card
 *   abuse), pair with the persistent idempotency store in
 *   `src/lib/mysti/payment-store.ts`.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

export function rateLimit(
  key: string,
  options: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, remaining: options.limit - 1, resetMs: options.windowMs };
  }
  if (existing.count >= options.limit) {
    return { allowed: false, remaining: 0, resetMs: existing.resetAt - now };
  }
  existing.count += 1;
  return {
    allowed: true,
    remaining: options.limit - existing.count,
    resetMs: existing.resetAt - now,
  };
}

/** Periodic cleanup so the Map doesn't grow forever in long-lived servers. */
const CLEAN_EVERY_MS = 60_000;
let lastClean = Date.now();
export function maybeCleanup() {
  const now = Date.now();
  if (now - lastClean < CLEAN_EVERY_MS) return;
  lastClean = now;
  for (const [k, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(k);
  }
}

/** Resolve a stable identifier from headers + body fields. */
export function resolveRateLimitKey(req: Request, deviceId?: string): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  return `${deviceId || 'no-device'}:${ip}`;
}
