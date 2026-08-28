import { db } from "@/src/database/client";
import { computeMoneyLeaks, type MoneyLeakReport } from "@/src/common/domain/money-leaks";
import { daysInResolvedPeriod } from "@/src/common/domain/reporting-period";
import type { ResolvedPeriod } from "@/src/common/domain/types";
import {
  boundaryAtStart,
  boundaryAtEnd,
  monthKeyUtc,
  trailingMonths,
} from "@/src/common/utils/date-boundaries";
import { getCache, setCache } from "@/src/common/cache";

export const MONEY_LEAK_HISTORY_MONTHS = 6;

const monthKey = monthKeyUtc;

export async function getMoneyLeakReport(
  userId: string,
  period: ResolvedPeriod,
): Promise<MoneyLeakReport> {
  const now = new Date();

  const periodRecords = await db.record.findMany({
    where: {
      userId,
      type: "expense",
      date: { gte: boundaryAtStart(period.start), lte: boundaryAtEnd(period.end) },
    },
    select: { amount: true, category: true },
  });

  const spendByCategory = new Map<string, number>();
  for (const record of periodRecords) {
    spendByCategory.set(
      record.category,
      (spendByCategory.get(record.category) ?? 0) + Math.round(Number(record.amount) * 100),
    );
  }

  const isCurrentMonth =
    now.getUTCFullYear() === new Date(`${period.start}T00:00:00Z`).getUTCFullYear() &&
    now.getUTCMonth() === new Date(`${period.start}T00:00:00Z`).getUTCMonth();

  let currentMonthlySpendByCategory: Record<string, number> = {};
  if (isCurrentMonth) {
    const daysInPeriod = daysInResolvedPeriod(period);
    const elapsed = Math.max(1, now.getUTCDate());
    for (const [category, minor] of spendByCategory) {
      currentMonthlySpendByCategory[category] = Math.round(
        (minor / elapsed) * daysInPeriod,
      );
    }
  } else {
    currentMonthlySpendByCategory = Object.fromEntries(spendByCategory);
  }

  const historyStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - MONEY_LEAK_HISTORY_MONTHS, 1),
  );
  const historyRecords = await db.record.findMany({
    where: {
      userId,
      type: "expense",
      date: { gte: historyStart, lt: boundaryAtStart(period.start) },
    },
    select: { amount: true, category: true, date: true },
  });

  const months = trailingMonths(now, MONEY_LEAK_HISTORY_MONTHS);
  const totalsByCategory = new Map<string, Map<string, number>>();
  for (const month of months) {
    for (const category of new Set(historyRecords.map((r) => r.category))) {
      if (!totalsByCategory.has(category)) totalsByCategory.set(category, new Map());
      totalsByCategory.get(category)!.set(month, 0);
    }
  }
  for (const record of historyRecords) {
    const key = monthKey(record.date);
    const byMonth = totalsByCategory.get(record.category);
    if (!byMonth) continue;
    byMonth.set(key, (byMonth.get(key) ?? 0) + Math.round(Number(record.amount) * 100));
  }

  const historyMonthlyTotals: { categoryId: string; month: string; totalMinor: number }[] = [];
  for (const [category, byMonth] of totalsByCategory) {
    for (const [month, totalMinor] of byMonth) {
      historyMonthlyTotals.push({ categoryId: category, month, totalMinor });
    }
  }

  return computeMoneyLeaks({
    currentMonthlySpendByCategory,
    historyMonthlyTotals,
    period,
  });
}

export async function getCachedMoneyLeakReport(
  userId: string,
  period: ResolvedPeriod,
): Promise<MoneyLeakReport> {
  const key = `app:money-leaks:${userId}:${period.start}_${period.end}`;
  const cached = await getCache<MoneyLeakReport>(key);
  if (cached) return cached;
  const data = await getMoneyLeakReport(userId, period);
  await setCache(key, data, 60 * 5);
  return data;
}
