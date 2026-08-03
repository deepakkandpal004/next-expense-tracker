import { db } from '../db';

const RATE_TTL_MS = 6 * 60 * 60 * 1000;

let cachedRate: { from: string; to: string; rate: number; fetchedAt: number } | null = null;

/**
 * Returns the exchange rate to convert one unit of `from` into `to`.
 * Uses a free, key-less FX API (open.er-api.com) with a short in-memory cache.
 */
export async function getExchangeRate(from: string, to: string): Promise<number> {
  if (from === to) return 1;

  if (cachedRate && cachedRate.from === from && cachedRate.to === to && Date.now() - cachedRate.fetchedAt < RATE_TTL_MS) {
    return cachedRate.rate;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(from)}`, {
      signal: controller.signal,
      headers: { accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`FX API responded with ${response.status}`);
    }
    const payload = (await response.json()) as { result?: string; rates?: Record<string, number> };
    const rate = payload.rates?.[to];
    if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
      throw new Error(`No exchange rate available for ${from} -> ${to}`);
    }

    cachedRate = { from, to, rate, fetchedAt: Date.now() };
    return rate;
  } finally {
    clearTimeout(timeout);
  }
}

/** Counts stored amounts across all user tables that need conversion. */
export async function countStoredAmounts(userId: string): Promise<number> {
  const [records, recurring, goals, budgets] = await Promise.all([
    db.record.count({ where: { userId } }),
    db.recurringRecord.count({ where: { userId } }),
    db.goal.count({ where: { userId } }),
    db.budget.count({ where: { userId } }),
  ]);
  return records + recurring + goals + budgets;
}

/**
 * Converts every stored amount (records, recurring rules, goals, budgets) from
 * the old currency to the new one using `rate`. Runs atomically so a failure
 * mid-way can't leave half the account converted.
 */
export async function convertUserAmounts(
  userId: string,
  to: string,
  rate: number,
): Promise<{ converted: number }> {
  const toTwoDecimals = (value: number) => Math.round(value * rate * 100) / 100;

  let converted = 0;

  await db.$transaction(async (tx) => {
    const records = await tx.record.findMany({ where: { userId } });
    if (records.length > 0) {
      converted += records.length;
      for (const record of records) {
        await tx.record.update({ where: { id: record.id }, data: { amount: toTwoDecimals(record.amount) } });
      }
    }

    const recurring = await tx.recurringRecord.findMany({ where: { userId } });
    if (recurring.length > 0) {
      converted += recurring.length;
      for (const record of recurring) {
        await tx.recurringRecord.update({ where: { id: record.id }, data: { amount: toTwoDecimals(record.amount) } });
      }
    }

    const goals = await tx.goal.findMany({ where: { userId } });
    if (goals.length > 0) {
      converted += goals.length;
      for (const goal of goals) {
        await tx.goal.update({
          where: { id: goal.id },
          data: {
            targetAmount: toTwoDecimals(goal.targetAmount),
            currentAmount: toTwoDecimals(goal.currentAmount),
            monthlyContribution: toTwoDecimals(goal.monthlyContribution),
          },
        });
      }
    }

    const budgets = await tx.budget.findMany({ where: { userId } });
    if (budgets.length > 0) {
      converted += budgets.length;
      for (const budget of budgets) {
        await tx.budget.update({ where: { id: budget.id }, data: { amount: toTwoDecimals(budget.amount), currency: to } });
      }
    }
  });

  return { converted };
}
