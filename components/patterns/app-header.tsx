"use client";

import { Bell, Home, LayoutDashboard, LogOut, Menu, Search, User, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type RefObject } from "react";
import { DropdownMenu } from "@/components/ui";
import type { SafeUser } from "./authenticated-app-shell";
import { ChangePasswordModal } from "./change-password-modal";

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

function NotificationBell({ unreadCount = 0 }: { unreadCount?: number }) {
  const label = unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications";
  return (
    <button
      aria-label={label}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant/70 transition-all duration-500 hover:text-primary-fixed hover:drop-shadow-[0_0_8px_#00dce5]"
      title={label}
      type="button"
    >
      <Bell aria-hidden="true" size={16} strokeWidth={2} />
      {unreadCount > 0 ? (
        <span
          aria-hidden="true"
          className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-secondary-container shadow-[0_0_6px_#ff24e4]"
        />
      ) : null}
    </button>
  );
}

function UserAvatar({ user, onSignOut, signingOut }: { user: SafeUser; onSignOut: () => void; signingOut: boolean }) {
  const initial = ((user.name?.trim()[0] ?? user.email[0]) || "?").toUpperCase();
  const displayName = user.name || user.email.split("@")[0];
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  return (
    <>
      <DropdownMenu
        align="end"
        label="User menu"
        trigger={
          <button
            aria-label="Open user menu"
            className="group relative inline-flex items-center gap-2 rounded-full border border-white/10 py-1 pl-1 pr-3 transition-all duration-300 hover:border-primary-fixed/40 hover:bg-surface-subtle/50"
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
            <span className="hidden text-sm font-medium text-on-surface sm:block">{displayName}</span>
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
            id: "change-password",
            label: "Change password",
            icon: <Lock size={16} />,
            onSelect: () => setChangePasswordOpen(true),
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
      <ChangePasswordModal
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </>
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
      className="w-full max-w-md"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = query.trim();
        if (trimmed) onSubmit(trimmed);
      }}
      role="search"
    >
      <div className="relative group">
        <Search
          aria-hidden="true"
          className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-500 ${isFocused ? "text-primary-fixed" : "text-on-surface-variant/40"}`}
          size={15}
        />
        <input
          aria-label="Search transactions and categories"
          className={`h-9 w-full rounded-full border-none bg-surface-container-low/50 pl-9 pr-14 text-sm text-on-surface backdrop-blur-md transition-all duration-500 placeholder:text-on-surface-variant/40 ${
            isFocused
              ? "ring-1 ring-primary-fixed/50 bg-surface-container-low"
              : ""
          }`}
          onBlur={() => setIsFocused(false)}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search currents..."
          ref={inputRef}
          type="search"
          value={query}
        />
        <kbd
          aria-hidden="true"
          className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium transition-colors duration-500 sm:flex font-geist ${
            isFocused
              ? "border-primary-fixed/30 bg-primary/10 text-primary-fixed"
              : "border-white/10 bg-surface-container-high text-on-surface-variant/50"
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
    <header className="sticky top-0 z-50 border-b border-white/5 bg-surface/60 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6 md:gap-4 lg:px-8">
        <button
          aria-label="Open navigation"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-on-surface-variant/70 transition-all duration-500 hover:text-primary-fixed md:hidden"
          onClick={onMobileMenuOpen}
          type="button"
        >
          <Menu aria-hidden="true" size={18} />
        </button>

        <Link
          href="/"
          className="hidden min-w-0 shrink-0 md:flex items-center gap-2.5 transition-all duration-300 hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden bg-primary-container shadow-[0_0_20px_rgba(0,245,255,0.3)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="" className="h-full w-full object-cover" />
          </div>
          <span className="pulse-logo text-xl">Expense AI</span>
        </Link>

        <div className="flex flex-1 justify-center md:justify-start">
          <SearchInput inputRef={searchRef} onSubmit={submitSearch} />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Link
            href="/"
            aria-label="Go to home page"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-on-surface-variant/70 transition-all duration-300 hover:text-primary-fixed hover:bg-surface-subtle/50"
          >
            <Home size={16} strokeWidth={2} />
            <span className="hidden sm:inline text-xs font-medium">Home</span>
          </Link>
          <Link
            href="/dashboard"
            aria-label="Go to dashboard"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-on-surface-variant/70 transition-all duration-300 hover:text-primary-fixed hover:bg-surface-subtle/50"
          >
            <LayoutDashboard size={16} strokeWidth={2} />
            <span className="hidden sm:inline text-xs font-medium">Dashboard</span>
          </Link>
          <NotificationBell />
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
