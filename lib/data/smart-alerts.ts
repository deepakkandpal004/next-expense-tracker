import { db } from "../db";
import {
  computeSmartPacingAlerts,
  type PacingCategoryHistory,
  type SmartPacingReport,
} from "../domain/smart-alerts";
import type { ResolvedPeriod } from "../domain/types";

export const SMART_ALERT_HISTORY_MONTHS = 6;

function boundaryAtStart(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function boundaryAtEnd(date: string): Date {
  return new Date(`${date}T23:59:59.999Z`);
}

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Trailing window of calendar months (YYYY-MM) that precede the current one. */
function trailingMonths(now: Date, count: number): string[] {
  const months: string[] = [];
  const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  for (let index = 0; index < count; index += 1) {
    cursor.setUTCMonth(cursor.getUTCMonth() - 1);
    months.push(`${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

/**
 * Deterministic smart-pacing report for the period (DESIGN.md rule 1: every
 * alert figure derives from the user's own recorded spend + trailing history).
 *
 * This loader only stages data for the pure engine: the period's spend-to-date
 * per category and a trailing window of per-category monthly totals (the
 * "normal pace" baseline). A period that has already ended yields no alerts.
 */
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
      (spendToDateByCategory[record.category] ?? 0) + Math.round(record.amount * 100);
  }

  // Trailing window, zero-padded per month so a category with no activity in a
  // given month counts as ₹0 (an honest baseline, never silently dropped).
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
      bucket.set(key, (bucket.get(key) ?? 0) + Math.round(record.amount * 100));
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