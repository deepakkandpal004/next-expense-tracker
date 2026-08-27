'use server';

import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import type { ResolvedPeriod } from '@/lib/domain/types';
import { CATEGORY_DEFINITIONS } from '@/lib/domain/categories';
import { getCache, setCache, CacheKey } from '@/lib/cache';
import { monthKeyUtc } from '@/lib/utils/date-boundaries';

export interface MonthlyReportRow {
  month: string;
  incomeMinor: number;
  expenseMinor: number;
  netMinor: number;
  transactionCount: number;
}

export interface CategoryReportRow {
  categoryId: string;
  label: string;
  iconName: string;
  amountMinor: number;
  percentage: number;
  transactionCount: number;
}

export interface ReportData {
  monthly: MonthlyReportRow[];
  byCategory: CategoryReportRow[];
  totalIncomeMinor: number;
  totalExpenseMinor: number;
  netMinor: number;
}

function monthRange(monthsBack: number): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - monthsBack, 1));
  return { start, end };
}

async function fetchReportData(
  userId: string,
  monthsBack: number,
): Promise<ReportData> {
  const { start, end } = monthRange(monthsBack);

  const records = await db.record.findMany({
    where: {
      userId,
      date: { gte: start, lt: end },
    },
    select: { amount: true, date: true, type: true, category: true },
    orderBy: { date: 'asc' },
  });

  const monthMap = new Map<string, { income: number; expense: number; count: number }>();
  const catMap = new Map<string, { total: number; count: number }>();
  let totalIncome = 0;
  let totalExpense = 0;

  for (const r of records) {
    const key = monthKeyUtc(r.date);
    const entry = monthMap.get(key) ?? { income: 0, expense: 0, count: 0 };
    const amt = Number(r.amount);
    if (r.type === 'income') {
      entry.income += amt;
      totalIncome += amt;
    } else {
      entry.expense += amt;
      totalExpense += amt;
    }
    entry.count += 1;
    monthMap.set(key, entry);

    if (r.type === 'expense') {
      const cat = catMap.get(r.category) ?? { total: 0, count: 0 };
      cat.total += amt;
      cat.count += 1;
      catMap.set(r.category, cat);
    }
  }

  const monthly: MonthlyReportRow[] = Array.from(monthMap.entries())
    .map(([month, d]) => ({
      month,
      incomeMinor: Math.round(d.income * 100),
      expenseMinor: Math.round(d.expense * 100),
      netMinor: Math.round((d.income - d.expense) * 100),
      transactionCount: d.count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const defLookup = (categoryId: string): { label: string; lucideIcon: string } | undefined => {
    const def = CATEGORY_DEFINITIONS.find(d => d.id === categoryId);
    return def ? { label: def.label, lucideIcon: def.lucideIcon } : undefined;
  };
  const byCategory: CategoryReportRow[] = Array.from(catMap.entries())
    .map(([id, d]) => {
      const def = defLookup(id);
      return {
        categoryId: id,
        label: def?.label ?? id,
        iconName: def?.lucideIcon ?? 'Shapes',
        amountMinor: Math.round(d.total * 100),
        percentage: totalExpense > 0 ? d.total / totalExpense : 0,
        transactionCount: d.count,
      };
    })
    .sort((a, b) => b.amountMinor - a.amountMinor);

  return {
    monthly,
    byCategory,
    totalIncomeMinor: Math.round(totalIncome * 100),
    totalExpenseMinor: Math.round(totalExpense * 100),
    netMinor: Math.round((totalIncome - totalExpense) * 100),
  };
}

export async function getReportData(
  _period: ResolvedPeriod,
  monthsBack: number = 12,
): Promise<ReportData> {
  const user = await getAuthUser();
  if (!user) {
    return { monthly: [], byCategory: [], totalIncomeMinor: 0, totalExpenseMinor: 0, netMinor: 0 };
  }
  return getCachedReportData(user.id, monthsBack);
}

export async function getCachedReportData(
  userId: string,
  monthsBack: number = 12,
): Promise<ReportData> {
  const key = CacheKey.report(userId, monthsBack);
  const cached = await getCache<ReportData>(key);
  if (cached) return cached;
  const data = await fetchReportData(userId, monthsBack);
  await setCache(key, data, 60 * 5);
  return data;
}
