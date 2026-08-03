import type { Prisma } from '@prisma/client';

import { db } from '../db';

const RATE_TTL_MS = 6 * 60 * 60 * 1000;

const BASE_CURRENCY = 'USD';

/**
 * The most recently fetched rates table, keyed by currency code, expressed in
 * units of `BASE_CURRENCY`. Cross rates are always derived from a single base
 * table: `rate(from -> to) = rates[to] / rates[from]`, which guarantees the
 * pair is exactly reciprocal (`rate(from -> to) === 1 / rate(to -> from)`).
 * That makes A -> B -> A round trips lossless instead of drifting by the API's
 * per-pair rounding (the API publishes 6 significant digits per pair, and two
 * separately-fetched pairs are not exact inverses).
 */
let cachedRates: { rates: Record<string, number>; fetchedAt: number } | null = null;

/**
 * Returns the exchange rate to convert one unit of `from` into `to`.
 * Uses a free, key-less FX API (open.er-api.com) with a short in-memory cache.
 */
export async function getExchangeRate(from: string, to: string): Promise<number> {
  const fromKey = from.toUpperCase();
  const toKey = to.toUpperCase();
  if (fromKey === toKey) return 1;

  if (cachedRates && Date.now() - cachedRates.fetchedAt < RATE_TTL_MS) {
    const rate = cachedRates.rates[toKey] / cachedRates.rates[fromKey];
    if (Number.isFinite(rate) && rate > 0) return rate;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${BASE_CURRENCY}`, {
      signal: controller.signal,
      headers: { accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`FX API responded with ${response.status}`);
    }
    const payload = (await response.json()) as { result?: string; rates?: Record<string, number> };
    const rates = payload.rates;
    const fromRate = rates?.[fromKey];
    const toRate = rates?.[toKey];
    if (
      typeof fromRate !== 'number' ||
      typeof toRate !== 'number' ||
      !Number.isFinite(fromRate) ||
      !Number.isFinite(toRate) ||
      fromRate <= 0 ||
      toRate <= 0 ||
      !rates
    ) {
      throw new Error(`No exchange rate available for ${from} -> ${to}`);
    }

    cachedRates = { rates, fetchedAt: Date.now() };
    return toRate / fromRate;
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
 *
 * Converted values are rounded to 6 decimal places instead of 2: with 2-decimal
 * rounding each switch silently lost value (e.g. 200 INR → $2.09 → 199.55 INR),
 * while 6 decimals keeps round trips lossless (200 INR → 2.094675 USD → 200.00 INR).
 * Display formatting still shows 2 decimals.
 */
export async function convertUserAmounts(
  tx: Prisma.TransactionClient,
  userId: string,
  to: string,
  rate: number,
): Promise<{ converted: number }> {
  const convertAmount = (value: number) => Math.round(value * rate * 1e6) / 1e6;

  let converted = 0;

  const records = await tx.record.findMany({ where: { userId } });
  if (records.length > 0) {
    converted += records.length;
    for (const record of records) {
      await tx.record.update({ where: { id: record.id }, data: { amount: convertAmount(record.amount) } });
    }
  }

  const recurring = await tx.recurringRecord.findMany({ where: { userId } });
  if (recurring.length > 0) {
    converted += recurring.length;
    for (const record of recurring) {
      await tx.recurringRecord.update({ where: { id: record.id }, data: { amount: convertAmount(record.amount) } });
    }
  }

  const goals = await tx.goal.findMany({ where: { userId } });
  if (goals.length > 0) {
    converted += goals.length;
    for (const goal of goals) {
      await tx.goal.update({
        where: { id: goal.id },
        data: {
          targetAmount: convertAmount(goal.targetAmount),
          currentAmount: convertAmount(goal.currentAmount),
          monthlyContribution: convertAmount(goal.monthlyContribution),
        },
      });
    }
  }

  const budgets = await tx.budget.findMany({ where: { userId } });
  if (budgets.length > 0) {
    converted += budgets.length;
    for (const budget of budgets) {
      await tx.budget.update({ where: { id: budget.id }, data: { amount: convertAmount(budget.amount), currency: to } });
    }
  }

  return { converted };
}
