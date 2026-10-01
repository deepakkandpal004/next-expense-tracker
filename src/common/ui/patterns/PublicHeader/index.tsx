'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowRight, LayoutDashboard, LogIn, Menu, X } from "lucide-react";
import { cn } from "@/src/common/ui/cn";
import { PUBLIC_NAVIGATION } from "../public-navigation";

function isCurrentRoute(pathname: string, href: string) {
  return pathname === href;
}

export interface PublicHeaderProps {
  isAuthenticated?: boolean;
}

export function PublicHeader({ isAuthenticated = false }: PublicHeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sectionTargets: Record<string, string> = {
    home: "home",
  };

  const navLinks = PUBLIC_NAVIGATION.filter(
    (item) => !["sign-in", "get-started"].includes(item.id)
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
    if (!sectionId || pathname !== "/") return;
    e.preventDefault();
    if (sectionId === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document
        .getElementById(sectionId)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-6 py-4 text-white">
        <Link
          aria-label="Expense Tracker AI home"
          className="flex shrink-0 items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          href="/"
        >
          <span className="relative grid size-9 place-items-center overflow-hidden rounded-full sm:size-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo1.png" alt="" className="h-full w-full object-cover" />
          </span>
          <span className="hidden font-extrabold text-lg tracking-wider sm:block">
            <span className="text-white">Expense Tracker </span>
            <span className="text-primary">AI</span>
          </span>
        </Link>

        <nav aria-label="Public navigation" className="hidden items-center gap-6 md:flex">
          {navLinks.map((item) => {
            const current = !item.sectionId && isCurrentRoute(pathname, item.href);
            return (
              <Link
                aria-current={current ? "page" : undefined}
                className={cn(
                  "text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  current ? "text-primary" : "text-white/70 hover:text-white"
                )}
                href={item.href}
                key={item.id}
                onClick={(e) => handleScrollClick(e, item.sectionId)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="hidden h-9 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-foreground-inverse transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98] md:inline-flex"
            >
              <LayoutDashboard size={14} strokeWidth={2} />
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden h-9 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 text-xs font-medium text-white transition-colors hover:border-white/20 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98] md:flex"
              >
                <LogIn size={13} strokeWidth={2} />
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="group hidden h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-semibold text-foreground-inverse transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98] md:inline-flex"
              >
                Get Started
                <ArrowRight
                  size={13}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </Link>
            </>
          )}

          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="w-full border-t border-white/[0.08] bg-black/95 px-6 py-5 text-white md:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col items-center gap-5">
            {navLinks.map((item) => {
              const current = !item.sectionId && isCurrentRoute(pathname, item.href);
              return (
                <Link
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "text-base transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    current ? "text-primary" : "text-white/80"
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
            <div className="flex items-center gap-3">
              <Link
                href={isAuthenticated ? "/dashboard" : "/sign-in"}
                className="rounded-full border border-white/[0.12] bg-white/[0.06] px-4 py-2 text-sm font-medium text-white backdrop-blur-xl transition-all duration-300 hover:border-white/[0.24] hover:bg-white/[0.12] active:scale-[0.97]"
                onClick={() => setMobileOpen(false)}
              >
                {isAuthenticated ? "Dashboard" : "Sign in"}
              </Link>
              {!isAuthenticated && (
                <Link
                  href="/sign-up"
                   className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-foreground-inverse shadow-[0_0_16px_var(--primary-muted)] transition-all duration-300 active:scale-[0.97]"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                  <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
