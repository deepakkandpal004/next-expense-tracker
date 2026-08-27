import * as repo from "@/src/modules/records/infrastructure/records.repository";
import { toDashboardTransactionDTO, DEFAULT_CURRENCY } from "@/lib/data/dashboard";
import type { ResolvedPeriod, Transaction } from "@/lib/domain/types";
import { getCache, setCache, CacheKey } from "@/src/common/cache";

/**
 * Records application service — use-cases.
 * Wraps repository + cache + domain.
 * Migrated from lib/data/records.ts + app/actions/*.
 */

export async function getRecordsForPeriod(
  userId: string,
  period: ResolvedPeriod,
  currency: string = DEFAULT_CURRENCY,
): Promise<readonly Transaction[]> {
  const rows = await repo.findByPeriod(userId, period);
  return rows.map((r) => toDashboardTransactionDTO(r as never, currency));
}

export async function getCachedRecordsForPeriod(
  userId: string,
  period: ResolvedPeriod,
  currency: string = DEFAULT_CURRENCY,
): Promise<readonly Transaction[]> {
  const key = CacheKey.records(userId, `${period.start}_${period.end}`);
  const cached = await getCache<readonly Transaction[]>(key);
  if (cached) return cached;
  const data = await getRecordsForPeriod(userId, period, currency);
  await setCache(key, data, 60 * 5);
  return data;
}

export async function getRecordsPaginated(
  userId: string,
  period: ResolvedPeriod,
  cursor?: { date: string; id: string },
  take: number = 50,
) {
  return repo.findByPeriodPaginated(userId, period, { cursor, take });
}

export async function getRecordsCount(userId: string, period: ResolvedPeriod) {
  return repo.countByPeriod(userId, period);
}

export interface RecordsViewQuery {
  search: string;
  types: readonly string[];
  categories: readonly string[];
  sort: { key: "date" | "amount"; direction: "asc" | "desc" };
  page: number;
  take: number;
}

function buildQueryCacheKey(
  userId: string,
  period: ResolvedPeriod,
  query: RecordsViewQuery,
): string {
  const hash = [
    query.search.trim().toLowerCase(),
    [...query.types].sort().join(","),
    [...query.categories].sort().join(","),
    `${query.sort.key}-${query.sort.direction}`,
    `${query.page}`,
    `${query.take}`,
  ].join("|");
  // Use simple hash to keep key length reasonable
  let h = 0;
  for (let i = 0; i < hash.length; i++) h = (Math.imul(31, h) + hash.charCodeAt(i)) | 0;
  return `app:records:query:${userId}:${period.start}_${period.end}:${h}`;
}

export async function getRecordsView(
  userId: string,
  period: ResolvedPeriod,
  query: RecordsViewQuery,
  currency: string = DEFAULT_CURRENCY,
): Promise<{ records: readonly Transaction[]; total: number; hasMore: boolean; page: number; take: number }> {
  const cacheKey = buildQueryCacheKey(userId, period, query);
  const cached = await getCache<{ records: readonly Transaction[]; total: number; hasMore: boolean; page: number; take: number }>(cacheKey);
  if (cached) return cached;

  const result = await repo.findByQueryPaginated(userId, period, query, { page: query.page, take: query.take });
  const records = result.items.map((r) => toDashboardTransactionDTO(r as never, currency));
  const payload = { records, total: result.total, hasMore: result.hasMore, page: query.page, take: query.take };
  await setCache(cacheKey, payload, 60 * 2); // 2 min TTL for query (shorter than period cache)
  return payload;
}

export async function getCachedRecordsView(
  userId: string,
  period: ResolvedPeriod,
  query: RecordsViewQuery,
  currency: string = DEFAULT_CURRENCY,
) {
  return getRecordsView(userId, period, query, currency);
}
