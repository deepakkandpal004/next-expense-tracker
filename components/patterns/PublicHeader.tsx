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
    <header className="sticky top-0 z-40 border-b border-border/50 bg-surface/95 pt-[env(safe-area-inset-top)] shadow-flat backdrop-blur supports-[backdrop-filter]:bg-surface/85">
      <div className="content-frame flex min-h-16 items-center gap-4 py-2">
        <Link
          aria-label="Expense AI home"
          className="product-mark inline-flex min-h-11 items-center gap-2.5 rounded-control px-1 text-lg font-bold text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          href="/"
        >
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-lg overflow-hidden bg-primary shadow-[0_0_12px_rgba(0,220,229,0.3)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="" className="h-full w-full object-cover" />
          </span>
          <span className="hidden sm:block">Expense AI</span>
        </Link>

        <nav
          aria-label="Public navigation"
          className="ml-auto hidden items-center gap-1 xl:flex"
        >
          {PUBLIC_NAVIGATION.map((item) => {
            const current = isCurrentRoute(pathname, item.href);
            return (
              <Link
                aria-current={current ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-medium text-foreground-secondary transition-colors hover:bg-surface-subtle hover:text-foreground",
                  current && "bg-surface-subtle text-foreground"
                )}
                href={item.href}
                key={item.id}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 ml-auto xl:ml-0">
          <Link
            href="/sign-in"
            className="inline-flex min-h-10 items-center rounded-lg px-4 text-sm font-medium text-foreground-secondary transition-colors hover:bg-surface-subtle hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex min-h-10 items-center rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground shadow-[0_0_12px_rgba(0,220,229,0.3)] transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(0,220,229,0.4)]"
          >
            Get Started
          </Link>
          <div className="xl:hidden">
            <CompactNavigation items={compactItems} title="Public navigation" />
          </div>
        </div>
      </div>
    </header>
  );
}
