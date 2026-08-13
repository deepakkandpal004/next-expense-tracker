// lib/cache.ts
import { redis } from "./redis";

const DEFAULT_TTL = 60 * 5; // 5 minutes

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null; // Redis failure should never break the app
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds = DEFAULT_TTL,
): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // silently fail; app continues without cache
  }
}

export async function deleteCache(...keys: string[]): Promise<void> {
  try {
    if (keys.length > 0) await redis.del(...keys);
  } catch { /* silent */ }
}

export async function deleteCacheByPattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern); // safe at this scale
    if (keys.length > 0) await redis.del(...keys);
  } catch { /* silent */ }
}

// Key builders — centralized so invalidation is consistent
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
  userDashboardPattern: (userId: string) =>
    `app:dashboard:${userId}:*`,
  userRecordsPattern: (userId: string) =>
    `app:records:${userId}:*`,
  userAllPattern: (userId: string) =>
    `app:*:${userId}:*`,
};
