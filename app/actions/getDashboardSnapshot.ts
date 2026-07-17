'use server';

import { getAuthUser } from '@/lib/auth';
import { getDashboardData } from '@/lib/data/dashboard';
import type { DashboardDTO } from '@/lib/domain/dashboard';
import { normalizeReportingPeriod } from '@/lib/domain/reporting-period';
import type { ActionResult, ReportingPeriod } from '@/lib/domain/types';

export async function getDashboardSnapshot(
  period: ReportingPeriod,
): Promise<ActionResult<{ dashboard: DashboardDTO }, 'period'>> {
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
    const dashboard = await getDashboardData(user.id, normalized.period);
    return { status: 'success', data: { dashboard }, message: 'Dashboard refreshed.' };
  } catch (error) {
    console.error('dashboard refresh failed', error);
    return {
      status: 'error',
      message: 'The dashboard could not be refreshed. Showing the last successful data.',
      retryable: true,
    };
  }
}