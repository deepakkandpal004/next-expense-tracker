"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  FileBarChart,
  LayoutDashboard,
  Layers,
  LineChart,
  ListChecks,
  LogOut,
  Repeat,
  Settings,
  Target,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";
import { menuSurfaceVariants } from "@/lib/ui/motion";

export type SidebarDestinationId =
  | "dashboard"
  | "transactions"
  | "analytics"
  | "budgets"
  | "goals"
  | "categories"
  | "recurring"
  | "reports"
  | "settings";

export interface SidebarUser {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
}

interface AppSidebarProps {
  user: SidebarUser;
  activeDestinationId: SidebarDestinationId;
  hrefFor: (destination: Exclude<SidebarDestinationId, NavPlaceholderId>) => string;
  onSignOut: () => void;
  signingOut: boolean;
  /** Optional. Called after a nav item is chosen; the mobile sheet uses it to close. */
  onNavigate?: () => void;
  collapsed?: boolean;
}

type NavPlaceholderId =
  | "categories"
  | "recurring"
  | "reports"
  | "settings";

type NavAvailableId = Exclude<SidebarDestinationId, NavPlaceholderId>;

interface NavItem {
  id: SidebarDestinationId;
  label: string;
  icon: ReactNode;
  status: "available" | "coming-soon";
  badge?: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} strokeWidth={2} />, status: "available" },
  { id: "transactions", label: "Transactions", icon: <ListChecks size={18} strokeWidth={2} />, status: "available" },
  { id: "analytics", label: "Analytics", icon: <LineChart size={18} strokeWidth={2} />, status: "available" },
  { id: "budgets", label: "Budgets", icon: <Wallet size={18} strokeWidth={2} />, status: "available" },
  { id: "goals", label: "Goals", icon: <Target size={18} strokeWidth={2} />, status: "available" },
  { id: "categories", label: "Categories", icon: <Layers size={18} strokeWidth={2} />, status: "coming-soon" },
  { id: "recurring", label: "Recurring", icon: <Repeat size={18} strokeWidth={2} />, status: "coming-soon" },
  { id: "reports", label: "Reports", icon: <FileBarChart size={18} strokeWidth={2} />, status: "coming-soon" },
  { id: "settings", label: "Settings", icon: <Settings size={18} strokeWidth={2} />, status: "coming-soon" },
];

function LogoMark() {
  return (
    <span
      aria-hidden="true"
      className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground"
    >
      <Wallet size={16} strokeWidth={2.2} />
    </span>
  );
}

function NavRow({
  item,
  isActive,
  hrefFor,
  onNavigate,
  collapsed,
}: {
  item: NavItem;
  isActive: boolean;
  hrefFor: AppSidebarProps["hrefFor"];
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const baseClass = cn(
    "group relative flex items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium transition-colors duration-150",
    collapsed ? "min-h-[36px] justify-center" : "min-h-[36px]",
    isActive
      ? "bg-sidebar-item-active-bg text-sidebar-item-active-foreground"
      : "text-sidebar-foreground-muted hover:bg-sidebar-item-hover hover:text-white",
    item.status === "coming-soon" && "cursor-not-allowed opacity-45 hover:bg-transparent hover:text-sidebar-foreground-muted",
  );

  const iconClass = cn(
    "shrink-0 transition-colors duration-150",
    isActive ? "text-white" : "text-sidebar-foreground-muted group-hover:text-white",
  );

  const content = (
    <>
      <span aria-hidden="true" className={iconClass}>
        {item.icon}
      </span>
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {item.badge ? (
            <span className="rounded-md border border-sidebar-border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sidebar-foreground-muted">
              {item.badge}
            </span>
          ) : null}
        </>
      )}
    </>
  );

  if (collapsed) {
    if (item.status === "coming-soon") {
      return (
        <button
          type="button"
          aria-disabled="true"
          className={baseClass}
          disabled
          title={`${item.label} — coming soon`}
        >
          {content}
        </button>
      );
    }

    return (
      <Link
        aria-current={isActive ? "page" : undefined}
        className={baseClass}
        href={hrefFor(item.id as NavAvailableId)}
        onClick={onNavigate}
        title={item.label}
      >
        {content}
      </Link>
    );
  }

  if (item.status === "coming-soon") {
    return (
      <button
        type="button"
        aria-disabled="true"
        className={baseClass}
        disabled
        title={`${item.label} — coming soon`}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={baseClass}
      href={hrefFor(item.id as NavAvailableId)}
      onClick={onNavigate}
    >
      {content}
    </Link>
  );
}

function UserFooter({ user, onSignOut, signingOut, collapsed }: {
  user: SidebarUser;
  onSignOut: () => void;
  signingOut: boolean;
  collapsed?: boolean;
}) {
  const displayName = user.name?.trim() || user.email;
  const initial = ((user.name?.trim()[0] ?? user.email[0]) || "?").toUpperCase();

  const avatar = user.imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt=""
      src={user.imageUrl}
      className="h-8 w-8 shrink-0 rounded-full border border-white/10 object-cover"
    />
  ) : (
    <div
      aria-hidden="true"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-item-hover text-xs font-semibold text-white"
    >
      {initial}
    </div>
  );

  if (collapsed) {
    return (
      <div className="border-t border-sidebar-border p-2">
        <button
          type="button"
          onClick={onSignOut}
          disabled={signingOut}
          aria-label={`Sign out ${displayName}`}
          title={displayName}
          className="flex items-center justify-center rounded-lg p-1.5 transition-colors hover:bg-sidebar-item-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {avatar}
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-sidebar-border p-2.5">
      <button
        type="button"
        onClick={onSignOut}
        disabled={signingOut}
        aria-label={`Sign out ${displayName}`}
        className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-sidebar-item-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {avatar}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{displayName}</p>
          <p className="truncate text-xs text-sidebar-foreground-muted">{user.email}</p>
        </div>
        <LogOut
          aria-hidden="true"
          size={14}
          className="shrink-0 text-sidebar-foreground-muted transition-colors group-hover:text-white"
        />
      </button>
    </div>
  );
}

export function AppSidebar({
  user,
  activeDestinationId,
  hrefFor,
  onSignOut,
  signingOut,
  onNavigate,
  collapsed = false,
}: AppSidebarProps) {
  return (
    <aside
      aria-label="Application navigation"
      className={cn(
        "flex h-full flex-col bg-sidebar-bg text-sidebar-foreground transition-all duration-200 ease-in-out",
        collapsed ? "w-[60px]" : "w-[220px]",
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center border-b border-sidebar-border",
        collapsed ? "justify-center p-3" : "gap-2.5 px-4 py-3",
      )}>
        <LogoMark />
        {!collapsed && (
          <span className="text-sm font-bold text-white tracking-tight">Expense AI</span>
        )}
      </div>

      {/* Navigation */}
      <nav aria-label="Primary" className="flex-1 overflow-y-auto px-2 py-2">
        <ul className="grid gap-0.5">
          <AnimatePresence initial={false}>
            {NAV_ITEMS.map((item) => (
              <motion.li
                key={item.id}
                initial="hidden"
                animate="visible"
                variants={menuSurfaceVariants}
              >
                <NavRow
                  item={item}
                  isActive={item.status === "available" && item.id === activeDestinationId}
                  hrefFor={hrefFor}
                  onNavigate={onNavigate}
                  collapsed={collapsed}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </nav>

      {/* User footer */}
      <UserFooter user={user} onSignOut={onSignOut} signingOut={signingOut} collapsed={collapsed} />
    </aside>
  );
}
