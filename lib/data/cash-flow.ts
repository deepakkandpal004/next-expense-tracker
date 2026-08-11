import { cache } from "react";
import { db } from "../db";
import { computeCategoryAverages, computeSpendingForecast } from "../domain/forecast";
import {
  computeCashFlowProjection,
  type CashFlowCategoryAverage,
  type CashFlowEvent,
  type CashFlowProjection,
} from "../domain/cash-flow";
import { daysInResolvedPeriod } from "../domain/reporting-period";
import type { ResolvedPeriod, TransactionType } from "../domain/types";
import { getCategoryMonthlySpending, getMonthlySpending } from "./forecast";
import { getBudgetForUser } from "./budget";
import { goalReservationMinor, recurringMonthlyExpenseMinor } from "./safe-to-spend";

export const CASH_FLOW_DEFAULT_CURRENCY = "INR";

interface RecurringRuleRow {
  id: string;
  amount: number;
  type: string;
  frequency: string;
  interval: number;
  startDate: Date;
  lastProcessed: Date | null;
  endDate: Date | null;
  active: boolean;
}

function boundaryAtStart(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function boundaryAtEnd(date: string): Date {
  return new Date(`${date}T23:59:59.999Z`);
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function nextOccurrence(base: Date, frequency: string, interval: number): Date {
  const next = new Date(base);
  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + interval);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7 * interval);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + interval);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + interval);
      break;
  }
  return next;
}

/**
 * Expands active recurring rules into scheduled events landing strictly after
 * today and at or before the period end. Uses the lastProcessed ?? startDate
 * cursor so occurrences the recurring processor has already created are not
 * re-projected. Iterations are bounded so a single bad row cannot stall the
 * query.
 */
export function buildScheduledEvents(
  rules: readonly RecurringRuleRow[],
  periodEnd: string,
): CashFlowEvent[] {
  const now = new Date();
  const cutoff = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const windowEnd = boundaryAtEnd(periodEnd).getTime();
  const maxIterations = 366;
  const events: CashFlowEvent[] = [];

  for (const rule of rules) {
    if (!rule.active) continue;

    const base = rule.lastProcessed ?? rule.startDate;
    let cursor = base;
    for (let iterations = 0; iterations < maxIterations; iterations += 1) {
      const next = nextOccurrence(cursor, rule.frequency, rule.interval);
      cursor = next;

      if (next.getTime() > windowEnd) break;
      if (rule.endDate && next.getTime() > rule.endDate.getTime()) break;
      if (next.getTime() <= cutoff) continue;

      events.push({
        date: toIsoDate(next),
        type: rule.type === "income" ? "income" : "expense",
        amountMinor: Math.round(rule.amount * 100),
        sourceId: rule.id,
      });
    }
  }

  return events;
}

/**
 * Loads the deterministic day-by-day cash-flow projection for a period.
 *
 * - Recordings up to and including today come from actual records.
 * - Future days apply scheduled recurring events, an average daily
 *   variable-spend allowance, and the declared goal contribution.
 * - A fully elapsed period returns `state: "ended"` with the realized
 *   month-end balance and no forward-looking data.
 */
export const getCashFlowProjection = cache(async function getCashFlowProjection(
  userId: string,
  period: ResolvedPeriod,
  currency: string = CASH_FLOW_DEFAULT_CURRENCY,
): Promise<CashFlowProjection> {
  const now = new Date();
  const today = toIsoDate(now);
  const periodEnded = now.getTime() > boundaryAtEnd(period.end).getTime();

  const [records, recurring, goals, monthlySummaries, categoryMonthly, budget] =
    await Promise.all([
      db.record.findMany({
        where: {
          userId,
          date: { gte: boundaryAtStart(period.start), lte: boundaryAtEnd(period.end) },
        },
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
        select: {
          monthlyContribution: true,
          currentAmount: true,
          targetAmount: true,
          deadline: true,
        },
      }),
      getMonthlySpending(userId, 6),
      getCategoryMonthlySpending(userId, 6),
      getBudgetForUser(userId, period),
    ]);

  const events = buildScheduledEvents(recurring, period.end);

  const recordInputs = recordsToInputs(records);

  const goalContributionMinor = goals.reduce(
    (acc, goal) => acc + goalReservationMinor(goal, now),
    0,
  );

  const forecast = computeSpendingForecast(monthlySummaries);
  const recurringMonthlyMinor = recurringMonthlyExpenseMinor(recurring);
  const variableMonthlyMinor = Math.max(
    0,
    forecast.averageMonthlyMinor - recurringMonthlyMinor,
  );
  const allDays = daysInResolvedPeriod(period);
  const dailyVariableSpendMinor = Math.round(variableMonthlyMinor / allDays);

  const spendByCategory = new Map<string, number>();
  for (const record of records) {
    if (record.type !== "expense") continue;
    const minor = Math.round(record.amount * 100);
    spendByCategory.set(record.category, (spendByCategory.get(record.category) ?? 0) + minor);
  }

  const categoryAverages: CashFlowCategoryAverage[] = computeCategoryAverages(
    categoryMonthly,
  ).map((average) => ({
    categoryId: average.categoryId,
    label: average.label,
    averageMonthlyMinor: average.averageMinor,
    periodSpendMinor: spendByCategory.get(average.categoryId) ?? 0,
    transactionCount: average.transactionCount,
  }));

  const projection = computeCashFlowProjection({
    currency,
    period,
    today,
    records: recordInputs,
    events,
    dailyVariableSpendMinor,
    goalContributionMinor,
    categoryAverages,
    budgetMinor: budget ? budget.amountMinor : null,
  });

  if (!periodEnded) return projection;

  const endBalance =
    projection.daily[projection.daily.length - 1]?.balanceMinor ?? 0;
  return {
    ...projection,
    state: "ended",
    daysRemaining: 0,
    daily: projection.daily.map((point) => ({ ...point, state: "recorded" })),
    projectedMonthEndMinor: endBalance,
    currentBalanceMinor: endBalance,
    projectedIncomeMinor: projection.actualIncomeMinor,
    projectedSpendMinor: projection.actualSpendMinor,
    alerts: [],
  };
});

interface RecordRow {
  amount: number;
  type: string;
  date: Date;
  category: string | null;
}

export function recordsToInputs(
  records: readonly RecordRow[],
): { date: string; type: TransactionType; amountMinor: number }[] {
  return records.map((record) => ({
    date: toIsoDate(record.date),
    type: (record.type === "income" ? "income" : "expense") as TransactionType,
    amountMinor: Math.round(record.amount * 100),
  }));
}