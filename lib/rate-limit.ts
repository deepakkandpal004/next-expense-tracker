interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export function rateLimit(
  request: Request,
  key: string,
  config: RateLimitConfig,
): { allowed: boolean; retryAfterMs: number } {
  const ip = getClientIp(request);
  const compositeKey = `${key}:${ip}`;
  const now = Date.now();
  const entry = store.get(compositeKey);

  if (!entry || now > entry.resetAt) {
    store.set(compositeKey, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

const LOGIN_LIMIT: RateLimitConfig = { windowMs: 60_000, maxRequests: 5 };
const REGISTER_LIMIT: RateLimitConfig = { windowMs: 600_000, maxRequests: 3 };

export function rateLimitLogin(request: Request) {
  return rateLimit(request, "login", LOGIN_LIMIT);
}

export function rateLimitRegister(request: Request) {
  return rateLimit(request, "register", REGISTER_LIMIT);
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 60_000);
