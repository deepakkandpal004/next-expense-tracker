import { db } from "../db";
import { computeCanAfford } from "../domain/can-i-afford";
import type { CanAffordBreakdown } from "../domain/can-i-afford";
import { computeSpendingForecast } from "../domain/forecast";
import type { ResolvedPeriod } from "../domain/types";
import { getMonthlySpending } from "./forecast";
import { getSafeToSpendData } from "./safe-to-spend";

export const CAN_AFFORD_DEFAULT_CURRENCY = "INR";
export const CAN_AFFORD_EMERGENCY_MONTHS = 3;

/** Category used for emergency ("safety") goals in the Goals UI. */
export const CAN_AFFORD_EMERGENCY_CATEGORY = "safety";

/** Sum of currentAmount for goals in the safety category, in minor units. */
export async function getEmergencyBalanceMinor(userId: string): Promise<number> {
  const goals = await db.goal.findMany({
    where: { userId, category: CAN_AFFORD_EMERGENCY_CATEGORY },
    select: { currentAmount: true },
  });
  return goals.reduce((acc, goal) => acc + Math.round(goal.currentAmount * 100), 0);
}

/** Sum of monthly contributions for still-funding goals, in minor units. */
export async function getTotalGoalContributionMinor(userId: string): Promise<number> {
  const now = new Date();
  const goals = await db.goal.findMany({
    where: { userId },
    select: {
      monthlyContribution: true,
      currentAmount: true,
      targetAmount: true,
      deadline: true,
    },
  });

  let total = 0;
  for (const goal of goals) {
    if (goal.monthlyContribution == null) continue;
    if (goal.currentAmount >= goal.targetAmount && goal.targetAmount > 0) continue;
    if (goal.deadline && goal.deadline.getTime() < now.getTime()) continue;
    total += Math.round(goal.monthlyContribution * 100);
  }
  return total;
}

/**
 * Loads the deterministic "Can I afford this?" impact for an authorized price.
 * Reuses the canonical Safe-to-Spend engine for the app-led baseline, so the
 * affordability figure is always computed the same way the dashboard does.
 * The price in minor units is validated upstream (server action); this loader
 * only reads recorded, app-computed data and never calls the AI provider.
 */
export async function getCanAffordData(
  userId: string,
  period: ResolvedPeriod,
  priceMinor: number,
  currency: string = CAN_AFFORD_DEFAULT_CURRENCY,
): Promise<CanAffordBreakdown> {
  const [safeToSpend, emergencyMinor, goalContributionMinor, monthlySummaries] =
    await Promise.all([
      getSafeToSpendData(userId, period, currency),
      getEmergencyBalanceMinor(userId),
      getTotalGoalContributionMinor(userId),
      getMonthlySpending(userId, 6),
    ]);

  const forecastMonthly = Math.round(computeSpendingForecast(monthlySummaries).averageMonthlyMinor);
  const emergencyTargetMinor = forecastMonthly * CAN_AFFORD_EMERGENCY_MONTHS;

  return computeCanAfford(priceMinor, {
    currency,
    period,
    safeToSpendMinor: safeToSpend.safeToSpendMinor,
    monthlyGoalContributionMinor: goalContributionMinor,
    emergencyBalanceMinor: emergencyMinor,
    emergencyTargetMinor,
  });
}