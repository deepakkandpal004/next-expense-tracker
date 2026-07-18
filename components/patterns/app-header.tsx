"use client";

import { Bell, LogOut, Menu, Monitor, Moon, Search, Settings, Sun, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type RefObject } from "react";
import { useTheme } from "@/contexts/ThemeContext";
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

function AppearanceToggle() {
  const { appearance, resolvedAppearance, setAppearance } = useTheme();

  const cycle = () => {
    setAppearance(
      appearance === "light" ? "dark" : appearance === "dark" ? "system" : "light",
    );
  };

  const icon = appearance === "system"
    ? <Monitor aria-hidden="true" size={16} strokeWidth={2} />
    : resolvedAppearance === "dark"
      ? <Moon aria-hidden="true" size={16} strokeWidth={2} />
      : <Sun aria-hidden="true" size={16} strokeWidth={2} />;

  const preferenceLabel = appearance === "system"
    ? "system preference"
    : appearance === "dark"
      ? "dark"
      : "light";
  const label = `Change appearance (currently ${preferenceLabel})`;

  return (
    <button
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground-secondary transition-colors duration-150 hover:bg-surface-subtle hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      onClick={cycle}
      title={label}
      type="button"
    >
      {icon}
    </button>
  );
}

function NotificationBell({ unreadCount = 0 }: { unreadCount?: number }) {
  const label = unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications";
  return (
    <button
      aria-label={label}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground-secondary transition-colors duration-150 hover:bg-surface-subtle hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      title={label}
      type="button"
    >
      <Bell aria-hidden="true" size={16} strokeWidth={2} />
      {unreadCount > 0 ? (
        <span
          aria-hidden="true"
          className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger shadow-[0_0_0_2px_var(--color-surface)]"
        />
      ) : null}
    </button>
  );
}

function UserAvatar({ user, onSignOut, signingOut }: { user: SafeUser; onSignOut: () => void; signingOut: boolean }) {
  const initial = ((user.name?.trim()[0] ?? user.email[0]) || "?").toUpperCase();

  return (
    <DropdownMenu
      align="end"
      label="User menu"
      trigger={
        <button
          aria-label="Open user menu"
          className="group relative inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-subtle transition-colors duration-150 hover:bg-surface-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          type="button"
        >
          {user.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
              src={user.imageUrl}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs font-semibold text-foreground-secondary">{initial}</span>
          )}
        </button>
      }
      items={[
        {
          id: "user-info",
          label: "My account",
          disabled: true,
          icon: <User size={16} />,
        },
        {
          id: "settings",
          label: "Settings",
          icon: <Settings size={16} />,
          onSelect: () => {},
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
      className="w-full max-w-md"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = query.trim();
        if (trimmed) onSubmit(trimmed);
      }}
      role="search"
    >
      <div className="relative">
        <Search
          aria-hidden="true"
          className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-150 ${isFocused ? "text-foreground" : "text-foreground-secondary"}`}
          size={15}
        />
        <input
          aria-label="Search transactions and categories"
          className={`h-9 w-full rounded-lg border bg-surface-subtle pl-9 pr-14 text-sm text-foreground placeholder:text-foreground-secondary transition-colors duration-150 ${
            isFocused
              ? "border-focus ring-1 ring-focus/20"
              : "border-transparent hover:border-border"
          }`}
          onBlur={() => setIsFocused(false)}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search..."
          ref={inputRef}
          type="search"
          value={query}
        />
        <kbd
          aria-hidden="true"
          className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium transition-colors duration-150 sm:flex ${
            isFocused
              ? "border-focus/30 bg-focus/10 text-focus"
              : "border-border bg-surface text-foreground-secondary"
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
    <header className="sticky top-0 z-30 border-b border-border bg-surface">
      <div className="flex items-center gap-3 px-4 py-2.5 sm:px-6 md:gap-4 lg:px-8">
        <button
          aria-label="Open navigation"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-foreground-secondary transition-colors duration-150 hover:bg-surface-subtle hover:text-foreground md:hidden"
          onClick={onMobileMenuOpen}
          type="button"
        >
          <Menu aria-hidden="true" size={18} />
        </button>

        <div className="hidden min-w-0 shrink-0 md:block">
          <span className="text-sm font-semibold text-foreground tracking-tight">Expense AI</span>
        </div>

        <div className="flex flex-1 justify-center md:justify-start">
          <SearchInput inputRef={searchRef} onSubmit={submitSearch} />
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <NotificationBell />
          <AppearanceToggle />
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
