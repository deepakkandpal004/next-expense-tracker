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
import { getMonthlySpending, getCategoryMonthlySpending } from '@/lib/data/forecast';

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

  try {
    const [monthlySummaries, categoryMonthly, currentRecords] = await Promise.all([
      getMonthlySpending(user.id),
      getCategoryMonthlySpending(user.id),
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

    const forecast = computeSpendingForecast(monthlySummaries);
    const categoryAverages = computeCategoryAverages(categoryMonthly);

    const anomalies = detectAnomalies(
      currentRecords.map(r => ({
        id: r.id,
        description: r.text,
        amountMinor: Math.round(r.amount * 100),
        categoryId: r.category,
        occurredOn: r.date.toISOString(),
      })),
      categoryAverages,
    );

    return {
      status: 'success',
      data: { forecast, anomalies, anomalyCount: anomalies.length },
      message: 'Forecast generated.',
    };
  } catch (error) {
    console.error('Forecast failed', error);
    return { status: 'error', message: 'Could not generate forecast.', retryable: true };
  }
}
