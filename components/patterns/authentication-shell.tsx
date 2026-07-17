import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, WalletCards } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const authDestinations = [
  { href: '/sign-in', label: 'Sign in' },
  { href: '/sign-up', label: 'Create account' },
  { href: '/forgot-password', label: 'Reset password' },
] as const;

export function AuthenticationShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className='authentication-shell'>
      <header className='border-b border-[var(--color-border)] bg-[var(--color-surface)]'>
        <div className='content-frame authentication-shell__header-content'>
          <Link aria-label='Expense AI home' className='product-mark inline-flex min-h-11 items-center gap-2 text-lg font-bold text-[var(--color-text)]' href='/'>
            <WalletCards aria-hidden='true' className='size-6 text-[var(--color-primary)]' />
            <span>Expense AI</span>
          </Link>
          <div className='authentication-shell__header-actions'>
            <ThemeToggle />
            <Link className='inline-flex min-h-11 items-center gap-2 rounded-control px-3 font-semibold text-[var(--color-primary)] hover:bg-[var(--color-surface-subtle)]' href='/'>
              <ArrowLeft aria-hidden='true' className='size-4' />
              <span>Return home</span>
            </Link>
          </div>
        </div>
        <nav aria-label='Authentication tasks' className='content-frame authentication-shell__task-nav'>
          {authDestinations.map((destination) => (
            <Link className='inline-flex min-h-11 items-center rounded-control px-3 font-semibold text-[var(--color-primary)] hover:bg-[var(--color-surface-subtle)]' href={destination.href} key={destination.href}>
              {destination.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className='content-frame authentication-shell__content'>
        <section aria-label='Account access' className='authentication-shell__form-column authentication-shell__legacy-form'>
          {children}
        </section>
        <aside aria-labelledby='authentication-support-title' className='authentication-shell__support'>
          <p className='text-sm font-semibold uppercase tracking-wide text-[var(--color-primary)]'>Expense AI</p>
          <h1 className='font-display text-3xl font-bold text-[var(--color-text)]' id='authentication-support-title'>Manage your finances with clarity.</h1>
          <p className='text-[var(--color-text-muted)]'>Use your account to continue tracking transactions and reviewing the financial information you have recorded.</p>
        </aside>
      </div>
    </div>
  );
}
