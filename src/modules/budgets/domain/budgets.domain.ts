import { z } from "zod";

/**
 * Budgets domain — validation & value objects.
 * Pure, no DB.
 */

export const BUDGET_AMOUNT_MAX = 999_999_999.99;

export const budgetAmountSchema = z
  .number()
  .positive("Enter a budget amount greater than 0")
  .max(BUDGET_AMOUNT_MAX, `Enter a budget amount no more than ${BUDGET_AMOUNT_MAX}`);

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid calendar date in YYYY-MM-DD format")
  .refine((v) => {
    const [y, m, d] = v.split("-").map(Number);
    if (y < 1 || m < 1 || m > 12 || d < 1) return false;
    const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
    return d <= last;
  }, "Enter a valid calendar date");

export type BudgetCurrency = string;

export interface SaveBudgetInput {
  amountMinor: number;
  cadence: "monthly";
  effectiveFrom: string;
  currency: BudgetCurrency;
}

import { Decimal } from "@prisma/client/runtime/library";
export function toMinorUnits(amount: number | Decimal | string): number {
  return Math.round(Number(amount) * 100);
}

export function fromMinorUnits(minor: number): number {
  return minor / 100;
}
