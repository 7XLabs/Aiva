// Minimal in-memory sliding-window rate limiter for public AI endpoints.
// Per-instance (fine for a single server / demo); swap for Redis in a fleet.
const hits = new Map<string, number[]>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const windowStart = now - windowMs;
  const arr = (hits.get(key) ?? []).filter((t) => t > windowStart);
  if (arr.length >= limit) {
    const retryAfterSec = Math.ceil((arr[0] + windowMs - now) / 1000);
    hits.set(key, arr);
    return { ok: false, retryAfterSec };
  }
  arr.push(now);
  hits.set(key, arr);
  return { ok: true, retryAfterSec: 0 };
}

export function clientKey(req: { headers: Headers }, route: string): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "local";
  return `${route}:${ip}`;
}

// Standard rate-limit headers for a response.
export function rateLimitHeaders(
  limit: number,
  result: { ok: boolean; retryAfterSec: number }
): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(limit),
  };
  if (!result.ok) {
    headers["Retry-After"] = String(result.retryAfterSec);
    headers["X-RateLimit-Remaining"] = "0";
  }
  return headers;
}
