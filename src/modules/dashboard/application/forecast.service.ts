'use server';

import { getAuthUser } from '@/src/modules/auth';
import { db } from '@/src/database/client';
import type { ActionResult, ResolvedPeriod } from '@/src/common/domain/types';
import {
  computeSpendingForecast,
  computeCategoryAverages,
  detectAnomalies,
  type SpendingForecast,
  type TransactionAnomaly,
} from '@/src/common/domain/forecast';
import { getForecastSummaries } from '@/src/modules/reports/infrastructure/forecast.repository';
import { getCache, setCache } from '@/src/common/cache';
import { getCashFlowProjection } from '@/src/modules/reports/infrastructure/cash-flow.repository';
import type { CashFlowProjection } from '@/src/common/domain/cash-flow';

// ── Forecast Snapshot ────────────────────────────────────────────────────────

export interface ForecastSnapshot {
  forecast: SpendingForecast;
  anomalies: TransactionAnomaly[];
  anomalyCount: number;
}

export async function getForecastSnapshot(
  period: ResolvedPeriod,
): Promise<ActionResult<ForecastSnapshot, never>> {
  const user = await getAuthUser();
  if (!user) return { status: 'error', message: 'Sign in to continue.', retryable: false };

  const cacheKey = `app:forecast:${user.id}:${period.start}_${period.end}`;
  const cached = await getCache<ForecastSnapshot>(cacheKey);
  if (cached) {
    return { status: 'success', data: cached, message: 'Forecast generated.' };
  }

  try {
    const [forecastData, currentRecords] = await Promise.all([
      getForecastSummaries(user.id, 6),
      db.record.findMany({
        where: {
          userId: user.id,
          type: 'expense',
          date: {
            gte: new Date(`${period.start}T00:00:00.000Z`),
            lte: new Date(`${period.end}T23:59:59.999Z`),
          },
        },
        select: { id: true, text: true, amount: true, category: true, date: true },
      }),
    ]);

    const forecast = computeSpendingForecast(forecastData.monthly);
    const categoryAverages = computeCategoryAverages(forecastData.byCategory);

    const anomalies = detectAnomalies(
      currentRecords.map(r => ({
        id: r.id,
        description: r.text,
        amountMinor: Math.round(Number(r.amount) * 100),
        categoryId: r.category,
        occurredOn: r.date.toISOString(),
      })),
      categoryAverages,
    );

    const snapshot: ForecastSnapshot = { forecast, anomalies, anomalyCount: anomalies.length };
    await setCache(cacheKey, snapshot, 60 * 5);

    return {
      status: 'success',
      data: snapshot,
      message: 'Forecast generated.',
    };
  } catch (error) {
    console.error('Forecast failed', error);
    return { status: 'error', message: 'Could not generate forecast.', retryable: true };
  }
}

// ── Cash Flow Forecast ───────────────────────────────────────────────────────

export async function getCashFlowForecast(
  period: ResolvedPeriod,
): Promise<ActionResult<CashFlowProjection, never>> {
  const user = await getAuthUser();
  if (!user) {
    return { status: "error", message: "Sign in to continue.", retryable: false };
  }

  try {
    const projection = await getCashFlowProjection(user.id, period, user.currency);
    return { status: "success", message: "Cash-flow forecast ready.", data: projection };
  } catch (error) {
    console.error("Cash-flow forecast failed", error);
    return {
      status: "error",
      message: "Could not build the cash-flow forecast.",
      retryable: true,
    };
  }
}
