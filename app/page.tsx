import type { Metadata } from 'next';
import { WorldClassLandingPage } from '@/src/common/ui/patterns/world-class-landing';
import { PublicFooter } from '@/src/common/ui/patterns/PublicFooter';
import { PublicHeader } from '@/src/common/ui/patterns/PublicHeader';
import { getAuthUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Expense Tracker AI | Record and review your expenses',
  description: 'Record transactions, review reporting periods, and use optional AI assistance in Expense Tracker AI.',
};

/** `/` is the public landing page, accessible to all users. */
export default async function HomePage() {
  const user = await getAuthUser();
  return <div className='flex min-h-[100dvh] flex-col bg-canvas'><PublicHeader isAuthenticated={Boolean(user)} /><div className='min-w-0 flex-1'><WorldClassLandingPage /></div><PublicFooter /></div>;
}
