'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, LogIn, Menu, X } from 'lucide-react';
import { cn } from '@/lib/ui/cn';
import { PUBLIC_NAVIGATION } from './public-navigation';

function isCurrentRoute(pathname: string, href: string) {
  return pathname === href;
}

export function PublicHeader({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sectionTargets: Record<string, string> = {
    home: 'home',
    features: 'features',
    about: 'about',
  };

  const navLinks = PUBLIC_NAVIGATION.filter(
    (item) => !['sign-in', 'get-started'].includes(item.id)
  ).map((item) => {
    const sectionId = sectionTargets[item.id];
    return {
      ...item,
      href: sectionId ? `/#${sectionId}` : item.href,
      sectionId,
    };
  });

  function handleScrollClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId?: string
  ) {
    if (!sectionId || pathname !== '/') return;
    e.preventDefault();
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document
        .getElementById(sectionId)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-b from-black via-black/60 to-transparent px-4 pt-5">
      <div className="mx-auto flex w-full items-center justify-between gap-3 rounded-full border border-white/[0.12] bg-white/[0.06] px-6 py-3 text-white shadow-[0_8px_32px_rgba(0,0,0,0.36),inset_0_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-xl">
        {/* Logo */}
        <Link
          aria-label="Expense Tracker AI home"
          className="flex shrink-0 items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5]/70"
          href="/"
        >
          <span className="relative grid size-9 place-items-center overflow-hidden rounded-full transition-transform duration-300 hover:scale-110 sm:size-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo1.png" alt="" className="h-full w-full object-cover" />
          </span>
          <span className="hidden font-extrabold text-lg tracking-wider sm:block">
            <span className="text-white">Expense Tracker </span>
            <span className="text-[#00DCE5]">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav aria-label="Public navigation" className="hidden items-center gap-6 md:flex">
          {navLinks.map((item) => {
            const current = !item.sectionId && isCurrentRoute(pathname, item.href);
            return (
              <Link
                aria-current={current ? 'page' : undefined}
                className={cn(
                  'group relative h-6 overflow-hidden text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5]/70',
                  current ? 'text-[#00DCE5]' : 'text-white/80 hover:text-white'
                )}
                href={item.href}
                key={item.id}
                onClick={(e) => handleScrollClick(e, item.sectionId)}
              >
                <span className="block transition-transform duration-300 group-hover:-translate-y-full">
                  {item.label}
                </span>
                <span className="absolute left-0 top-full block transition-transform duration-300 group-hover:-translate-y-full">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-4">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="hidden items-center gap-2 rounded-full bg-[#00DCE5] px-4 py-2 text-sm font-medium text-[#0B0F14] shadow-[0px_0px_30px_7px] shadow-[#00DCE5]/50 transition-all duration-300 hover:scale-[1.05] hover:bg-[#2BE6EF] hover:shadow-[0px_0px_30px_14px] hover:shadow-[#00DCE5]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5] active:scale-[0.98] md:flex"
            >
              <LayoutDashboard size={14} strokeWidth={2.25} />
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden items-center gap-1.5 rounded-full border border-slate-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5]/70 md:flex"
              >
                <LogIn size={14} />
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="hidden items-center rounded-full bg-[#00DCE5] px-4 py-2 text-sm font-medium text-[#0B0F14] shadow-[0px_0px_30px_7px] shadow-[#00DCE5]/50 transition-all duration-300 hover:scale-[1.05] hover:bg-[#2BE6EF] hover:shadow-[0px_0px_30px_14px] hover:shadow-[#00DCE5]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5] active:scale-[0.98] md:flex"
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
            className="inline-flex size-10 items-center justify-center rounded-full text-gray-600 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5]/70 md:hidden"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="mt-2 w-full overflow-hidden rounded-3xl border border-white/[0.12] bg-black/80 px-6 py-5 text-white shadow-[0_12px_36px_rgba(0,0,0,0.36)] backdrop-blur-2xl md:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col items-center gap-5">
            {navLinks.map((item) => {
              const current = !item.sectionId && isCurrentRoute(pathname, item.href);
              return (
                <Link
                  aria-current={current ? 'page' : undefined}
                  className={cn(
                    'text-base transition-colors hover:text-[#00DCE5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5]/70',
                    current ? 'text-[#00DCE5]' : 'text-white/80'
                  )}
                  href={item.href}
                  key={item.id}
                  onClick={(e) => {
                    handleScrollClick(e, item.sectionId);
                    setMobileOpen(false);
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="flex items-center gap-4">
              <Link
                href={isAuthenticated ? '/dashboard' : '/sign-in'}
                className="rounded-full border border-slate-600 px-4 py-2 text-sm font-medium transition hover:bg-slate-800"
                onClick={() => setMobileOpen(false)}
              >
                {isAuthenticated ? 'Dashboard' : 'Sign in'}
              </Link>
              {!isAuthenticated && (
                <Link
                  href="/sign-up"
                  className="rounded-full bg-[#00DCE5] px-4 py-2 text-sm font-medium text-[#0B0F14] shadow-[0px_0px_30px_7px] shadow-[#00DCE5]/50 transition-all duration-300 hover:scale-[1.05] hover:bg-[#2BE6EF] hover:shadow-[0px_0px_30px_14px] hover:shadow-[#00DCE5]/60 active:scale-[0.98]"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
