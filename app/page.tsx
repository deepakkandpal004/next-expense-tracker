import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { WorldClassLandingPage } from '@/components/patterns/world-class-landing';
import { PublicFooter } from '@/components/patterns/PublicFooter';
import { PublicHeader } from '@/components/patterns/PublicHeader';
import { getAuthUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Expense AI | Record and review your expenses',
  description: 'Record transactions, review reporting periods, and use optional AI assistance in Expense AI.',
};

/** `/` remains the verified signed-out landing route. */
export default async function HomePage() {
  const user = await getAuthUser();
  if (user) redirect('/dashboard');
  return <div className='flex min-h-[100dvh] flex-col bg-canvas'><PublicHeader /><div className='min-w-0 flex-1'><WorldClassLandingPage /></div><PublicFooter /></div>;
}
