import type { ResolvedPeriod } from "./types";

/**
 * Deterministic "Safe to Spend" engine.
 *
 * This module owns the only financial formula in the product. The number is
 * computed entirely from recorded data and scheduled obligations; the AI layer
 * (see lib/ai.ts) may only *explain* the result, never compute it.
 *
 * Formula:
 *   Safe-to-Spend = Current balance
 *                   − Upcoming bills
 *                   − Goal contributions
 *                   − Expected expenses for the rest of the period
 */

export type SafeToSpendLineKind = "current-balance" | "reservation" | "result";

export interface SafeToSpendLine {
  key: "current-balance" | "upcoming-bills" | "goal-contributions" | "expected-expenses" | "safe-to-spend";
  label: string;
  amountMinor: number;
  kind: SafeToSpendLineKind;
  /** When true, this line is subtracted from the running total instead of added. */
  subtracts: boolean;
}

export interface SafeToSpendBreakdown {
  currency: string;
  period: ResolvedPeriod;
  balanceMinor: number;
  upcomingBillsMinor: number;
  goalContributionMinor: number;
  expectedExpensesMinor: number;
  reservedMinor: number;
  safeToSpendMinor: number;
  /** Days left in the period after today (0 when the period has ended). */
  remainingDays: number;
  /** Negative safe-to-spend is a deficit, displayed as over-budget, not a number. */
  isDeficit: boolean;
  lines: readonly SafeToSpendLine[];
}

export interface SafeToSpendInputs {
  currency: string;
  period: ResolvedPeriod;
  currentBalanceMinor: number;
  upcomingBillsMinor: number;
  goalContributionMinor: number;
  expectedRemainingExpensesMinor: number;
  remainingDays: number;
}

function minorLine(
  key: SafeToSpendLine["key"],
  label: string,
  amountMinor: number,
  kind: SafeToSpendLineKind,
  subtracts: boolean,
): SafeToSpendLine {
  return { key, label, amountMinor, kind, subtracts };
}

export function computeSafeToSpend(input: SafeToSpendInputs): SafeToSpendBreakdown {
  const { currency, currentBalanceMinor } = input;

  const upcomingBillsMinor = Math.max(0, Math.round(input.upcomingBillsMinor));
  const goalContributionMinor = Math.max(0, Math.round(input.goalContributionMinor));
  const expectedExpensesMinor = Math.max(0, Math.round(input.expectedRemainingExpensesMinor));

  const reservedMinor = upcomingBillsMinor + goalContributionMinor + expectedExpensesMinor;
  const safeToSpendMinor = Math.round(currentBalanceMinor - reservedMinor);

  const lines: SafeToSpendLine[] = [
    minorLine("current-balance", "Current balance", currentBalanceMinor, "current-balance", false),
    minorLine("upcoming-bills", "Upcoming bills", upcomingBillsMinor, "reservation", true),
    minorLine("goal-contributions", "Reserved for goals", goalContributionMinor, "reservation", true),
    minorLine("expected-expenses", "Expected expenses", expectedExpensesMinor, "reservation", true),
    minorLine("safe-to-spend", "Safe to spend", safeToSpendMinor, "result", false),
  ];

  return {
    currency,
    period: input.period,
    balanceMinor: currentBalanceMinor,
    upcomingBillsMinor,
    goalContributionMinor,
    expectedExpensesMinor,
    reservedMinor,
    safeToSpendMinor,
    remainingDays: input.remainingDays,
    isDeficit: safeToSpendMinor < 0,
    lines,
  };
}

export function isSafeToSpendInsufficientData(breakdown: SafeToSpendBreakdown): boolean {
  return (
    breakdown.period.start > breakdown.period.end ||
    breakdown.remainingDays < 0
  );
}