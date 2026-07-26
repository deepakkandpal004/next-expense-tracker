import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { RecurringView } from '@/components/patterns/recurring-view';

export const metadata: Metadata = { title: 'Recurring Transactions – Expense AI' };

export default async function RecurringRoute() {
  const user = await getAuthUser();
  if (!user) redirect('/sign-in');

  return <RecurringView />;
}
