import { Decimal } from "@prisma/client/runtime/library";
import { db } from "@/src/database/client";
import { computeSafeToSpend } from "@/src/common/domain/safe-to-spend";
import type { SafeToSpendBreakdown } from "@/src/common/domain/safe-to-spend";
import type { ResolvedPeriod } from "@/src/common/domain/types";
import { computeSpendingForecast } from "@/src/common/domain/forecast";
import { getMonthlySpending } from "@/src/modules/reports/infrastructure/forecast.repository";
import {
  boundaryAtStart,
  boundaryAtEnd,
  periodDays,
  remainingDaysFromTomorrow,
  nextRecurrenceOccurrence,
} from "@/src/common/utils/date-boundaries";
import { getCache, setCache, CacheKey } from "@/src/common/cache";

export const SAFE_TO_SPEND_DEFAULT_CURRENCY = "INR";

export interface RecurringRule {
  amount: number | Decimal;
  type: string;
  frequency: string;
  interval: number;
  startDate: Date;
  lastProcessed: Date | null;
  endDate: Date | null;
  active: boolean;
}

export interface GoalReservationRow {
  monthlyContribution: number | Decimal | null;
  currentAmount: number | Decimal;
  targetAmount: number | Decimal;
  deadline: Date | null;
}

const nextOccurrence = nextRecurrenceOccurrence;

export function computeUpcomingBillsMinor(
  rules: readonly RecurringRule[],
  periodEnd: string,
): number {
  const now = new Date();
  const cutoff = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const windowEnd = boundaryAtEnd(periodEnd).getTime();
  const maxIterations = 366;

  let total = 0;
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

      if (rule.type === "expense") total += Math.round(Number(rule.amount) * 100);
    }
  }
  return total;
}

export function goalReservationMinor(
  goal: GoalReservationRow,
  now: Date = new Date(),
): number {
  if (goal.monthlyContribution == null) return 0;
  if (Number(goal.currentAmount) >= Number(goal.targetAmount) && Number(goal.targetAmount) > 0) return 0;
  if (goal.deadline && goal.deadline.getTime() < now.getTime()) return 0;
  return Math.max(0, Math.round(Number(goal.monthlyContribution) * 100));
}

export function recurringMonthlyExpenseMinor(
  rules: readonly RecurringRule[],
): number {
  let total = 0;
  for (const rule of rules) {
    if (!rule.active || rule.type !== "expense") continue;
    const amt = Number(rule.amount);
    const cost =
      rule.frequency === "weekly"
        ? (amt * 52) / 12
        : rule.frequency === "daily"
          ? (amt * 365) / 12
          : rule.frequency === "yearly"
            ? amt / 12
            : amt;
    total += cost;
  }
  return Math.round(total * 100);
}

export async function getSafeToSpendData(
  userId: string,
  period: ResolvedPeriod,
  currency: string = SAFE_TO_SPEND_DEFAULT_CURRENCY,
): Promise<SafeToSpendBreakdown> {
  const [records, recurring, goals, monthlySummaries] = await Promise.all([
    db.record.findMany({
      where: {
        userId,
        date: { gte: boundaryAtStart(period.start), lte: boundaryAtEnd(period.end) },
      },
      select: { amount: true, type: true },
    }),
    db.recurringRecord.findMany({
      where: { userId },
      select: {
        amount: true, type: true, frequency: true, interval: true,
        startDate: true, lastProcessed: true, endDate: true, active: true,
      },
    }),
    db.goal.findMany({
      where: { userId },
      select: { monthlyContribution: true, currentAmount: true, targetAmount: true, deadline: true },
    }),
    getMonthlySpending(userId, 6),
  ]);

  const balanceMinor = records.reduce((acc, record) => {
    const minor = Math.round(Number(record.amount) * 100);
    return record.type === "income" ? acc + minor : acc - minor;
  }, 0);

  const upcomingBillsMinor = computeUpcomingBillsMinor(recurring, period.end);
  const goalContributionMinor = goals.reduce(
    (acc, goal) => acc + goalReservationMinor(goal), 0,
  );

  const forecast = computeSpendingForecast(monthlySummaries);
  const averageMonthlyMinor = forecast.averageMonthlyMinor;
  const recurringMonthlyMinor = recurringMonthlyExpenseMinor(recurring);
  const variableMonthlyMinor = Math.max(0, averageMonthlyMinor - recurringMonthlyMinor);

  const allDays = periodDays(period.start, period.end);
  const remainingDays = remainingDaysFromTomorrow(period.end);
  const expectedExpensesMinor = Math.round((variableMonthlyMinor * remainingDays) / allDays);

  return computeSafeToSpend({
    currency, period, currentBalanceMinor: balanceMinor, upcomingBillsMinor,
    goalContributionMinor, expectedRemainingExpensesMinor: expectedExpensesMinor, remainingDays,
  });
}

export async function getCachedSafeToSpendData(
  userId: string,
  period: ResolvedPeriod,
  currency: string = SAFE_TO_SPEND_DEFAULT_CURRENCY,
): Promise<SafeToSpendBreakdown> {
  const key = CacheKey.safeToSpend(userId, `${period.start}_${period.end}`);
  const cached = await getCache<SafeToSpendBreakdown>(key);
  if (cached) return cached;
  const data = await getSafeToSpendData(userId, period, currency);
  await setCache(key, data, 60 * 5);
  return data;
}
