import { db } from "@/src/database/client";
import { computeCanAfford } from "@/src/common/domain/can-i-afford";
import type { CanAffordBreakdown } from "@/src/common/domain/can-i-afford";
import { computeSpendingForecast } from "@/src/common/domain/forecast";
import type { ResolvedPeriod } from "@/src/common/domain/types";
import { getMonthlySpending } from "@/src/modules/reports/infrastructure/forecast.repository";
import { getSafeToSpendData } from "./safe-to-spend.repository";

export const CAN_AFFORD_DEFAULT_CURRENCY = "INR";
export const CAN_AFFORD_EMERGENCY_MONTHS = 3;
export const CAN_AFFORD_EMERGENCY_CATEGORY = "safety";

export async function getEmergencyBalanceMinor(userId: string): Promise<number> {
  const goals = await db.goal.findMany({
    where: { userId, category: CAN_AFFORD_EMERGENCY_CATEGORY },
    select: { currentAmount: true },
  });
  return goals.reduce((acc, goal) => acc + Math.round(Number(goal.currentAmount) * 100), 0);
}

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
    if (Number(goal.currentAmount) >= Number(goal.targetAmount) && Number(goal.targetAmount) > 0) continue;
    if (goal.deadline && goal.deadline.getTime() < now.getTime()) continue;
    total += Math.round(Number(goal.monthlyContribution) * 100);
  }
  return total;
}

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
