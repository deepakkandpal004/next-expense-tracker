"use client";

import { LayoutDashboard, LogOut, Menu, Search, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type RefObject } from "react";
import { DropdownMenu } from "@/components/ui";
import type { SafeUser } from "./authenticated-app-shell";

interface AppHeaderProps {
  user: SafeUser;
  onMobileMenuOpen: () => void;
  onSignOut: () => void;
  signingOut: boolean;
  accountError: string | null;
}

function useCommandKShortcut(callback: () => void) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === "k") {
        event.preventDefault();
        callback();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [callback]);
}

function UserAvatar({ user, onSignOut, signingOut }: { user: SafeUser; onSignOut: () => void; signingOut: boolean }) {
  const initial = ((user.name?.trim()[0] ?? user.email[0]) || "?").toUpperCase();
  const displayName = user.name || user.email.split("@")[0];

  return (
    <DropdownMenu
      align="end"
      label="User menu"
      trigger={
        <button
          aria-label="Open user menu"
          className="group relative inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] py-1 pl-1 pr-3 transition-all duration-200 hover:border-[#00DCE5]/35 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F14]"
          type="button"
        >
          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-accent">
            {user.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                src={user.imageUrl}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-white">{initial}</span>
            )}
          </span>
          <span className="hidden max-w-28 truncate text-sm font-medium text-on-surface sm:block">{displayName}</span>
        </button>
      }
      items={[
        {
          id: "user-info",
          label: displayName,
          disabled: true,
          icon: <User size={16} />,
        },
        {
          id: "sign-out",
          label: signingOut ? "Signing out..." : "Sign out",
          icon: <LogOut size={16} />,
          destructive: true,
          disabled: signingOut,
          onSelect: onSignOut,
        },
      ]}
    />
  );
}

function SearchInput({
  inputRef,
  onSubmit,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  onSubmit: (query: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [shortcutHint, setShortcutHint] = useState<"Ctrl K" | "\u2318 K">("Ctrl K");

  useEffect(() => {
    const platform = navigator.platform ?? navigator.userAgent ?? "";
    if (/Mac|iPhone|iPad|iPod/i.test(platform)) {
      setShortcutHint("\u2318 K");
    }
  }, []);

  return (
    <form
      className="w-full max-w-xl"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = query.trim();
        if (trimmed) onSubmit(trimmed);
      }}
      role="search"
    >
      <div className="group relative">
        <Search
          aria-hidden="true"
          className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-500 ${isFocused ? "text-primary-fixed" : "text-on-surface-variant/40"}`}
          size={15}
        />
        <input
          aria-label="Search transactions and categories"
          className={`h-10 w-full rounded-xl border border-white/[0.07] bg-white/[0.035] pl-10 pr-16 text-sm text-on-surface shadow-inner shadow-black/10 backdrop-blur-md transition-all duration-200 placeholder:text-on-surface-variant/45 hover:border-white/[0.12] ${
            isFocused
              ? "border-[#00DCE5]/40 bg-white/[0.06] ring-2 ring-[#00DCE5]/15"
              : ""
          }`}
          onBlur={() => setIsFocused(false)}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search transactions..."
          ref={inputRef}
          type="search"
          value={query}
        />
        <kbd
          aria-hidden="true"
          className={`pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border px-1.5 py-0.5 font-manrope text-[10px] font-medium transition-colors duration-200 sm:flex ${
            isFocused
              ? "border-[#00DCE5]/30 bg-[#00DCE5]/10 text-[#00DCE5]"
              : "border-white/[0.08] bg-black/10 text-on-surface-variant/55"
          }`}
        >
          {shortcutHint}
        </kbd>
      </div>
    </form>
  );
}

export function AppHeader({ user, onMobileMenuOpen, onSignOut, signingOut, accountError }: AppHeaderProps) {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  useCommandKShortcut(() => searchRef.current?.focus());

  const submitSearch = (query: string) => {
    router.push(`/records?search=${encodeURIComponent(query)}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#0B0F14]/78 shadow-[0_8px_28px_rgba(0,0,0,0.12)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#00DCE5]/30 to-transparent" />
      <div className="flex h-[68px] items-center gap-3 px-4 sm:px-6 md:gap-5 lg:px-8">
        <button
          aria-label="Open navigation"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-on-surface-variant/80 transition-all duration-200 hover:border-[#00DCE5]/30 hover:bg-[#00DCE5]/10 hover:text-[#00DCE5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5]/70 md:hidden"
          onClick={onMobileMenuOpen}
          type="button"
        >
          <Menu aria-hidden="true" size={20} />
        </button>

        <div className="flex min-w-0 flex-1 justify-center md:justify-start">
          <SearchInput inputRef={searchRef} onSubmit={submitSearch} />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/dashboard"
            aria-label="Go to dashboard"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-transparent px-2.5 text-on-surface-variant/75 transition-all duration-200 hover:border-white/[0.08] hover:bg-white/[0.05] hover:text-[#00DCE5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5]/70"
          >
            <LayoutDashboard size={18} strokeWidth={2} />
            <span className="hidden text-xs font-semibold sm:inline">Dashboard</span>
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
