'use server';

import { getAuthUser } from '@/lib/auth';
import { getSafeToSpendData } from '@/lib/data/safe-to-spend';
import type { SafeToSpendBreakdown } from '@/lib/domain/safe-to-spend';
import { normalizeReportingPeriod } from '@/lib/domain/reporting-period';
import type { ActionResult, ReportingPeriod } from '@/lib/domain/types';

export interface SafeToSpendActionResult {
  breakdown: SafeToSpendBreakdown;
}

/**
 * Computes the Safe-to-Spend figure entirely from recorded data. This action is
 * deterministic and never calls the AI provider; the explanation is a separate,
 * user-triggered action so the headline number is never outsourced to a model.
 */
export async function getSafeToSpend(
  period: ReportingPeriod,
): Promise<ActionResult<SafeToSpendActionResult, 'period'>> {
  const user = await getAuthUser();
  if (!user) {
    return { status: 'error', message: 'Sign in to continue.', retryable: false };
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
    const breakdown = await getSafeToSpendData(user.id, normalized.period, user.currency);
    return {
      status: 'success',
      data: { breakdown },
      message: 'Safe to spend calculated.',
    };
  } catch (error) {
    console.error('Safe to spend calculation failed', error);
    return {
      status: 'error',
      message: 'Could not calculate Safe to spend.',
      retryable: true,
    };
  }
}