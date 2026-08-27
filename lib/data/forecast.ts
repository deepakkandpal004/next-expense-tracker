import { Decimal } from "@prisma/client/runtime/library";
import { db } from "../db";
import type {
  MonthlySpendingSummary,
  CategoryMonthlySpending,
} from "../domain/forecast";
import { monthKeyUtc } from "../utils/date-boundaries";

function monthRange(monthsBack: number): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - monthsBack, 1));
  return { start, end };
}

/**
 * Single-query forecast source — replaces two duplicate findMany calls
 * (one for monthly totals, one for category totals) with one fetch.
 */
async function fetchTrailingExpenseRecords(
  userId: string,
  monthsBack: number,
): Promise<Array<{ amount: number | Decimal; date: Date; category: string }>> {
  const { start, end } = monthRange(monthsBack);
  return db.record.findMany({
    where: { userId, type: "expense", date: { gte: start, lt: end } },
    select: { amount: true, date: true, category: true },
    orderBy: { date: "asc" },
  });
}

export interface ForecastSummaries {
  monthly: MonthlySpendingSummary[];
  byCategory: CategoryMonthlySpending[];
}

export async function getForecastSummaries(
  userId: string,
  monthsBack: number = 6,
): Promise<ForecastSummaries> {
  const records = await fetchTrailingExpenseRecords(userId, monthsBack);

  const monthMap = new Map<string, { total: number; count: number }>();
  for (const record of records) {
    const key = monthKeyUtc(record.date);
    const entry = monthMap.get(key) ?? { total: 0, count: 0 };
    entry.total += Number(record.amount);
    entry.count += 1;
    monthMap.set(key, entry);
  }

  const monthly: MonthlySpendingSummary[] = Array.from(monthMap.entries())
    .map(([month, data]) => ({
      month,
      totalMinor: Math.round(data.total * 100),
      transactionCount: data.count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const byCategory: CategoryMonthlySpending[] = records.map((r) => ({
    categoryId: r.category,
    label: r.category,
    month: monthKeyUtc(r.date),
    totalMinor: Math.round(Number(r.amount) * 100),
  }));

  return { monthly, byCategory };
}

export async function getMonthlySpending(
  userId: string,
  monthsBack: number = 6,
): Promise<MonthlySpendingSummary[]> {
  const { monthly } = await getForecastSummaries(userId, monthsBack);
  return monthly;
}

export async function getCategoryMonthlySpending(
  userId: string,
  monthsBack: number = 6,
): Promise<CategoryMonthlySpending[]> {
  const { byCategory } = await getForecastSummaries(userId, monthsBack);
  return byCategory;
}
