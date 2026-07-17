import type { ReactNode } from 'react';
import { PublicFooter } from '@/components/patterns/PublicFooter';
import { PublicHeader } from '@/components/patterns/PublicHeader';

export default function PublicLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className='flex min-h-[100dvh] flex-col bg-canvas'>
      <PublicHeader />
      <div className='min-w-0 flex-1'>{children}</div>
      <PublicFooter />
    </div>
  );
}
