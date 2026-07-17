'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  List,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Plus,
  Sparkles,
  Sun,
  UserRound,
} from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Button,
  CompactNavigation,
  DropdownMenu,
  IconButton,
  Sheet,
} from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  APP_PERIOD_DESTINATIONS,
  appPeriodHref,
  parseReportingPeriod,
  resolveReportingPeriodState,
  withReportingPeriod,
  writeReportingPeriodSession,
  type AppPeriodDestination,
} from '@/lib/domain/reporting-period';
import { projectNavigation } from '@/lib/domain/navigation';
import type {
  AppearancePreference,
  ContentDensity,
  ReportingPeriod,
} from '@/lib/domain/types';
import { cn } from '@/lib/ui/cn';

interface SafeUser {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
}

interface AuthenticatedAppShellProps {
  children: ReactNode;
}

interface AppDestination {
  id: AppPeriodDestination;
  label: string;
  icon: ReactNode;
  description: string;
}

const APP_DESTINATIONS: readonly AppDestination[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard aria-hidden='true' size={20} />,
    description: 'Overview and quick actions',
  },
  {
    id: 'records',
    label: 'Records',
    icon: <List aria-hidden='true' size={20} />,
    description: 'Transaction management',
  },
  {
    id: 'insights',
    label: 'Insights',
    icon: <Sparkles aria-hidden='true' size={20} />,
    description: 'Detailed generated analysis',
  },
];

function currentDestination(pathname: string): AppPeriodDestination {
  if (pathname.startsWith('/records')) return 'records';
  if (pathname.startsWith('/insights')) return 'insights';
  return 'dashboard';
}

function destinationHref(destination: AppPeriodDestination, period: ReportingPeriod): string {
  return appPeriodHref(destination, period) ?? APP_PERIOD_DESTINATIONS[destination];
}

function addTransactionHref(period: ReportingPeriod): string {
  return withReportingPeriod('/records?addTransaction=1', period) ?? '/records?addTransaction=1';
}

function appearanceIcon(preference: AppearancePreference) {
  if (preference === 'light') return <Sun aria-hidden='true' size={18} />;
  if (preference === 'dark') return <Moon aria-hidden='true' size={18} />;
  return <Monitor aria-hidden='true' size={18} />;
}

function AppearanceControls() {
  const { appearance, setAppearance } = useTheme();
  const options: readonly { value: AppearancePreference; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];

  return (
    <fieldset className='min-w-0'>
      <legend className='text-interface-xs font-semibold text-foreground-secondary'>Appearance</legend>
      <div aria-label='Appearance' className='mt-2 flex flex-wrap gap-2' role='group'>
        {options.map((option) => (
          <button
            aria-pressed={appearance === option.value}
            className={cn(
              'inline-flex min-h-11 min-w-11 items-center gap-2 rounded-control border px-3 py-2 text-interface-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
              appearance === option.value
                ? 'border-primary bg-surface-subtle text-primary'
                : 'border-border-strong bg-surface text-foreground hover:bg-surface-subtle',
            )}
            key={option.value}
            onClick={() => setAppearance(option.value)}
            type='button'
          >
            {appearanceIcon(option.value)}
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function DensityControls() {
  const { density, setDensity } = useTheme();
  const options: readonly { value: ContentDensity; label: string }[] = [
    { value: 'comfortable', label: 'Comfortable' },
    { value: 'compact', label: 'Compact' },
  ];

  return (
    <fieldset className='min-w-0'>
      <legend className='text-interface-xs font-semibold text-foreground-secondary'>Content density</legend>
      <div aria-label='Content density' className='mt-2 flex flex-wrap gap-2' role='group'>
        {options.map((option) => (
          <button
            aria-pressed={density === option.value}
            className={cn(
              'min-h-11 rounded-control border px-3 py-2 text-interface-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
              density === option.value
                ? 'border-primary bg-surface-subtle text-primary'
                : 'border-border-strong bg-surface text-foreground hover:bg-surface-subtle',
            )}
            key={option.value}
            onClick={() => setDensity(option.value)}
            type='button'
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function CompactPreferences({
  user,
  signingOut,
  onSignOut,
}: {
  user: { id: string; email: string; name: string | null; imageUrl: string | null };
  signingOut: boolean;
  onSignOut: () => void;
}) {
  return (
    <Sheet
      closeLabel='Close preferences'
      title='App preferences'
      trigger={<IconButton icon={<Palette size={20} />} label='Open preferences' />}
    >
      <div className='grid gap-6'>
        <AppearanceControls />
        <DensityControls />
        <section aria-labelledby='account-summary' className='rounded-container border border-border bg-surface-subtle p-4'>
          <h2 className='text-interface-sm font-semibold text-foreground' id='account-summary'>
            {user.name || user.email}
          </h2>
          <p className='mt-1 break-all text-interface-xs text-foreground-secondary'>{user.email}</p>
          <Button
            className='mt-4'
            icon={<LogOut size={18} />}
            intent='danger'
            label='Sign out'
            loading={signingOut}
            onClick={onSignOut}
          />
        </section>
      </div>
    </Sheet>
  );
}

/**
 * Route-owned signed-in chrome. URL period parameters remain authoritative;
 * sessionStorage only mirrors a valid period when the URL has no period state.
 */
export function AuthenticatedAppShell({ children }: AuthenticatedAppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: userLoading } = useAuth();
  const periodSearch = searchParams.toString();
  const [sessionPeriod, setSessionPeriod] = useState<ReportingPeriod>({ kind: 'current-month' });
  const [signingOut, setSigningOut] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const destination = currentDestination(pathname);
  const urlPeriod = useMemo(
    () => parseReportingPeriod(new URLSearchParams(periodSearch)),
    [periodSearch],
  );
  const hasPeriodInUrl = searchParams.get('period') !== null;
  const period = hasPeriodInUrl && urlPeriod.valid ? urlPeriod.input : sessionPeriod;

  useEffect(() => {
    const nextPeriod = resolveReportingPeriodState(
      new URLSearchParams(periodSearch),
      window.sessionStorage,
    );

    if (!nextPeriod.valid) return;
    setSessionPeriod(nextPeriod.input);
    writeReportingPeriodSession(window.sessionStorage, nextPeriod.input);
  }, [periodSearch]);

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace('/sign-in');
    }
  }, [userLoading, user, router]);

  if (userLoading || !user) {
    return <div className="flex min-h-[100dvh] items-center justify-center bg-bg text-foreground">Loading…</div>;
  }

  const navigation = projectNavigation(
    APP_DESTINATIONS,
    destination,
    (id) => destinationHref(id, period),
  );

  const signOut = async () => {
    setSigningOut(true);
    setAccountError(null);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Unable to sign out');
      router.replace('/sign-in');
      router.refresh();
    } catch {
      setAccountError('We couldn’t sign you out. Please try again.');
      setSigningOut(false);
    }
  };

  return (
    <div className='min-h-[100dvh] bg-bg text-foreground'>
      <header className='sticky top-0 z-40 border-b border-border bg-surface/95 pt-[env(safe-area-inset-top)] backdrop-blur motion-reduce:backdrop-blur-none'>
        <div className='mx-auto flex min-h-16 max-w-[var(--content-frame-max)] items-center gap-2 px-[var(--content-gutter)]'>
          <Link
            className='product-mark shrink-0 rounded-control px-2 py-2 text-interface-sm font-bold text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus'
            href={destinationHref('dashboard', period)}
          >
            Expense AI
          </Link>

          <nav aria-label='Primary navigation' className='hidden min-w-0 items-center gap-1 2xl:flex'>
            {navigation.map((item) => (
              <Link
                aria-current={item.current ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-11 items-center gap-2 rounded-control border border-transparent px-3 py-2 text-interface-sm font-semibold text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
                  item.current
                    ? 'border-primary bg-surface-subtle text-primary'
                    : 'hover:bg-surface-subtle active:bg-surface-subtle',
                )}
                href={item.href}
                key={item.id}
                title={item.description}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.current ? <span className='sr-only'>Current page</span> : null}
              </Link>
            ))}
          </nav>

          <div className='ml-auto hidden items-center gap-2 2xl:flex'>
            <AppearanceControls />
            <DensityControls />
            <Link
              aria-label='Add transaction'
              className='inline-flex min-h-11 items-center gap-2 rounded-control border border-primary bg-primary px-4 py-2 text-interface-sm font-semibold text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus'
              href={addTransactionHref(period)}
            >
              <Plus aria-hidden='true' size={18} />
              <span>Add transaction</span>
            </Link>
            <DropdownMenu
              items={[
                {
                  destructive: true,
                  icon: <LogOut size={18} />,
                  id: 'sign-out',
                  label: 'Sign out',
                  onSelect: signOut,
                },
              ]}
              label='Account actions'
              trigger={
                <button
                  aria-label={`Account actions for ${user.name || user.email}`}
                  className='inline-flex min-h-11 max-w-52 items-center gap-2 rounded-control border border-border-strong bg-surface px-3 py-2 text-interface-sm font-semibold text-foreground hover:bg-surface-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus'
                  type='button'
                >
                  <UserRound aria-hidden='true' size={18} />
                  <span className='truncate'>{user.name || user.email}</span>
                </button>
              }
            />
          </div>

          <div className='ml-auto flex items-center gap-1 2xl:hidden'>
            <Link
              aria-label='Add transaction'
              className='inline-flex min-h-11 min-w-11 items-center justify-center rounded-control border border-primary bg-primary text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus'
              href={addTransactionHref(period)}
            >
              <Plus aria-hidden='true' size={20} />
            </Link>
            <CompactPreferences onSignOut={signOut} signingOut={signingOut} user={user} />
            <CompactNavigation
              items={navigation.map((item) => ({
                current: item.current,
                href: item.href,
                icon: item.icon,
                id: item.id,
                label: item.label,
              }))}
              title='Primary navigation'
            />
          </div>
        </div>
        {accountError ? (
          <p aria-live='assertive' className='mx-auto max-w-[var(--content-frame-max)] px-[var(--content-gutter)] pb-3 text-interface-sm text-danger-foreground' role='alert'>
            {accountError}
          </p>
        ) : null}
      </header>
      <div className='mx-auto w-full max-w-[var(--content-frame-max)] px-[var(--content-gutter)] py-6'>{children}</div>
    </div>
  );
}
