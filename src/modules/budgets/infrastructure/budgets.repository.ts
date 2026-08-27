import type { Budget as PrismaBudget } from "@prisma/client";
import { db } from "@/src/database/client";
import type { Budget, CurrencyCode, ResolvedPeriod } from "@/lib/domain/types";
import { startOfUtcDay, endOfUtcDay } from "@/src/common/utils/date";
import { fromMinorUnits, toMinorUnits } from "@/src/modules/budgets/domain/budgets.domain";

/**
 * Budgets repository — Prisma access.
 * Previously lib/data/budget.ts
 */

export function toDomainBudget(b: PrismaBudget): Budget {
  return {
    id: b.id,
    userId: b.userId,
    amountMinor: toMinorUnits(b.amount),
    cadence: "monthly",
    effectiveFrom: b.effectiveFrom.toISOString().slice(0, 10),
    currency: b.currency,
  };
}

export async function getBudgetForUser(userId: string, period: ResolvedPeriod): Promise<Budget | null> {
  const budget = await db.budget.findFirst({
    where: { userId, cadence: "monthly", effectiveFrom: { lte: endOfUtcDay(period.end) } },
    orderBy: { effectiveFrom: "desc" },
  });
  return budget ? toDomainBudget(budget) : null;
}

export async function saveBudgetForUser(
  userId: string,
  input: { amountMinor: number; cadence: "monthly"; effectiveFrom: string; currency: CurrencyCode },
): Promise<Budget> {
  if (!Number.isSafeInteger(input.amountMinor) || input.amountMinor <= 0) {
    throw new RangeError("Budget amount must be a positive integer number of minor units.");
  }
  const effectiveFrom = startOfUtcDay(input.effectiveFrom);
  if (Number.isNaN(effectiveFrom.getTime())) throw new RangeError("Budget effective date must be a valid ISO date.");
  const budget = await db.budget.upsert({
    where: { userId_cadence_effectiveFrom: { userId, cadence: input.cadence, effectiveFrom } },
    create: {
      userId,
      amount: fromMinorUnits(input.amountMinor),
      cadence: input.cadence,
      effectiveFrom,
      currency: input.currency,
    },
    update: { amount: fromMinorUnits(input.amountMinor), currency: input.currency },
  });
  return toDomainBudget(budget);
}
