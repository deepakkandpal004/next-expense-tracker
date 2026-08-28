import { db } from "@/src/database/client";
import { getDashboardData } from "./dashboard.repository";
import type { DashboardDTO } from "@/src/common/domain/dashboard";
import { getForecastSummaries } from "@/src/modules/reports/infrastructure/forecast.repository";
import { getBudgetForUser } from "@/src/modules/budgets/infrastructure/budgets.repository";
import { boundaryAtStart, boundaryAtEnd } from "@/src/common/utils/date-boundaries";
import type { ResolvedPeriod } from "@/src/common/domain/types";
import { computeSafeToSpend } from "@/src/common/domain/safe-to-spend";
import {
  computeUpcomingBillsMinor,
  goalReservationMinor,
  recurringMonthlyExpenseMinor,
} from "./safe-to-spend.repository";
import { computeSpendingForecast, computeCategoryAverages } from "@/src/common/domain/forecast";
import { computeCashFlowProjection, type CashFlowProjection } from "@/src/common/domain/cash-flow";
import { buildScheduledEvents } from "@/src/modules/reports/infrastructure/cash-flow.repository";
import { computeSmartPacingAlerts, type SmartPacingReport } from "@/src/common/domain/smart-alerts";
import { getCache, setCache, CacheKey } from "@/src/common/cache";
import { daysInResolvedPeriod } from "@/src/common/domain/reporting-period";
import { periodDays, remainingDaysFromTomorrow, monthKeyUtc, trailingMonths } from "@/src/common/utils/date-boundaries";
import type { SafeToSpendBreakdown } from "@/src/common/domain/safe-to-spend";

export interface DashboardBundle {
  dashboard: DashboardDTO;
  safeToSpend: SafeToSpendBreakdown;
  cashFlow: CashFlowProjection;
  smartPacing: SmartPacingReport;
}

export async function getDashboardBundle(
  userId: string,
  period: ResolvedPeriod,
  currency: string,
): Promise<DashboardBundle> {
  const bundleKey = `app:dashboard-bundle:${userId}:${period.start}_${period.end}`;
  const cached = await getCache<DashboardBundle>(bundleKey);
  if (cached) return cached;

  const [dashboard, periodRecordsRaw, allRecurring, allGoals, forecastData, budget] =
    await Promise.all([
      getDashboardData(userId, period, currency),
      db.record.findMany({
        where: { userId, date: { gte: boundaryAtStart(period.start), lte: boundaryAtEnd(period.end) } },
        select: { amount: true, type: true, category: true, date: true },
      }),
      db.recurringRecord.findMany({
        where: { userId },
        select: {
          id: true, amount: true, type: true, frequency: true, interval: true,
          startDate: true, lastProcessed: true, endDate: true, active: true,
        },
      }),
      db.goal.findMany({
        where: { userId },
        select: { monthlyContribution: true, currentAmount: true, targetAmount: true, deadline: true },
      }),
      getForecastSummaries(userId, 6),
      getBudgetForUser(userId, period),
    ]);

  const balanceMinor = periodRecordsRaw.reduce((acc, r) => {
    const minor = Math.round(Number(r.amount) * 100);
    return r.type === "income" ? acc + minor : acc - minor;
  }, 0);
  const upcomingBillsMinor = computeUpcomingBillsMinor(allRecurring as never, period.end);
  const goalContributionMinor = allGoals.reduce((acc, g) => acc + goalReservationMinor(g), 0);
  const forecast = computeSpendingForecast(forecastData.monthly);
  const recurringMonthlyMinor = recurringMonthlyExpenseMinor(allRecurring as never);
  const variableMonthlyMinor = Math.max(0, forecast.averageMonthlyMinor - recurringMonthlyMinor);
  const allDays = periodDays(period.start, period.end);
  const remainingDays = remainingDaysFromTomorrow(period.end);
  const expectedExpensesMinor = Math.round((variableMonthlyMinor * remainingDays) / allDays);
  const safeToSpend: SafeToSpendBreakdown = computeSafeToSpend({
    currency, period, currentBalanceMinor: balanceMinor, upcomingBillsMinor,
    goalContributionMinor, expectedRemainingExpensesMinor: expectedExpensesMinor, remainingDays,
  });

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const periodEnded = now.getTime() > boundaryAtEnd(period.end).getTime();
  const events = buildScheduledEvents(allRecurring as never, period.end);
  const recordInputs = periodRecordsRaw.map((r) => ({
    date: r.date.toISOString().slice(0, 10),
    type: (r.type === "income" ? "income" : "expense") as "income" | "expense",
    amountMinor: Math.round(Number(r.amount) * 100),
  }));
  const cashGoalContribution = allGoals.reduce((acc, g) => acc + goalReservationMinor(g, now), 0);
  const recurringMonthlyMinor2 = recurringMonthlyExpenseMinor(allRecurring as never);
  const variableMonthlyMinor2 = Math.max(0, forecast.averageMonthlyMinor - recurringMonthlyMinor2);
  const dailyVariableSpendMinor = Math.round(variableMonthlyMinor2 / daysInResolvedPeriod(period));
  const spendByCategory = new Map<string, number>();
  for (const r of periodRecordsRaw) {
    if (r.type !== "expense") continue;
    spendByCategory.set(r.category, (spendByCategory.get(r.category) ?? 0) + Math.round(Number(r.amount) * 100));
  }
  const categoryAverages = computeCategoryAverages(forecastData.byCategory).map((a) => ({
    categoryId: a.categoryId, label: a.label, averageMonthlyMinor: a.averageMinor,
    periodSpendMinor: spendByCategory.get(a.categoryId) ?? 0, transactionCount: a.transactionCount,
  }));
  let cashFlow: CashFlowProjection = computeCashFlowProjection({
    currency, period, today, records: recordInputs, events, dailyVariableSpendMinor,
    goalContributionMinor: cashGoalContribution, categoryAverages,
    budgetMinor: budget ? budget.amountMinor : null,
  });
  if (periodEnded) {
    const endBalance = cashFlow.daily[cashFlow.daily.length - 1]?.balanceMinor ?? 0;
    cashFlow = {
      ...cashFlow, state: "ended", daysRemaining: 0,
      daily: cashFlow.daily.map((p) => ({ ...p, state: "recorded" as const })),
      projectedMonthEndMinor: endBalance, currentBalanceMinor: endBalance,
      projectedIncomeMinor: cashFlow.actualIncomeMinor, projectedSpendMinor: cashFlow.actualSpendMinor, alerts: [],
    };
  }

  const SMART_HISTORY = 6;
  const historyRecords = await db.record.findMany({
    where: {
      userId, type: "expense",
      date: { gte: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - SMART_HISTORY, 1)), lt: boundaryAtStart(period.start) },
    },
    select: { amount: true, category: true, date: true },
  });
  const spendToDateByCategory: Record<string, number> = {};
  for (const r of periodRecordsRaw) {
    if (r.type !== "expense" || !r.category) continue;
    spendToDateByCategory[r.category] = (spendToDateByCategory[r.category] ?? 0) + Math.round(Number(r.amount) * 100);
  }
  const months = trailingMonths(now, SMART_HISTORY);
  const byCategory = new Map<string, Map<string, number>>();
  for (const cat of new Set(historyRecords.map((r) => r.category).filter(Boolean))) {
    byCategory.set(cat as string, new Map(months.map((m) => [m, 0])));
  }
  for (const r of historyRecords) {
    if (!r.category) continue;
    const bucket = byCategory.get(r.category);
    if (!bucket) continue;
    const key = monthKeyUtc(r.date);
    bucket.set(key, (bucket.get(key) ?? 0) + Math.round(Number(r.amount) * 100));
  }
  const historyMonthlyTotals: Array<{ categoryId: string; month: string; totalMinor: number }> = [];
  for (const [cid, monthly] of byCategory) {
    for (const [month, totalMinor] of monthly) {
      historyMonthlyTotals.push({ categoryId: cid, month, totalMinor });
    }
  }
  const smartPacing: SmartPacingReport = computeSmartPacingAlerts({
    period, today, spendToDateByCategory, historyMonthlyTotals,
  });

  const bundle: DashboardBundle = { dashboard, safeToSpend, cashFlow, smartPacing };

  await Promise.all([
    setCache(bundleKey, bundle, 60 * 5),
    setCache(CacheKey.safeToSpend(userId, `${period.start}_${period.end}`), safeToSpend, 60 * 5),
    setCache(CacheKey.cashFlow(userId, `${period.start}_${period.end}`), cashFlow, 60 * 5),
    setCache(CacheKey.smartAlerts(userId, `${period.start}_${period.end}`), smartPacing, 60 * 5),
  ]);

  return bundle;
}
