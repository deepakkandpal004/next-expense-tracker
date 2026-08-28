import { redis } from "@/src/integrations/redis";

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  /** When true, deny the request if Redis is unreachable. Default: false (fail-open). */
  failClosed?: boolean;
}

export async function rateLimit(
  request: Request,
  key: string,
  config: RateLimitConfig,
): Promise<{ allowed: boolean; retryAfterMs: number }> {
  const ip = getClientIp(request);
  const compositeKey = `app:rate-limit:${key}:${ip}`;
  const windowSec = Math.ceil(config.windowMs / 1000);

  try {
    const count = await redis.incr(compositeKey);
    if (count === 1) await redis.expire(compositeKey, windowSec);
    const ttl = await redis.pttl(compositeKey);

    if (count > config.maxRequests) {
      return { allowed: false, retryAfterMs: ttl > 0 ? ttl : config.windowMs };
    }
    return { allowed: true, retryAfterMs: 0 };
  } catch {
    return { allowed: !config.failClosed, retryAfterMs: config.failClosed ? config.windowMs : 0 };
  }
}

export async function rateLimitByKey(
  id: string,
  key: string,
  config: RateLimitConfig,
): Promise<{ allowed: boolean; retryAfterMs: number }> {
  const compositeKey = `app:rate-limit:${key}:${id}`;
  const windowSec = Math.ceil(config.windowMs / 1000);

  try {
    const count = await redis.incr(compositeKey);
    if (count === 1) await redis.expire(compositeKey, windowSec);
    const ttl = await redis.pttl(compositeKey);

    if (count > config.maxRequests) {
      return { allowed: false, retryAfterMs: ttl > 0 ? ttl : config.windowMs };
    }
    return { allowed: true, retryAfterMs: 0 };
  } catch {
    return { allowed: !config.failClosed, retryAfterMs: config.failClosed ? config.windowMs : 0 };
  }
}

export function rateLimitLogin(request: Request) {
  return rateLimit(request, "login", { windowMs: 60_000, maxRequests: 5, failClosed: true });
}

export function rateLimitRegister(request: Request) {
  return rateLimit(request, "register", { windowMs: 600_000, maxRequests: 3, failClosed: true });
}

export function rateLimitAiUser(userId: string) {
  return rateLimitByKey(userId, "ai", { windowMs: 60_000, maxRequests: 20 });
}
