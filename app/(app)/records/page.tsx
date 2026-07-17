import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { getRecordsForPeriod } from '@/lib/data/records';
import { resolveValidReportingPeriod } from '@/lib/domain/reporting-period';
import { DEFAULT_CURRENCY } from '@/lib/data/dashboard';
import { RecordsView } from '@/components/patterns/records-view';

export const metadata: Metadata = { title: 'Records – Expense AI' };

interface RecordsPageProps {
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

export default async function RecordsPage({ searchParams }: RecordsPageProps) {
  const user = await getAuthUser();
  if (!user) redirect('/sign-in');

  const query = await searchParams;
  const searchParamsObject = toSearchParams(query);
  const { input: periodInput, period } = resolveValidReportingPeriod(searchParamsObject);
  const records = await getRecordsForPeriod(user.id, period, DEFAULT_CURRENCY);
  const addTransaction = searchParamsObject.get('addTransaction') === '1';

  return (
    <RecordsView
      currency={DEFAULT_CURRENCY}
      initialAddTransaction={addTransaction}
      period={periodInput}
      records={records}
      resolvedPeriod={period}
    />
  );
}
