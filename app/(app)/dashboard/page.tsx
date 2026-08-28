import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/src/modules/auth';
import { getDashboardBundle } from '@/src/modules/dashboard';
import { resolveValidReportingPeriod } from '@/src/common/domain/reporting-period';
import { toSearchParams } from '@/src/common/domain/search-params';
import { DashboardView } from '@/src/modules/dashboard/presentation';

export const metadata: Metadata = { title: 'Dashboard – Expense Tracker AI' };

interface DashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await getAuthUser();
  if (!user) redirect('/api/auth/clear-session');

  const query = await searchParams;
  const { input: periodInput, period } = resolveValidReportingPeriod(toSearchParams(query));

  const { dashboard, safeToSpend, cashFlow, smartPacing } = await getDashboardBundle(
    user.id,
    period,
    user.currency,
  );

  return (
    <DashboardView
      dashboard={dashboard}
      period={periodInput}
      safeToSpend={safeToSpend}
      cashFlow={cashFlow}
      smartPacing={smartPacing}
      user={{ name: user.name }}
    />
  );
}
