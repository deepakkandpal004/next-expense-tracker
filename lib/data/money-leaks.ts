import { db } from "../db";
import { computeMoneyLeaks, type MoneyLeakReport } from "../domain/money-leaks";
import { daysInResolvedPeriod } from "../domain/reporting-period";
import type { ResolvedPeriod } from "../domain/types";
import {
  boundaryAtStart,
  boundaryAtEnd,
  monthKeyUtc,
  trailingMonths,
} from "../utils/date-boundaries";
import { getCache, setCache } from "../cache";

export const MONEY_LEAK_HISTORY_MONTHS = 6;

const monthKey = monthKeyUtc;

/**
 * Deterministic money-leak report for a period.
 *
 * Compares the period's projected monthly spend per discretionary category
 * against the user's own trailing-month median (DESIGN rule 1: every savings
 * figure derives from the user's data). The engine is pure; this loader is the
 * only place that touches the database.
 */
export async function getMoneyLeakReport(
  userId: string,
  period: ResolvedPeriod,
): Promise<MoneyLeakReport> {
  const now = new Date();

  // 1. Current-period spend per category, projected to a full month when the
  //    period is the in-flight calendar month.
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

  // If the period is the current calendar month, scale to a full-month figure so
  // a "month spend" is comparable to the trailing-median baseline.
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

  // 2. Trailing-month history, zero-padded so a category with no activity in a
  //    given month counts as ₹0 (an honest baseline, never silently dropped).
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