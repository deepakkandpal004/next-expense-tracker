"use client";

import { LayoutDashboard, Menu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { SearchInput } from "./search-input";
import { UserAvatar } from "./user-avatar";
import { useCommandKShortcut } from "./use-command-k";
import type { AppHeaderProps } from "./types";

export { type AppHeaderProps } from "./types";

export function AppHeader({
  user,
  onMobileMenuOpen,
  onOpenCommandPalette,
  onSignOut,
  signingOut,
  accountError,
}: AppHeaderProps) {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  useCommandKShortcut(() => {
    if (onOpenCommandPalette) {
      onOpenCommandPalette();
    } else {
      searchRef.current?.focus();
    }
  });

  const submitSearch = (query: string) => {
    router.push(`/records?search=${encodeURIComponent(query)}`);
  };

  return (
    <header className="sticky top-3 z-50 w-full rounded-xl border border-white/[0.08] bg-[#0c0e14]/90 shadow-lg shadow-black/40 backdrop-blur-xl transition-all duration-200">
      <div className="flex h-[52px] w-full items-center gap-3 px-3 sm:px-4 md:gap-4 lg:px-5">
        <button
          aria-label="Open navigation"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-on-surface-variant/80 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 md:hidden"
          onClick={onMobileMenuOpen}
          type="button"
        >
          <Menu aria-hidden="true" size={16} />
        </button>

        <div className="flex min-w-0 flex-1 justify-center md:justify-start">
          <SearchInput
            inputRef={searchRef}
            onSubmit={submitSearch}
            onClick={onOpenCommandPalette}
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/dashboard"
            aria-label="Go to dashboard"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-transparent px-2.5 text-xs font-medium text-text-secondary transition-colors hover:border-white/[0.08] hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
          >
            <LayoutDashboard size={14} strokeWidth={2} />
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
          className="border-t border-danger-border bg-danger-surface px-4 py-2 text-xs text-danger-foreground sm:px-6 lg:px-8"
          role="alert"
        >
          {accountError}
        </p>
      ) : null}
    </header>
  );
}
