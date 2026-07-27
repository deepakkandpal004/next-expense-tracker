import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { getRecordsForPeriod } from '@/lib/data/records';
import { resolveValidReportingPeriod } from '@/lib/domain/reporting-period';
import { toSearchParams } from '@/lib/domain/search-params';
import { RecordsView } from '@/components/patterns/records-view';

export const metadata: Metadata = { title: 'Records – Expense AI' };

interface RecordsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RecordsPage({ searchParams }: RecordsPageProps) {
  const user = await getAuthUser();
  if (!user) redirect('/sign-in');

  const query = await searchParams;
  const searchParamsObject = toSearchParams(query);
  const { input: periodInput, period } = resolveValidReportingPeriod(searchParamsObject);
  const records = await getRecordsForPeriod(user.id, period, user.currency);

  return (
    <RecordsView
      period={periodInput}
      records={records}
      resolvedPeriod={period}
    />
  );
}
