"use client";

import { motion } from "motion/react";
import { Bell, Menu, Monitor, Moon, Search, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type RefObject } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import type { SafeUser } from "./authenticated-app-shell";

interface AppHeaderProps {
  user: SafeUser;
  onMobileMenuOpen: () => void;
  accountError: string | null;
}

function getGreeting(now: Date): string {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** Client-only ⌘K / Ctrl+K binding for focusing the header search input. */
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
    ? <Monitor aria-hidden="true" size={18} strokeWidth={2.2} />
    : resolvedAppearance === "dark"
      ? <Moon aria-hidden="true" size={18} strokeWidth={2.2} />
      : <Sun aria-hidden="true" size={18} strokeWidth={2.2} />;

  const preferenceLabel = appearance === "system"
    ? "system preference"
    : appearance === "dark"
      ? "dark"
      : "light";
  const label = `Change appearance (currently ${preferenceLabel})`;

  return (
    <button
      aria-label={label}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-[background-color,transform] duration-150 ease-out hover:bg-surface-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-[0.97] motion-reduce:active:scale-100"
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
      className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-[background-color,transform] duration-150 ease-out hover:bg-surface-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-[0.97] motion-reduce:active:scale-100"
      title={label}
      type="button"
    >
      <Bell aria-hidden="true" size={18} strokeWidth={2.2} />
      {unreadCount > 0 ? (
        <span
          aria-hidden="true"
          className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-danger shadow-[0_0_0_2px_var(--color-surface)]"
        />
      ) : null}
    </button>
  );
}

function UserAvatarChip({ user }: { user: SafeUser }) {
  const initial = ((user.name?.trim()[0] ?? user.email[0]) || "?").toUpperCase();
  return (
    <div aria-hidden="true" className="hidden shrink-0 sm:block">
      {user.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          src={user.imageUrl}
          className="h-11 w-11 rounded-full border border-border object-cover"
        />
      ) : (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-surface text-interface-md font-semibold text-accent-foreground">
          {initial}
        </div>
      )}
    </div>
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
  const [shortcutHint, setShortcutHint] = useState<"Ctrl K" | "⌘ K">("Ctrl K");

  useEffect(() => {
    const platform = navigator.platform ?? navigator.userAgent ?? "";
    if (/Mac|iPhone|iPad|iPod/i.test(platform)) {
      setShortcutHint("⌘ K");
    }
  }, []);

  return (
    <form
      className="min-w-0 flex-1"
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
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-foreground-secondary"
          size={18}
        />
        <input
          aria-label="Search transactions and categories"
          className="min-h-11 w-full rounded-full border border-border bg-surface-subtle pl-11 pr-20 text-interface-sm text-foreground placeholder:text-foreground-secondary transition-[background-color,border-color] duration-150 focus-visible:border-focus focus-visible:bg-surface focus-visible:outline-none"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search transactions, categories…"
          ref={inputRef}
          type="search"
          value={query}
        />
        <kbd
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-foreground-secondary sm:flex"
        >
          {shortcutHint}
        </kbd>
      </div>
    </form>
  );
}

export function AppHeader({ user, onMobileMenuOpen, accountError }: AppHeaderProps) {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [greeting, setGreeting] = useState<string | null>(null);

  useEffect(() => {
    setGreeting(getGreeting(new Date()));
  }, []);

  useCommandKShortcut(() => searchRef.current?.focus());

  const displayName =
    user.name?.trim().split(/\s+/)[0] || user.email.split("@")[0] || "there";

  const submitSearch = (query: string) => {
    router.push(`/records?search=${encodeURIComponent(query)}`);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <div className="grid gap-3 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)_auto] lg:items-center lg:gap-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label="Open navigation"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border-strong bg-surface text-foreground transition-colors hover:bg-surface-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus lg:hidden"
            onClick={onMobileMenuOpen}
            type="button"
          >
            <Menu aria-hidden="true" size={20} />
          </button>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="min-w-0"
            initial={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="truncate text-display-sm font-bold text-foreground">
              {greeting ? `${greeting}, ${displayName}!` : `Hello, ${displayName}!`}
              <span aria-hidden="true" className="ml-2 inline-block">👋</span>
            </h1>
            <p className="mt-0.5 truncate text-interface-sm text-foreground-secondary">
              Track smart. Spend better. Achieve more.
            </p>
          </motion.div>
        </div>

        <SearchInput inputRef={searchRef} onSubmit={submitSearch} />

        <div className="flex shrink-0 items-center gap-2 lg:col-start-3">
          <NotificationBell />
          <AppearanceToggle />
          <UserAvatarChip user={user} />
        </div>
      </div>

      {accountError ? (
        <p
          aria-live="assertive"
          className="border-t border-danger-border bg-danger-surface px-4 py-2 text-interface-sm text-danger-foreground sm:px-6 lg:px-8"
          role="alert"
        >
          {accountError}
        </p>
      ) : null}
    </header>
  );
}
