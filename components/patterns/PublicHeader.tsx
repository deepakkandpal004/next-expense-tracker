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

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = PUBLIC_NAVIGATION.filter(
    (item) => !['sign-in', 'get-started'].includes(item.id)
  );

  return (
    <header className="sticky top-0 z-50">
      <div
        className={cn(
          'mx-auto flex items-center gap-6 px-4 py-3 sm:px-6 lg:px-8',
          'border-b border-white/[0.08] bg-[#0B0F14]/60 backdrop-blur-xl',
          'supports-[backdrop-filter]:bg-[#0B0F14]/50'
        )}
      >
        {/* Logo */}
        <Link
          aria-label="Expense AI home"
          className="group flex items-center gap-2.5 rounded-xl transition-all duration-300 hover:opacity-80"
          href="/"
        >
          <span className="relative grid size-9 place-items-center rounded-xl overflow-hidden bg-[#00DCE5]/10 shadow-[0_0_20px_rgba(0,220,229,0.15)] ring-1 ring-[#00DCE5]/20 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(0,220,229,0.25)] group-hover:ring-[#00DCE5]/30">
            <img src="/icon.svg" alt="" className="h-full w-full object-cover" />
          </span>
          <span className="text-lg font-bold text-white tracking-tight">
            Expense AI
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav
          aria-label="Public navigation"
          className="ml-auto hidden items-center gap-1 md:flex"
        >
          {navLinks.map((item) => {
            const current = isCurrentRoute(pathname, item.href);
            return (
              <Link
                aria-current={current ? 'page' : undefined}
                className={cn(
                  'relative rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200',
                  current
                    ? 'text-white'
                    : 'text-[#9AA3AF] hover:text-white hover:bg-white/[0.06]'
                )}
                href={item.href}
                key={item.id}
              >
                {item.label}
                {current && (
                  <span className="absolute inset-x-1 -bottom-[13px] h-0.5 rounded-full bg-[#00DCE5]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto md:ml-0">
          <Link
            href="/sign-in"
            className="hidden sm:inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-[#9AA3AF] transition-all duration-200 hover:text-white hover:bg-white/[0.06]"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center rounded-lg bg-[#00DCE5] px-4 py-2 text-sm font-semibold text-[#0B0F14] transition-all duration-200 hover:bg-[#00DCE5]/90 hover:shadow-[0_0_20px_rgba(0,220,229,0.3)] active:scale-[0.97]"
          >
            Get Started
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex md:hidden size-9 items-center justify-center rounded-lg text-[#9AA3AF] transition-all duration-200 hover:text-white hover:bg-white/[0.06]"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-b border-white/[0.08] bg-[#0B0F14]/90 backdrop-blur-xl">
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
              href="/sign-in"
              className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-[#9AA3AF] transition-all duration-200 hover:text-white hover:bg-white/[0.06]"
              onClick={() => setMobileOpen(false)}
            >
              Sign in
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
