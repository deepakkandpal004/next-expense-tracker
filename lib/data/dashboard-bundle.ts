import { db } from "../db";
import { getCachedDashboardData } from "./dashboard";
import type { DashboardDTO } from "../domain/dashboard";
import { getForecastSummaries } from "./forecast";
import { getBudgetForUser } from "./budget";
import { boundaryAtStart, boundaryAtEnd } from "../utils/date-boundaries";
import type { ResolvedPeriod } from "../domain/types";
import { computeSafeToSpend } from "../domain/safe-to-spend";
import {
  computeUpcomingBillsMinor,
  goalReservationMinor,
  recurringMonthlyExpenseMinor,
} from "./safe-to-spend";
import { computeSpendingForecast, computeCategoryAverages } from "../domain/forecast";
import { computeCashFlowProjection, type CashFlowProjection } from "../domain/cash-flow";
import { buildScheduledEvents } from "./cash-flow";
import { computeSmartPacingAlerts, type SmartPacingReport } from "../domain/smart-alerts";
import { getCache, setCache, CacheKey } from "../cache";
import { daysInResolvedPeriod } from "../domain/reporting-period";
import { periodDays, remainingDaysFromTomorrow, monthKeyUtc, trailingMonths } from "../utils/date-boundaries";
import type { SafeToSpendBreakdown } from "../domain/safe-to-spend";

/**
 * Optimized dashboard bundle — single batched fetch instead of 4 independent
 * widget queries. Before: 15 DB round-trips (dashboard 2 + safeToSpend 4 + cashFlow 6 + smartAlerts 2 + duplicate forecasts).
 * After: ~6 round-trips batched via Promise.all, with shared forecast & shared recurring/goals.
 * Results are cached per-widget keys so subsequent hits are Redis-only.
 */
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
  // 1. Try full bundle cache first
  const bundleKey = `app:dashboard-bundle:${userId}:${period.start}_${period.end}`;
  const cached = await getCache<DashboardBundle>(bundleKey);
  if (cached) return cached;

  // 2. Batched fetch — all independent sources in one Promise.all
  const [dashboard, periodRecordsRaw, allRecurring, allGoals, forecastData, budget] =
    await Promise.all([
      getCachedDashboardData(userId, period, currency),
      // Single period records fetch shared by safeToSpend + cashFlow + smartAlerts
      db.record.findMany({
        where: { userId, date: { gte: boundaryAtStart(period.start), lte: boundaryAtEnd(period.end) } },
        select: { amount: true, type: true, category: true, date: true },
      }),
      db.recurringRecord.findMany({
        where: { userId },
        select: {
          id: true,
          amount: true,
          type: true,
          frequency: true,
          interval: true,
          startDate: true,
          lastProcessed: true,
          endDate: true,
          active: true,
        },
      }),
      db.goal.findMany({
        where: { userId },
        select: { monthlyContribution: true, currentAmount: true, targetAmount: true, deadline: true },
      }),
      getForecastSummaries(userId, 6),
      getBudgetForUser(userId, period),
    ]);

  // --- Safe-to-Spend derived from shared data ---
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
    currency,
    period,
    currentBalanceMinor: balanceMinor,
    upcomingBillsMinor,
    goalContributionMinor,
    expectedRemainingExpensesMinor: expectedExpensesMinor,
    remainingDays,
  });

  // --- Cash-flow derived from shared data ---
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
    categoryId: a.categoryId,
    label: a.label,
    averageMonthlyMinor: a.averageMinor,
    periodSpendMinor: spendByCategory.get(a.categoryId) ?? 0,
    transactionCount: a.transactionCount,
  }));
  let cashFlow: CashFlowProjection = computeCashFlowProjection({
    currency,
    period,
    today,
    records: recordInputs,
    events,
    dailyVariableSpendMinor,
    goalContributionMinor: cashGoalContribution,
    categoryAverages,
    budgetMinor: budget ? budget.amountMinor : null,
  });
  if (periodEnded) {
    const endBalance = cashFlow.daily[cashFlow.daily.length - 1]?.balanceMinor ?? 0;
    cashFlow = {
      ...cashFlow,
      state: "ended",
      daysRemaining: 0,
      daily: cashFlow.daily.map((p) => ({ ...p, state: "recorded" as const })),
      projectedMonthEndMinor: endBalance,
      currentBalanceMinor: endBalance,
      projectedIncomeMinor: cashFlow.actualIncomeMinor,
      projectedSpendMinor: cashFlow.actualSpendMinor,
      alerts: [],
    };
  }

  // --- Smart pacing derived from shared period records + trailing history ---
  // Need separate 6-month trailing history — fetch now (cannot be deduped with forecast range which ends at month start)
  const SMART_HISTORY = 6;
  const historyRecords = await db.record.findMany({
    where: {
      userId,
      type: "expense",
      date: {
        gte: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - SMART_HISTORY, 1)),
        lt: boundaryAtStart(period.start),
      },
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
    period,
    today,
    spendToDateByCategory,
    historyMonthlyTotals,
  });

  const bundle: DashboardBundle = { dashboard, safeToSpend, cashFlow, smartPacing };

  // Populate per-widget caches for backward-compat callers and set bundle cache
  await Promise.all([
    setCache(bundleKey, bundle, 60 * 5),
    setCache(CacheKey.safeToSpend(userId, `${period.start}_${period.end}`), safeToSpend, 60 * 5),
    setCache(CacheKey.cashFlow(userId, `${period.start}_${period.end}`), cashFlow, 60 * 5),
    setCache(CacheKey.smartAlerts(userId, `${period.start}_${period.end}`), smartPacing, 60 * 5),
  ]);

  return bundle;
}
