import { db } from "@/src/database/client";

const RATE_TTL_MS = 6 * 60 * 60 * 1000;
const BASE_CURRENCY = "USD";

let cachedRates: { rates: Record<string, number>; fetchedAt: number } | null = null;

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
      headers: { accept: "application/json" },
    });
    if (!response.ok) throw new Error(`FX API responded with ${response.status}`);
    const payload = (await response.json()) as { result?: string; rates?: Record<string, number> };
    const rates = payload.rates;
    const fromRate = rates?.[fromKey];
    const toRate = rates?.[toKey];
    if (
      typeof fromRate !== "number" || typeof toRate !== "number" ||
      !Number.isFinite(fromRate) || !Number.isFinite(toRate) ||
      fromRate <= 0 || toRate <= 0 || !rates
    ) {
      throw new Error(`No exchange rate available for ${from} -> ${to}`);
    }
    cachedRates = { rates, fetchedAt: Date.now() };
    return toRate / fromRate;
  } finally {
    clearTimeout(timeout);
  }
}

export async function countStoredAmounts(userId: string): Promise<number> {
  const [records, recurring, goals, budgets] = await Promise.all([
    db.record.count({ where: { userId } }),
    db.recurringRecord.count({ where: { userId } }),
    db.goal.count({ where: { userId } }),
    db.budget.count({ where: { userId } }),
  ]);
  return records + recurring + goals + budgets;
}
