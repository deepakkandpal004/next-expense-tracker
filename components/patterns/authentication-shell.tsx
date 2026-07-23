import type { ReactNode } from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';

const authDestinations = [
  { href: '/sign-in', label: 'Sign in' },
  { href: '/sign-up', label: 'Create account' },
] as const;

export function AuthenticationShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border/50 px-6 py-4 backdrop-blur-md bg-surface/50">
        <Link
          aria-label="Expense AI home"
          className="flex items-center gap-2.5 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          href="/"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden bg-primary shadow-[0_0_15px_rgba(0,220,229,0.4)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="" className="h-full w-full object-cover" />
          </span>
          <span className="text-lg font-bold text-foreground tracking-tight">Expense AI</span>
        </Link>
        <nav aria-label="Authentication tasks" className="flex items-center gap-2">
          <Link
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-foreground-secondary transition-colors hover:bg-surface-subtle hover:text-foreground"
            href="/"
          >
            <Home size={14} />
            <span>Home</span>
          </Link>
          {authDestinations.map((d) => (
            <Link
              className="inline-flex min-h-9 items-center rounded-lg px-3.5 text-xs font-semibold text-foreground-secondary transition-colors hover:bg-surface-subtle hover:text-foreground"
              href={d.href}
              key={d.href}
            >
              {d.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Main Form — Centered single card */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px] rounded-2xl border border-border/50 bg-surface p-6 shadow-lg sm:p-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-4 text-center text-xs text-foreground-secondary">
        <p>AI-powered expense tracking for smarter financial decisions.</p>
      </footer>
    </div>
  );
}
