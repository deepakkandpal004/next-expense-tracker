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

export async function getMonthlySpending(
  userId: string,
  monthsBack: number = 6,
): Promise<MonthlySpendingSummary[]> {
  const { start, end } = monthRange(monthsBack);

  const records = await db.record.findMany({
    where: {
      userId,
      type: "expense",
      date: { gte: start, lt: end },
    },
    select: { amount: true, date: true },
    orderBy: { date: "asc" },
  });

  const monthMap = new Map<string, { total: number; count: number }>();

  for (const record of records) {
    const key = `${record.date.getUTCFullYear()}-${String(record.date.getUTCMonth() + 1).padStart(2, "0")}`;
    const entry = monthMap.get(key) ?? { total: 0, count: 0 };
    entry.total += record.amount;
    entry.count += 1;
    monthMap.set(key, entry);
  }

  return Array.from(monthMap.entries())
    .map(([month, data]) => ({
      month,
      totalMinor: Math.round(data.total * 100),
      transactionCount: data.count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export async function getCategoryMonthlySpending(
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
}
