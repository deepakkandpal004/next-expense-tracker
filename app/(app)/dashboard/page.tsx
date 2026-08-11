import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { getCashFlowProjection } from '@/lib/data/cash-flow';
import { getDashboardData } from '@/lib/data/dashboard';
import { getSafeToSpendData } from '@/lib/data/safe-to-spend';
import { getSmartPacingReport } from '@/lib/data/smart-alerts';
import { resolveValidReportingPeriod } from '@/lib/domain/reporting-period';
import { toSearchParams } from '@/lib/domain/search-params';
import { DashboardView } from '@/components/patterns/dashboard-view';

export const metadata: Metadata = { title: 'Dashboard – Expense Tracker AI' };

interface DashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await getAuthUser();
  if (!user) redirect('/api/auth/clear-session');

  const query = await searchParams;
  const { input: periodInput, period } = resolveValidReportingPeriod(toSearchParams(query));

  const [dashboard, safeToSpend, cashFlow, smartPacing] = await Promise.all([
    getDashboardData(user.id, period, user.currency),
    getSafeToSpendData(user.id, period, user.currency),
    getCashFlowProjection(user.id, period, user.currency),
    getSmartPacingReport(user.id, period),
  ]);

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
