import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { getDashboardData } from '@/lib/data/dashboard';
import { resolveValidReportingPeriod } from '@/lib/domain/reporting-period';
import { DashboardView } from '@/components/patterns/dashboard-view';

export const metadata: Metadata = { title: 'Dashboard – Expense AI' };

interface DashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function toSearchParams(query: Record<string, string | string[] | undefined>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string') params.set(key, value);
    else if (Array.isArray(value) && value.length > 0) params.set(key, value[0]);
  }
  return params;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await getAuthUser();
  if (!user) redirect('/sign-in');

  const query = await searchParams;
  const { input: periodInput, period } = resolveValidReportingPeriod(toSearchParams(query));
  const dashboard = await getDashboardData(user.id, period);

  return <DashboardView dashboard={dashboard} period={periodInput} user={{ name: user.name }} />;
}
