import type { ReactNode } from 'react';
import Link from 'next/link';
import { Receipt, TrendingUp, Wallet, PiggyBank } from 'lucide-react';

const authDestinations = [
  { href: '/sign-in', label: 'Sign in' },
  { href: '/sign-up', label: 'Create account' },
] as const;

function StatPill({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-sidebar-border bg-white/[0.06] px-4 py-3">
      <span aria-hidden="true" className="text-accent">{icon}</span>
      <div>
        <p className="text-interface-xs text-sidebar-foreground-muted">{label}</p>
        <p className="text-interface-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

export function AuthenticationShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-[100dvh] bg-canvas">
      {/* Left decorative panel – hidden below lg */}
      <aside
        aria-hidden="true"
        className="hidden lg:flex lg:w-[40%] xl:w-[36%] flex-col justify-between bg-sidebar-gradient p-10 text-sidebar-foreground"
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow">
            <Receipt size={20} strokeWidth={2.4} />
          </span>
          <div>
            <p className="text-interface-sm font-bold leading-tight text-white">Expense</p>
            <p className="text-interface-sm font-bold leading-tight text-white">Tracker</p>
          </div>
        </div>

        {/* Hero copy */}
        <div>
          <h1 className="text-display-md font-bold leading-tight text-white">
            Track smart.<br />Spend better.<br />Achieve more.
          </h1>
          <p className="mt-4 text-interface-sm text-sidebar-foreground-muted">
            Manage your finances with intelligent insights, smart categorisation, and personalised financial recommendations.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <StatPill label="Transactions tracked" value="10,000+" icon={<TrendingUp size={18} />} />
            <StatPill label="Active users" value="2,400+" icon={<Wallet size={18} />} />
            <StatPill label="Money saved" value="₹5L+" icon={<PiggyBank size={18} />} />
            <StatPill label="Categories" value="8 built-in" icon={<Receipt size={18} />} />
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="text-interface-xs text-sidebar-foreground-muted">
          © {new Date().getFullYear()} Expense Tracker. Your data stays yours.
        </p>
      </aside>

      {/* Right: form area */}
      <div className="flex flex-1 flex-col">
        {/* Minimal header */}
        <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
          <Link
            aria-label="Expense Tracker home"
            className="flex items-center gap-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            href="/"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
              <Receipt aria-hidden="true" size={16} strokeWidth={2.4} />
            </span>
            <span className="text-interface-md font-bold text-foreground">Expense Tracker</span>
          </Link>
          <nav aria-label="Authentication tasks" className="flex items-center gap-1">
            {authDestinations.map((d) => (
              <Link
                className="inline-flex min-h-9 items-center rounded-lg px-3 text-interface-sm font-semibold text-foreground-secondary transition-colors hover:bg-surface-subtle hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                href={d.href}
                key={d.href}
              >
                {d.label}
              </Link>
            ))}
          </nav>
        </header>

        {/* Form column — vertically centred */}
        <main className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-7 shadow-sm">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
