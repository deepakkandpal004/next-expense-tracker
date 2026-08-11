import { cache } from "react";
import { db } from "../db";
import type {
  MonthlySpendingSummary,
  CategoryMonthlySpending,
} from "../domain/forecast";

function monthRange(monthsBack: number): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - monthsBack, 1));
  return { start, end };
}

export const getMonthlySpending = cache(async function getMonthlySpending(
  userId: string,
  monthsBack: number = 6,
): Promise<MonthlySpendingSummary[]> {
  const { start, end } = monthRange(monthsBack);

  const monthlyData = await db.record.groupBy({
    by: ["date"],
    where: {
      userId,
      type: "expense",
      date: { gte: start, lt: end },
    },
    _sum: { amount: true },
    _count: true,
    orderBy: { date: "asc" },
  });

  const monthMap = new Map<string, { total: number; count: number }>();

  for (const item of monthlyData) {
    const date = new Date(item.date);
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    const entry = monthMap.get(key) ?? { total: 0, count: 0 };
    entry.total += item._sum.amount ?? 0;
    entry.count += item._count;
    monthMap.set(key, entry);
  }

  return Array.from(monthMap.entries())
    .map(([month, data]) => ({
      month,
      totalMinor: Math.round(data.total * 100),
      transactionCount: data.count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
});

export const getCategoryMonthlySpending = cache(async function getCategoryMonthlySpending(
  userId: string,
  monthsBack: number = 6,
): Promise<CategoryMonthlySpending[]> {
  const { start, end } = monthRange(monthsBack);

  const records = await db.record.findMany({
    where: {
      userId,
      type: "expense",
      date: { gte: start, lt: end },
    },
    select: { amount: true, date: true, category: true },
    orderBy: { date: "asc" },
  });

  return records.map(r => ({
    categoryId: r.category,
    label: r.category,
    month: `${r.date.getUTCFullYear()}-${String(r.date.getUTCMonth() + 1).padStart(2, "0")}`,
    totalMinor: Math.round(r.amount * 100),
  }));
});
