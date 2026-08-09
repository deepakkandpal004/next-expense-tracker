'use server';

import { getAuthUser } from '@/lib/auth';
import { getCanAffordData } from '@/lib/data/can-i-afford';
import type { CanAffordBreakdown } from '@/lib/domain/can-i-afford';
import { normalizeReportingPeriod } from '@/lib/domain/reporting-period';
import type { ActionResult, ReportingPeriod } from '@/lib/domain/types';

export interface CanAffordActionResult {
  breakdown: CanAffordBreakdown;
}

/**
 * Computes the deterministic impact of a single planned purchase (the "Can I
 * Afford This?" feature). This action is deterministic and never calls the AI
 * provider; the verdict is a separate, user-triggered action so the numbers are
 * always the app's own computation.
 */
export async function getCanAfford(
  priceMinor: number,
  period: ReportingPeriod,
): Promise<ActionResult<CanAffordActionResult, 'price' | 'period'>> {
  const user = await getAuthUser();
  if (!user) {
    return { status: 'error', message: 'Sign in to continue.', retryable: false };
  }

  if (!Number.isInteger(priceMinor) || priceMinor <= 0) {
    return {
      status: 'validation-error',
      fieldErrors: { price: ['Enter a purchase amount greater than 0.'] },
      message: 'Enter a purchase amount greater than 0.',
    };
  }

  const normalized = normalizeReportingPeriod(period);
  if (!normalized.valid) {
    return {
      status: 'validation-error',
      fieldErrors: { period: ['Choose a valid reporting period.'] },
      message: 'Choose a valid reporting period.',
    };
  }

  try {
    const breakdown = await getCanAffordData(user.id, normalized.period, priceMinor, user.currency);
    return {
      status: 'success',
      data: { breakdown },
      message: 'Affordability calculated.',
    };
  } catch (error) {
    console.error('Can I afford calculation failed', error);
    return {
      status: 'error',
      message: 'Could not calculate affordability.',
      retryable: true,
    };
  }
}