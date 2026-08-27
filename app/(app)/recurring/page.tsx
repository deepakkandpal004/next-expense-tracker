import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/src/modules/auth';
import { RecurringView } from '@/src/modules/recurring/presentation';

export const metadata: Metadata = { title: 'Recurring Transactions – Expense Tracker AI' };

export default async function RecurringRoute() {
  const user = await getAuthUser();
  if (!user) redirect('/sign-in');

  return <RecurringView currency={user.currency} />;
}
