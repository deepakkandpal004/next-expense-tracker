import { db } from "../db";
import type { ResolvedPeriod, Transaction } from "../domain/types";
import { toDashboardTransactionDTO, DEFAULT_CURRENCY, type DashboardRecordRow } from "./dashboard";
import { boundaryAtStart, boundaryAtEnd } from "../utils/date-boundaries";
import { getCache, setCache, CacheKey } from "../cache";

/**
 * Loads exactly the authorized, inclusive period-scoped transactions for one
 * user. This is the only supported record source for new route composition;
 * it never returns records from other users and never falls back to an
 * unscoped query.
 */
export async function getRecordsForPeriod(
  userId: string,
  period: ResolvedPeriod,
  currency: string = DEFAULT_CURRENCY,
): Promise<readonly Transaction[]> {
  const rows: readonly DashboardRecordRow[] = await db.record.findMany({
    where: {
      userId,
      date: { gte: boundaryAtStart(period.start), lte: boundaryAtEnd(period.end) },
    },
    orderBy: { date: "desc" },
  });

  return rows.map((row) => toDashboardTransactionDTO(row, currency));
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
