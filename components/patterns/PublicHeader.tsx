'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CompactNavigation } from '@/components/ui';
import { cn } from '@/lib/ui/cn';
import { PUBLIC_NAVIGATION } from './public-navigation';

function isCurrentRoute(pathname: string, href: string) {
  return pathname === href;
}

export function PublicHeader() {
  const pathname = usePathname();
  const compactItems = PUBLIC_NAVIGATION.map((item) => ({
    ...item,
    current: isCurrentRoute(pathname, item.href),
  }));

  return (
    <header className='sticky top-0 z-40 border-b border-border bg-surface/95 pt-[env(safe-area-inset-top)] shadow-flat backdrop-blur supports-[backdrop-filter]:bg-surface/85'>
      <div className='content-frame flex min-h-20 items-center gap-3 py-2'>
        <Link aria-label='Expense AI home' className='product-mark inline-flex min-h-11 items-center gap-2 rounded-control px-1 text-display-sm font-semibold text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus' href='/'>
          <span aria-hidden='true' className='grid size-8 place-items-center rounded-control bg-primary text-sm font-bold text-primary-foreground'>EA</span>
          <span>Expense AI</span>
        </Link>
        <nav aria-label='Public navigation' className='ml-auto hidden items-center gap-1 xl:flex'>
          {PUBLIC_NAVIGATION.map((item) => {
            const current = isCurrentRoute(pathname, item.href);
            return <Link aria-current={current ? 'page' : undefined} className={cn('inline-flex min-h-11 items-center rounded-control border-b-2 border-transparent px-3 text-interface-sm font-semibold text-foreground-secondary hover:bg-surface-subtle hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus', current && 'border-primary bg-surface-subtle text-foreground')} href={item.href} key={item.id}>{item.label}</Link>;
          })}
        </nav>
        <div className='ml-auto xl:hidden'>
          <CompactNavigation items={compactItems} title='Public navigation' />
        </div>
      </div>
    </header>
  );
}
