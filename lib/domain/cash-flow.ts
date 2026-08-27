import { daysInResolvedPeriod } from "./reporting-period";
import type { ResolvedPeriod, TransactionType } from "./types";

/**
 * Deterministic cash-flow projection engine.
 *
 * Produces a day-by-day balance trajectory from the start of a reporting
 * period through its end. Days up to and including today use recorded
 * transactions; future days apply scheduled recurring events plus a daily
 * variable-spend allowance. This module never calls an AI provider — the
 * projection is an authoritative app figure (see DESIGN.md rule 3):
 *
 *   balance(d) = balance(d-1) + scheduledIncome(d) - scheduledExpenditure(d)
 *                - dailyVariableSpend - dailyGoalContribution
 */

export type CashFlowState = "projected" | "ended";

export interface CashFlowEvent {
  /** ISO date (YYYY-MM-DD) on which the event lands, strictly after today. */
  date: string;
  type: TransactionType;
  amountMinor: number;
  sourceId: string;
}

export interface CashFlowDailyPoint {
  /** ISO date (YYYY-MM-DD). */
  date: string;
  /** Day-of-period x-axis label. */
  label: string;
  balanceMinor: number;
  state: "recorded" | "projected";
}

export interface CashFlowCategoryAverage {
  categoryId: string;
  label: string;
  averageMonthlyMinor: number;
  /** Recorded spend in the current period to date (used for the pacing alert). */
  periodSpendMinor: number;
  transactionCount: number;
}

export interface CashFlowAlert {
  kind: "budget-exceeded" | "category-pacing";
  /** Display-ready summary; exact figures are in amountMinor. */
  title: string;
  amountMinor: number;
  categoryId?: string;
}

export interface CashFlowProjection {
  state: CashFlowState;
  currency: string;
  period: ResolvedPeriod;
  today: string;
  daysInPeriod: number;
  daysRemaining: number;
  currentBalanceMinor: number;
  projectedMonthEndMinor: number;
  actualIncomeMinor: number;
  actualSpendMinor: number;
  projectedIncomeMinor: number;
  projectedSpendMinor: number;
  daily: readonly CashFlowDailyPoint[];
  alerts: readonly CashFlowAlert[];
  budgetMinor: number | null;
}

export interface CashFlowEngineInput {
  currency: string;
  period: ResolvedPeriod;
  /** UTC calendar date (YYYY-MM-DD) treated as "now"; inclusive for recorded data. */
  today: string;
  records: readonly { date: string; type: TransactionType; amountMinor: number }[];
  /** Scheduled recurring occurrences strictly after today, at or before period end. */
  events: readonly CashFlowEvent[];
  /** Residual (non-recurring) expected daily spend applied to future days. */
  dailyVariableSpendMinor: number;
  /** Total declared monthly goal contribution, spread across remaining days. */
  goalContributionMinor: number;
  categoryAverages: readonly CashFlowCategoryAverage[];
  budgetMinor: number | null;
}

function dayNumber(date: string): string {
  return String(Number(date.slice(8, 10)));
}

function startIndexForToday(period: ResolvedPeriod, today: string, days: number): number {
  const start = new Date(`${period.start}T00:00:00Z`).getTime();
  const todayMs = new Date(`${today}T00:00:00Z`).getTime();
  if (todayMs < start) return -1;
  const index = Math.round((todayMs - start) / (24 * 60 * 60 * 1000));
  return Math.max(-1, Math.min(index, days - 1));
}

export function computeCashFlowProjection(input: CashFlowEngineInput): CashFlowProjection {
  const { currency, period, today, events, budgetMinor } = input;

  const days = daysInResolvedPeriod(period);
  const startMs = new Date(`${period.start}T00:00:00Z`).getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  const dates: string[] = new Array(days);
  for (let index = 0; index < days; index += 1) {
    dates[index] = new Date(startMs + index * dayMs).toISOString().slice(0, 10);
  }

  // Aggregate recorded income/expenditure by date (UTC calendar day).
  const incomeByDate = new Map<string, number>();
  const spendByDate = new Map<string, number>();
  for (const record of input.records) {
    const date = record.date.slice(0, 10);
    const bucket = record.type === "income" ? incomeByDate : spendByDate;
    bucket.set(date, (bucket.get(date) ?? 0) + record.amountMinor);
  }

  // Aggregate scheduled recurring events by date.
  const eventIncomeByDate = new Map<string, number>();
  const eventSpendByDate = new Map<string, number>();
  for (const event of events) {
    const bucket = event.type === "income" ? eventIncomeByDate : eventSpendByDate;
    bucket.set(event.date, (bucket.get(event.date) ?? 0) + event.amountMinor);
  }

  const todayIndex = startIndexForToday(period, today, days);
  const remainingDays = todayIndex >= 0 ? days - 1 - todayIndex : days;
  const dailyGoal =
    remainingDays > 0 ? Math.floor(input.goalContributionMinor / remainingDays) : 0;

  let balance = 0;
  let actualIncome = 0;
  let actualSpend = 0;
  let projectedIncome = 0;
  let projectedSpend = 0;
  let currentBalanceMinor = 0;
  const daily: CashFlowDailyPoint[] = [];

  for (let index = 0; index < days; index += 1) {
    const date = dates[index];
    const isRecorded = index <= todayIndex;

    const realizedIncome = incomeByDate.get(date) ?? 0;
    const realizedSpend = spendByDate.get(date) ?? 0;

    if (isRecorded) {
      balance += realizedIncome - realizedSpend;
      actualIncome += realizedIncome;
      actualSpend += realizedSpend;
      currentBalanceMinor = balance;
      daily.push({ date, label: dayNumber(date), balanceMinor: Math.round(balance), state: "recorded" });
    } else {
      const scheduledIn = eventIncomeByDate.get(date) ?? 0;
      const scheduledOut = eventSpendByDate.get(date) ?? 0;
      balance += scheduledIn - scheduledOut - input.dailyVariableSpendMinor - dailyGoal;
      projectedIncome += scheduledIn;
      projectedSpend += scheduledOut + input.dailyVariableSpendMinor + dailyGoal;
      daily.push({ date, label: dayNumber(date), balanceMinor: Math.round(balance), state: "projected" });
    }
  }

  const projectedMonthEndMinor = Math.round(daily[days - 1]?.balanceMinor ?? currentBalanceMinor);

  const alerts = buildCashFlowAlerts({
    budgetMinor,
    projectedSpendMinor: Math.round(actualSpend + projectedSpend),
    remainingDays,
    categoryAverages: input.categoryAverages,
  });

  return {
    state: "projected",
    currency,
    period,
    today,
    daysInPeriod: days,
    daysRemaining: remainingDays,
    currentBalanceMinor: Math.round(currentBalanceMinor),
    projectedMonthEndMinor,
    actualIncomeMinor: Math.round(actualIncome),
    actualSpendMinor: Math.round(actualSpend),
    projectedIncomeMinor: Math.round(projectedIncome),
    projectedSpendMinor: Math.round(projectedSpend),
    daily,
    alerts,
    budgetMinor,
  };
}

export function buildCashFlowAlerts(input: {
  budgetMinor: number | null;
  projectedSpendMinor: number;
  remainingDays: number;
  categoryAverages: readonly CashFlowCategoryAverage[];
}): CashFlowAlert[] {
  const alerts: CashFlowAlert[] = [];

  if (input.budgetMinor !== null && input.projectedSpendMinor > input.budgetMinor) {
    alerts.push({
      kind: "budget-exceeded",
      title: "projected spending will exceed your monthly budget",
      amountMinor: input.projectedSpendMinor - input.budgetMinor,
    });
  }

  // Category pacing: the single largest projected overrun beyond a category's
  // own typical monthly spend. Uses recorded spend to date plus the category's
  // own historical daily rate for the remaining days.
  let leader: { categoryId: string; label: string; amountMinor: number } | null = null;
  for (const category of input.categoryAverages) {
    if (category.transactionCount < 2 || category.averageMonthlyMinor <= 0) continue;
    const typicalDaily = category.averageMonthlyMinor / 30.4;
    const projected =
      category.periodSpendMinor + typicalDaily * input.remainingDays;
    const over = Math.round(projected - category.averageMonthlyMinor);
    if (over <= 0) continue;
    if (!leader || over > leader.amountMinor) {
      leader = { categoryId: category.categoryId, label: category.label, amountMinor: over };
    }
  }
  if (leader) {
    alerts.push({
      kind: "category-pacing",
      title: `${leader.label} is pacing past its typical month`,
      amountMinor: leader.amountMinor,
      categoryId: leader.categoryId,
    });
  }

  return alerts;
}

export function safeRecordForProjection(record: {
  date: Date;
  type: string;
  amount: number;
}): { date: string; type: TransactionType; amountMinor: number } {
  return {
    date: record.date.toISOString().slice(0, 10),
    type: record.type === "income" ? "income" : "expense",
    amountMinor: Math.round(Number(record.amount) * 100),
  };
}