import type { ResolvedPeriod } from "./types";

/**
 * Deterministic "Can I Afford This?" engine.
 *
 * This module computes the impact of a single planned purchase on the funds
 * you can already spend safely this period. Every figure is computed entirely
 * from the app-led Safe-to-Spend breakdown and recorded goal/emergency data.
 * The AI layer (see lib/ai.ts) may only *narrate* a verdict over these numbers,
 * never recompute them.
 *
 * Figures returned:
 *   - after-purchase balance = Safe-to-Spend − purchase price
 *   - goal impact = purchase price measured in months of current goal savings
 *   - emergency buffer status = balance vs a 3-month buffer target
 */

export type EmergencyBufferStatus = "no-goal" | "on-track" | "below-target";

export interface CanAffordInputs {
  currency: string;
  period: ResolvedPeriod;
  /** The computed Safe-to-Spend figure from lib/domain/safe-to-spend.ts, in minor units. */
  safeToSpendMinor: number;
  /** Total monthly contribution currently reserved for goals, in minor units. */
  monthlyGoalContributionMinor: number;
  /** Sum of user goal balances in the "safety" (emergency) category, in minor units. */
  emergencyBalanceMinor: number;
  /** The emergency buffer target (months of average spend), in minor units. */
  emergencyTargetMinor: number;
}

export interface CanAffordBreakdown {
  currency: string;
  period: ResolvedPeriod;
  priceMinor: number;
  safeToSpendMinor: number;
  afterPurchaseMinor: number;
  isAffordable: boolean;
  /** Months of current goal savings the purchase price would displace; null when no goal savings exist. */
  goalImpactMonths: number | null;
  emergencyStatus: EmergencyBufferStatus;
  emergencyBalanceMinor: number;
  emergencyTargetMinor: number;
}

/**
 * Deterministic impact of a purchase priced at `priceMinor`. The engine never
 * performs currency conversion and never consults the AI provider.
 */
export function computeCanAfford(
  priceMinor: number,
  input: CanAffordInputs,
): CanAffordBreakdown {
  const price = Math.max(0, Math.round(priceMinor));
  const monthlyGoalContributionMinor = Math.max(0, Math.round(input.monthlyGoalContributionMinor));

  const afterPurchaseMinor = Math.round(input.safeToSpendMinor - price);
  const isAffordable = afterPurchaseMinor >= 0;

  const goalImpactMonths =
    price > 0 && monthlyGoalContributionMinor > 0
      ? Math.max(1, Math.round(price / monthlyGoalContributionMinor))
      : null;

  const hasEmergencyGoal = input.emergencyBalanceMinor > 0;
  const emergencyStatus: EmergencyBufferStatus = !hasEmergencyGoal
    ? "no-goal"
    : input.emergencyBalanceMinor >= input.emergencyTargetMinor
      ? "on-track"
      : "below-target";

  return {
    currency: input.currency,
    period: input.period,
    priceMinor: price,
    safeToSpendMinor: Math.round(input.safeToSpendMinor),
    afterPurchaseMinor,
    isAffordable,
    goalImpactMonths,
    emergencyStatus,
    emergencyBalanceMinor: Math.round(input.emergencyBalanceMinor),
    emergencyTargetMinor: Math.round(input.emergencyTargetMinor),
  };
}