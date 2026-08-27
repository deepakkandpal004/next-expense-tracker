'use server';

import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import type { ActionResult, ResolvedPeriod } from '@/lib/domain/types';
import {
  computeSpendingForecast,
  computeCategoryAverages,
  detectAnomalies,
  type SpendingForecast,
  type TransactionAnomaly,
} from '@/lib/domain/forecast';
import { getForecastSummaries } from '@/lib/data/forecast';
import { getCache, setCache } from '@/lib/cache';

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
