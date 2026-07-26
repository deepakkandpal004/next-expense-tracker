import type { Metadata } from 'next';
import { WorldClassLandingPage } from '@/components/patterns/world-class-landing';
import { PublicFooter } from '@/components/patterns/PublicFooter';
import { PublicHeader } from '@/components/patterns/PublicHeader';

export const metadata: Metadata = {
  title: 'Expense AI | Record and review your expenses',
  description: 'Record transactions, review reporting periods, and use optional AI assistance in Expense AI.',
};

/** `/` is the public landing page, accessible to all users. */
export default async function HomePage() {
  return <div className='flex min-h-[100dvh] flex-col bg-canvas'><PublicHeader /><div className='min-w-0 flex-1'><WorldClassLandingPage /></div><PublicFooter /></div>;
}
