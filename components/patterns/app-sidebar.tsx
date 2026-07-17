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
  Receipt,
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
}

type NavPlaceholderId =
  | "budgets"
  | "goals"
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
}

const NAV_ITEMS: readonly NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, status: "available" },
  { id: "transactions", label: "Transactions", icon: <ListChecks size={20} />, status: "available" },
  { id: "analytics", label: "Analytics", icon: <LineChart size={20} />, status: "available" },
  { id: "budgets", label: "Budgets", icon: <Wallet size={20} />, status: "coming-soon" },
  { id: "goals", label: "Goals", icon: <Target size={20} />, status: "coming-soon" },
  { id: "categories", label: "Categories", icon: <Layers size={20} />, status: "coming-soon" },
  { id: "recurring", label: "Recurring", icon: <Repeat size={20} />, status: "coming-soon" },
  { id: "reports", label: "Reports", icon: <FileBarChart size={20} />, status: "coming-soon" },
  { id: "settings", label: "Settings", icon: <Settings size={20} />, status: "coming-soon" },
];

function LogoMark() {
  return (
    <span
      aria-hidden="true"
      className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-inner"
    >
      <Receipt size={20} strokeWidth={2.4} />
    </span>
  );
}

function NavRow({ item, isActive, hrefFor, onNavigate }: {
  item: NavItem;
  isActive: boolean;
  hrefFor: AppSidebarProps["hrefFor"];
  onNavigate?: () => void;
}) {
  const baseClass = cn(
    "group flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-interface-sm font-medium transition-colors duration-150",
    isActive
      ? "bg-sidebar-item-active-bg text-sidebar-item-active-foreground shadow-inner shadow-black/10"
      : "text-sidebar-foreground hover:bg-sidebar-item-hover hover:text-white",
    item.status === "coming-soon" && "cursor-not-allowed opacity-55 hover:bg-transparent hover:text-sidebar-foreground",
  );

  const content = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "shrink-0 transition-transform duration-150",
          isActive ? "text-white" : "text-sidebar-foreground-muted group-hover:text-white",
        )}
      >
        {item.icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.status === "coming-soon" ? (
        <span className="rounded-full border border-sidebar-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sidebar-foreground-muted">
          Soon
        </span>
      ) : null}
      {isActive ? (
        <motion.span
          aria-hidden="true"
          layoutId="app-sidebar-active-indicator"
          className="ml-auto h-6 w-1 rounded-full bg-accent"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      ) : null}
    </>
  );

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

function UserFooter({ user, onSignOut, signingOut }: {
  user: SidebarUser;
  onSignOut: () => void;
  signingOut: boolean;
}) {
  const displayName = user.name?.trim() || user.email;
  return (
    <div className="border-t border-sidebar-border p-3">
      <button
        type="button"
        onClick={onSignOut}
        disabled={signingOut}
        aria-label={`Sign out ${displayName}`}
        className="group flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-sidebar-item-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {user.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            src={user.imageUrl}
            className="h-9 w-9 shrink-0 rounded-full border border-white/10 object-cover"
          />
        ) : (
          <div aria-hidden="true" className="h-9 w-9 shrink-0 rounded-full bg-white/10" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-interface-sm font-semibold text-white">{displayName}</p>
          <p className="truncate text-interface-xs text-sidebar-foreground-muted">{user.email}</p>
        </div>
        <LogOut
          aria-hidden="true"
          size={16}
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
}: AppSidebarProps) {
  return (
    <aside
      aria-label="Application navigation"
      className="flex h-full w-full flex-col bg-sidebar-gradient text-sidebar-foreground"
    >
      <div className="flex items-center gap-3 border-b border-sidebar-border p-5">
        <LogoMark />
        <div className="min-w-0">
          <p className="text-interface-md font-bold leading-[1.15] text-white">Expense</p>
          <p className="text-interface-md font-bold leading-[1.15] text-white">Tracker</p>
        </div>
      </div>
      <nav aria-label="Primary" className="flex-1 overflow-y-auto p-3">
        <ul className="grid gap-1">
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
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </nav>
      <UserFooter user={user} onSignOut={onSignOut} signingOut={signingOut} />
    </aside>
  );
}
