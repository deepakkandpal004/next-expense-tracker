'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, LayoutDashboard, LogIn, Menu, X } from 'lucide-react';
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
    <header className="sticky top-0 z-50 w-full bg-gradient-to-b from-black via-black/60 to-transparent px-3 pt-5 sm:px-6">
      <div className="relative flex w-full items-center justify-between gap-3 rounded-full border border-white/[0.12] bg-black/60 px-4 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.36),_inset_0_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-xl transition-all duration-300 sm:px-5 sm:py-2.5">
        {/* Logo */}
        <Link
          aria-label="Expense AI home"
          className="flex shrink-0 items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5]/70"
          href="/"
        >
          <span className="relative grid size-12 place-items-center rounded-full overflow-hidden transition-transform duration-300 ease-out hover:scale-110 sm:size-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo1.png" alt="" className="h-full w-full object-cover" />
          </span>
          <span className="font-extrabold text-xl tracking-wider sm:text-2xl">
            <span className="text-white">Expense </span>
            <span className="text-[#00DCE5]">AI</span>
          </span>
        </Link>

        {/* Desktop Nav — centered glass pill */}
        <nav
          aria-label="Public navigation"
          className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
        >
          <div className="flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.03] p-1 shadow-inner backdrop-blur-md">
            {navLinks.map((item) => {
              const current = isCurrentRoute(pathname, item.href);
              return (
                <Link
                  aria-current={current ? 'page' : undefined}
                  className={cn(
                    'relative rounded-full px-4 py-2 text-sm font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5]/70',
                    current
                      ? 'text-[#00DCE5]'
                      : 'text-[#9AA3AF] hover:text-white'
                  )}
                  href={item.href}
                  key={item.id}
                >
                  {item.label}
                  {current && (
                    <motion.span
                      layoutId="public-nav-active-indicator"
                      initial={{ opacity: 0, scaleX: 0.5 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-0 -z-10 rounded-full bg-[#00DCE5]/15 border border-[#00DCE5]/30 shadow-[0_0_12px_rgba(0,220,229,0.2)]"
                    />
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
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#00DCE5] px-5 text-sm font-semibold tracking-wide text-[#0B0F14] transition-all duration-200 hover:bg-[#00DCE5]/90 hover:shadow-[0_0_18px_rgba(0,220,229,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F14] active:scale-[0.97]"
            >
              <LayoutDashboard size={14} strokeWidth={2.25} />
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold tracking-wide text-[#9AA3AF] transition-all duration-200 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5]/70 sm:inline-flex"
              >
                <LogIn size={14} />
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="group inline-flex h-10 items-center gap-1.5 rounded-full bg-[#00DCE5] px-5 text-sm font-semibold tracking-wide text-[#0B0F14] transition-all duration-200 hover:bg-[#00DCE5]/90 hover:shadow-[0_0_18px_rgba(0,220,229,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F14] active:scale-[0.97]"
              >
                Get Started
                <ArrowRight size={14} strokeWidth={2.5} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex size-10 items-center justify-center rounded-full border border-white/[0.09] bg-white/[0.04] text-[#9AA3AF] transition-all duration-200 hover:border-[#00DCE5]/30 hover:bg-[#00DCE5]/10 hover:text-[#00DCE5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5]/70 lg:hidden"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="mt-2 w-full overflow-hidden rounded-3xl border border-white/[0.12] bg-black/95 shadow-[0_12px_36px_rgba(0,0,0,0.36)] backdrop-blur-2xl lg:hidden">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#00DCE5]/30 to-transparent" />
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1 px-4 py-3">
            {navLinks.map((item) => {
              const current = isCurrentRoute(pathname, item.href);
              return (
                <Link
                  aria-current={current ? 'page' : undefined}
                  className={cn(
                    'rounded-xl px-4 py-3 text-sm font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5]/70',
                    current
                      ? 'bg-[#00DCE5]/15 text-[#00DCE5]'
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
            <div className="my-1.5 h-px bg-white/[0.08]" />
            <Link
              href={isAuthenticated ? "/dashboard" : "/sign-in"}
              className="rounded-xl px-4 py-3 text-sm font-semibold tracking-wide text-[#9AA3AF] transition-all duration-200 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5]/70"
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
