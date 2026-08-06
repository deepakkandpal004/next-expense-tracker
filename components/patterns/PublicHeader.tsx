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
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5">
      <div className="relative mx-auto flex max-w-[1440px] items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#0B0F14]/78 px-4 py-3 shadow-[0_12px_36px_rgba(0,0,0,0.26)] backdrop-blur-2xl sm:px-5 lg:px-6">
      {/* Logo */}
        <Link
          aria-label="Expense AI home"
          className="group flex shrink-0 items-center gap-2.5 rounded-xl transition-all duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F14]"
          href="/"
        >
          <span className="relative grid size-[30px] place-items-center rounded-lg bg-white p-1.5 transition-transform duration-300 group-hover:scale-110">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Expense%20AI.png?v=4" alt="" className="h-full w-auto object-contain" />
          </span>
          <span className="text-xl font-bold tracking-tight sm:text-2xl">
            <span className="text-white">Expense </span>
            <span className="text-[#00DCE5]">AI</span>
          </span>
        </Link>

        {/* Desktop Nav — centered glass pill */}
        <nav
          aria-label="Public navigation"
          className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
        >
          <div className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-black/15 p-1 shadow-inner shadow-white/[0.02] backdrop-blur-xl">
            {navLinks.map((item) => {
              const current = isCurrentRoute(pathname, item.href);
              return (
                <Link
                  aria-current={current ? 'page' : undefined}
                  className={cn(
                    'relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5]/70',
                    current
                      ? 'bg-[#00DCE5]/12 text-white shadow-[inset_0_0_0_1px_rgba(0,220,229,0.14)]'
                      : 'text-[#9AA3AF] hover:bg-white/[0.06] hover:text-white'
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
              className="inline-flex h-10 items-center rounded-xl bg-[#00DCE5] px-4 text-sm font-semibold text-[#0B0F14] transition-all duration-200 hover:bg-[#00DCE5]/90 hover:shadow-[0_0_20px_rgba(0,220,229,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F14] active:scale-[0.97]"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden h-10 items-center rounded-xl px-3 text-sm font-medium text-[#9AA3AF] transition-all duration-200 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5]/70 sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex h-10 items-center rounded-xl bg-[#00DCE5] px-4 text-sm font-semibold text-[#0B0F14] transition-all duration-200 hover:bg-[#00DCE5]/90 hover:shadow-[0_0_20px_rgba(0,220,229,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F14] active:scale-[0.97]"
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
            className="inline-flex size-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-[#9AA3AF] transition-all duration-200 hover:border-[#00DCE5]/30 hover:bg-[#00DCE5]/10 hover:text-[#00DCE5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5]/70 lg:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="mx-auto mt-2 max-w-[1440px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B0F14]/95 shadow-[0_12px_36px_rgba(0,0,0,0.26)] backdrop-blur-2xl lg:hidden">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#00DCE5]/30 to-transparent" />
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1 px-4 py-3">
            {navLinks.map((item) => {
              const current = isCurrentRoute(pathname, item.href);
              return (
                <Link
                  aria-current={current ? 'page' : undefined}
                  className={cn(
                    'rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5]/70',
                    current
                      ? 'bg-[#00DCE5]/12 text-white'
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
              className="rounded-xl px-3.5 py-3 text-sm font-medium text-[#9AA3AF] transition-all duration-200 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5]/70"
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
