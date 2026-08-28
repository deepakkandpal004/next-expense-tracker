"use client";

import { LayoutDashboard, Menu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { SearchInput } from "./search-input";
import { UserAvatar } from "./user-avatar";
import { useCommandKShortcut } from "./use-command-k";
import type { AppHeaderProps } from "./types";
import { RedisHealthBadge } from "@/src/common/ui/patterns/redis-health-badge";

export { type AppHeaderProps } from "./types";

export function AppHeader({ user, onMobileMenuOpen, onSignOut, signingOut, accountError }: AppHeaderProps) {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  useCommandKShortcut(() => searchRef.current?.focus());

  const submitSearch = (query: string) => {
    router.push(`/records?search=${encodeURIComponent(query)}`);
  };

  return (
    <header className="sticky top-3 z-50 w-full rounded-xl bg-black/90 shadow-[0_8px_32px_rgba(0,0,0,0.36)] backdrop-blur-xl transition-all duration-300">
      <div className="flex h-[56px] w-full items-center gap-3 px-4 sm:px-6 md:gap-5 lg:px-8">
        <button
          aria-label="Open navigation"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-white/[0.09] bg-white/[0.04] text-on-surface-variant/80 transition-all duration-200 hover:border-primary/30 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 md:hidden"
          onClick={onMobileMenuOpen}
          type="button"
        >
          <Menu aria-hidden="true" size={18} />
        </button>

        <div className="flex min-w-0 flex-1 justify-center md:justify-start">
          <SearchInput inputRef={searchRef} onSubmit={submitSearch} />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden lg:flex">
            <RedisHealthBadge />
          </div>
          <Link
            href="/dashboard"
            aria-label="Go to dashboard"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-transparent px-3 text-xs font-semibold text-on-surface-variant/75 transition-all duration-200 hover:border-primary/30 hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_14px_var(--primary-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
          >
            <LayoutDashboard size={16} strokeWidth={2} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <div className="hidden sm:block">
            <UserAvatar user={user} onSignOut={onSignOut} signingOut={signingOut} />
          </div>
        </div>
      </div>

      {accountError ? (
        <p
          aria-live="assertive"
          className="border-t border-danger-border bg-danger-surface px-4 py-2 text-sm text-danger-foreground sm:px-6 lg:px-8"
          role="alert"
        >
          {accountError}
        </p>
      ) : null}
    </header>
  );
}
