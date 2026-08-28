import { db } from "@/src/database/client";
import {
  computeSmartPacingAlerts,
  type PacingCategoryHistory,
  type SmartPacingReport,
} from "@/src/common/domain/smart-alerts";
import type { ResolvedPeriod } from "@/src/common/domain/types";
import {
  boundaryAtStart,
  boundaryAtEnd,
  monthKeyUtc,
  trailingMonths,
} from "@/src/common/utils/date-boundaries";
import { getCache, setCache, CacheKey } from "@/src/common/cache";

export const SMART_ALERT_HISTORY_MONTHS = 6;

const monthKey = monthKeyUtc;

export async function getSmartPacingReport(
  userId: string,
  period: ResolvedPeriod,
): Promise<SmartPacingReport> {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  const [periodRecords, historyRecords] = await Promise.all([
    db.record.findMany({
      where: {
        userId,
        type: "expense",
        date: { gte: boundaryAtStart(period.start), lte: boundaryAtEnd(period.end) },
      },
      select: { amount: true, category: true },
    }),
    db.record.findMany({
      where: {
        userId,
        type: "expense",
        date: {
          gte: new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - SMART_ALERT_HISTORY_MONTHS, 1),
          ),
          lt: boundaryAtStart(period.start),
        },
      },
      select: { amount: true, category: true, date: true },
    }),
  ]);

  const spendToDateByCategory: Record<string, number> = {};
  for (const record of periodRecords) {
    if (!record.category) continue;
    spendToDateByCategory[record.category] =
      (spendToDateByCategory[record.category] ?? 0) + Math.round(Number(record.amount) * 100);
  }

  const months = trailingMonths(now, SMART_ALERT_HISTORY_MONTHS);
  const historyMonthlyTotals: PacingCategoryHistory[] = [];

  if (historyRecords.length > 0) {
    const byCategory = new Map<string, Map<string, number>>();
    for (const category of new Set(historyRecords.map((r) => r.category).filter(Boolean))) {
      byCategory.set(category as string, new Map(months.map((m) => [m, 0])));
    }
    for (const record of historyRecords) {
      if (!record.category) continue;
      const bucket = byCategory.get(record.category);
      if (!bucket) continue;
      const key = monthKey(record.date);
      bucket.set(key, (bucket.get(key) ?? 0) + Math.round(Number(record.amount) * 100));
    }
    for (const [categoryId, monthly] of byCategory) {
      for (const [month, totalMinor] of monthly) {
        historyMonthlyTotals.push({ categoryId, month, totalMinor });
      }
    }
  }

  return computeSmartPacingAlerts({
    period,
    today,
    spendToDateByCategory,
    historyMonthlyTotals,
  });
}

export async function getCachedSmartPacingReport(
  userId: string,
  period: ResolvedPeriod,
): Promise<SmartPacingReport> {
  const key = CacheKey.smartAlerts(userId, `${period.start}_${period.end}`);
  const cached = await getCache<SmartPacingReport>(key);
  if (cached) return cached;
  const data = await getSmartPacingReport(userId, period);
  await setCache(key, data, 60 * 5);
  return data;
}
