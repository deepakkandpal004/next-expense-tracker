'use server';

import { getAuthUser } from "@/src/modules/auth";
import { CacheKey, deleteCache, deleteCacheByPattern } from "@/src/common/cache";
import { saveBudgetForUser } from "@/src/modules/budgets/infrastructure/budgets.repository";
import type { ActionResult, Budget } from "@/lib/domain/types";
import { createActionBoundary, invalid, parsed, type ParseResult } from "@/lib/server/action-boundary";
import { revalidatePath } from "next/cache";

const BUDGET_AMOUNT_MAX = 999_999_999.99;

export interface SetBudgetRequest {
  amount: unknown;
  effectiveFrom: unknown;
  currency: unknown;
}

export interface SetBudgetCommand {
  amountMinor: number;
  effectiveFrom: string;
  currency: string;
}

type BudgetField = "amount" | "effectiveFrom" | "currency";
export type SetBudgetData = Budget;
export type SetBudgetResult = ActionResult<SetBudgetData, BudgetField>;

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function isValidCalendarDate(value: string): boolean {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day <= lastDay;
}

function parseAmount(value: unknown): number | undefined {
  const numeric = typeof value === "string" ? Number(value.trim()) : typeof value === "number" ? value : NaN;
  return Number.isFinite(numeric) && numeric > 0 && numeric <= BUDGET_AMOUNT_MAX ? numeric : undefined;
}

const run = createActionBoundary({ authenticate: getAuthUser, revalidate: revalidatePath, reportError: (scope, error) => console.error(`${scope} action failed`, error) });

function parseRequest(input: SetBudgetRequest): ParseResult<SetBudgetCommand, BudgetField> {
  const amount = parseAmount(input.amount);
  const effectiveFrom = typeof input.effectiveFrom === "string" ? input.effectiveFrom : "";
  const currency = typeof input.currency === "string" && input.currency.trim() ? input.currency.trim().toUpperCase() : undefined;
  const fieldErrors: Partial<Record<BudgetField, string[]>> = {};
  if (amount === undefined) fieldErrors.amount = [`Enter a budget amount greater than 0 and no more than ${BUDGET_AMOUNT_MAX}.`];
  if (!isValidCalendarDate(effectiveFrom)) fieldErrors.effectiveFrom = ["Enter a valid calendar date in YYYY-MM-DD format."];
  if (!currency) fieldErrors.currency = ["Choose a supported currency."];
  if (Object.keys(fieldErrors).length > 0) return invalid(fieldErrors, "Correct the highlighted budget fields.");
  return parsed({ amountMinor: Math.round(amount! * 100), effectiveFrom, currency: currency! });
}

export async function setBudgetResult(input: SetBudgetRequest): Promise<SetBudgetResult> {
  return run({
    scope: "budget",
    input,
    parse: parseRequest,
    execute: async (actor, command): Promise<SetBudgetData> => {
      const result = await saveBudgetForUser(actor.userId, {
        amountMinor: command.amountMinor,
        cadence: "monthly",
        effectiveFrom: command.effectiveFrom,
        currency: command.currency,
      });
      await Promise.all([
        deleteCache(CacheKey.budget(actor.userId)),
        deleteCacheByPattern(CacheKey.userAllPattern(actor.userId)),
      ]);
      return result;
    },
    message: "Budget saved.",
    revalidatePaths: ["/", "/dashboard", "/budgets"],
  });
}
