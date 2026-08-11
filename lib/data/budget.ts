import { cache } from "react";
import type { Budget as PrismaBudget } from "@prisma/client";

import { db } from "../db";
import type { Budget, CurrencyCode, ResolvedPeriod } from "../domain/types";

export interface SaveBudgetInput {
  amountMinor: number;
  cadence: "monthly";
  effectiveFrom: string;
  currency: CurrencyCode;
}

function startOfUtcDay(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function endOfUtcDay(date: string): Date {
  return new Date(`${date}T23:59:59.999Z`);
}

function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

function fromMinorUnits(amountMinor: number): number {
  return amountMinor / 100;
}

export function toDomainBudget(budget: PrismaBudget): Budget {
  return {
    id: budget.id,
    userId: budget.userId,
    amountMinor: toMinorUnits(budget.amount),
    cadence: "monthly",
    effectiveFrom: budget.effectiveFrom.toISOString().slice(0, 10),
    currency: budget.currency,
  };
}

export const getBudgetForUser = cache(async function getBudgetForUser(
  userId: string,
  period: ResolvedPeriod,
): Promise<Budget | null> {
  const budget = await db.budget.findFirst({
    where: { userId, cadence: "monthly", effectiveFrom: { lte: endOfUtcDay(period.end) } },
    orderBy: { effectiveFrom: "desc" },
  });
  return budget ? toDomainBudget(budget) : null;
});

export async function saveBudgetForUser(
  userId: string,
  input: SaveBudgetInput,
): Promise<Budget> {
  if (!Number.isSafeInteger(input.amountMinor) || input.amountMinor <= 0) {
    throw new RangeError("Budget amount must be a positive integer number of minor units.");
  }

  const effectiveFrom = startOfUtcDay(input.effectiveFrom);
  if (Number.isNaN(effectiveFrom.getTime())) {
    throw new RangeError("Budget effective date must be a valid ISO date.");
  }

  const budget = await db.budget.upsert({
    where: {
      userId_cadence_effectiveFrom: {
        userId,
        cadence: input.cadence,
        effectiveFrom,
      },
    },
    create: {
      userId,
      amount: fromMinorUnits(input.amountMinor),
      cadence: input.cadence,
      effectiveFrom,
      currency: input.currency,
    },
    update: {
      amount: fromMinorUnits(input.amountMinor),
      currency: input.currency,
    },
  });
  return toDomainBudget(budget);
}
