import { redis, checkRedisHealth, isRedisConnected } from "@/src/integrations/redis";

export { checkRedisHealth, isRedisConnected, redis };

const DEFAULT_TTL = 60 * 5;

/**
 * Hard ceiling for any single Redis op. A hung (but connected) Redis must
 * never stall a request — the race rejects, the caller's try/catch treats
 * it as a cache miss, and the request falls back to the database.
 */
const REDIS_OP_TIMEOUT_MS = 500;

async function withRedisTimeout<T>(promise: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Redis operation timed out")), REDIS_OP_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await withRedisTimeout(redis.get(key));
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds = DEFAULT_TTL,
): Promise<void> {
  try {
    await withRedisTimeout(redis.set(key, JSON.stringify(value), "EX", ttlSeconds));
  } catch {
  }
}

export async function deleteCache(...keys: string[]): Promise<void> {
  try {
    if (keys.length > 0) await withRedisTimeout(redis.del(...keys));
  } catch { /* silent */ }
}

export async function deleteCacheByPattern(pattern: string): Promise<void> {
  try {
    let cursor = "0";
    const keysToDelete: string[] = [];
    do {
      const [nextCursor, keys] = await withRedisTimeout(redis.scan(cursor, "MATCH", pattern, "COUNT", 100));
      cursor = nextCursor;
      if (keys.length > 0) keysToDelete.push(...keys);
      if (keysToDelete.length >= 100) {
        await withRedisTimeout(redis.del(...keysToDelete.splice(0, 100)));
      }
    } while (cursor !== "0");
    if (keysToDelete.length > 0) await withRedisTimeout(redis.del(...keysToDelete));
  } catch { /* silent */ }
}

export const CacheKey = {
  dashboard: (userId: string, period: string) =>
    `app:dashboard:${userId}:${period}`,
  records: (userId: string, period: string) =>
    `app:records:${userId}:${period}`,
  budget: (userId: string) =>
    `app:budget:${userId}`,
  aiInsight: (userId: string, start: string, end: string) =>
    `app:ai-insight:${userId}:${start}:${end}`,
  goals: (userId: string) =>
    `app:goals:${userId}`,
  categories: (userId: string) =>
    `app:categories:${userId}`,
  recurringRecords: (userId: string) =>
    `app:recurring-records:${userId}`,
  safeToSpend: (userId: string, period: string) =>
    `app:safe-to-spend:${userId}:${period}`,
  cashFlow: (userId: string, period: string) =>
    `app:cash-flow:${userId}:${period}`,
  smartAlerts: (userId: string, period: string) =>
    `app:smart-alerts:${userId}:${period}`,
  report: (userId: string, monthsBack: number) =>
    `app:report:${userId}:${monthsBack}`,
  session: (tokenHash: string) =>
    `app:session:${tokenHash}`,
  userDashboardPattern: (userId: string) =>
    `app:dashboard:${userId}:*`,
  userRecordsPattern: (userId: string) =>
    `app:records:${userId}:*`,
  userAllPattern: (userId: string) =>
    `app:*:${userId}*`,
};
