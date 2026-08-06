'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/ui/cn';
import { PUBLIC_NAVIGATION } from './public-navigation';

function isCurrentRoute(pathname: string, href: string) {
  return pathname === href;
}

export function PublicHeader({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = PUBLIC_NAVIGATION.filter(
    (item) => !['sign-in', 'get-started'].includes(item.id)
  );

  return (
    <header className="sticky top-2 z-50">
      <div className="relative mx-auto flex items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
      {/* Logo */}
        <Link
          aria-label="Expense AI home"
          className="group flex shrink-0 items-center gap-2.5 rounded-xl transition-all duration-300 hover:opacity-80"
          href="/"
        >
          <span className="relative grid size-9 place-items-center rounded-xl overflow-hidden bg-[#00DCE5]/10 shadow-[0_0_20px_rgba(0,220,229,0.15)] ring-1 ring-[#00DCE5]/20 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(0,220,229,0.25)] group-hover:ring-[#00DCE5]/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/favicon.png" alt="" className="h-full w-full object-cover" />
          </span>
          <span className="text-lg font-bold text-white tracking-tight">
            Expense AI
          </span>
        </Link>

        {/* Desktop Nav — centered glass pill */}
        <nav
          aria-label="Public navigation"
          className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block"
        >
          <div className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1 shadow-[0_4px_24px_rgba(0,0,0,0.2)] backdrop-blur-xl">
            {navLinks.map((item) => {
              const current = isCurrentRoute(pathname, item.href);
              return (
                <Link
                  aria-current={current ? 'page' : undefined}
                  className={cn(
                    'relative rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300',
                    current
                      ? 'bg-white/[0.08] text-white'
                      : 'text-[#9AA3AF] hover:bg-white/[0.05] hover:text-white'
                  )}
                  href={item.href}
                  key={item.id}
                >
                  {item.label}
                  {current && (
                    <span className="absolute -bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-[#00DCE5] shadow-[0_0_8px_rgba(0,220,229,0.8)]" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-full bg-[#00DCE5] px-5 py-2 text-sm font-semibold text-[#0B0F14] transition-all duration-200 hover:bg-[#00DCE5]/90 hover:shadow-[0_0_20px_rgba(0,220,229,0.3)] active:scale-[0.97]"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden sm:inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-[#9AA3AF] transition-all duration-200 hover:bg-white/[0.06] hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center rounded-full bg-[#00DCE5] px-5 py-2 text-sm font-semibold text-[#0B0F14] transition-all duration-200 hover:bg-[#00DCE5]/90 hover:shadow-[0_0_20px_rgba(0,220,229,0.3)] active:scale-[0.97]"
              >
                Get Started
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex md:hidden size-9 items-center justify-center rounded-full text-[#9AA3AF] transition-all duration-200 hover:bg-white/[0.06] hover:text-white"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-b border-white/[0.06] bg-[#0B0F14]/80 backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#00DCE5]/30 to-transparent" />
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1 px-4 py-3">
            {navLinks.map((item) => {
              const current = isCurrentRoute(pathname, item.href);
              return (
                <Link
                  aria-current={current ? 'page' : undefined}
                  className={cn(
                    'rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-200',
                    current
                      ? 'text-white bg-white/[0.06]'
                      : 'text-[#9AA3AF] hover:text-white hover:bg-white/[0.06]'
                  )}
                  href={item.href}
                  key={item.id}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="my-2 h-px bg-white/[0.08]" />
            <Link
              href={isAuthenticated ? "/dashboard" : "/sign-in"}
              className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-[#9AA3AF] transition-all duration-200 hover:text-white hover:bg-white/[0.06]"
              onClick={() => setMobileOpen(false)}
            >
              {isAuthenticated ? "Dashboard" : "Sign in"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
