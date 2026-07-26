"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  FileBarChart,
  LayoutDashboard,
  Layers,
  Sparkles,
  ListChecks,
  LogOut,
  Repeat,
  Settings,
  Target,
  Wallet,
  Plus,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";
import { menuSurfaceVariants } from "@/lib/ui/motion";

export type SidebarDestinationId =
  | "dashboard"
  | "transactions"
  | "ai-insights"
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
  onNavigate?: () => void;
  onNewRecord?: () => void;
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
}

const NAV_ITEMS: readonly NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} strokeWidth={2} />, status: "available" },
  { id: "transactions", label: "Transactions", icon: <ListChecks size={18} strokeWidth={2} />, status: "available" },
  { id: "ai-insights", label: "AI Insights", icon: <Sparkles size={18} strokeWidth={2} />, status: "available" },
  { id: "budgets", label: "Budgets", icon: <Wallet size={18} strokeWidth={2} />, status: "available" },
  { id: "goals", label: "Goals", icon: <Target size={18} strokeWidth={2} />, status: "available" },
  { id: "categories", label: "Categories", icon: <Layers size={18} strokeWidth={2} />, status: "coming-soon" },
  { id: "recurring", label: "Recurring", icon: <Repeat size={18} strokeWidth={2} />, status: "available" },
  { id: "reports", label: "Reports", icon: <FileBarChart size={18} strokeWidth={2} />, status: "coming-soon" },
  { id: "settings", label: "Settings", icon: <Settings size={18} strokeWidth={2} />, status: "coming-soon" },
];

function NavRow({
  item,
  isActive,
  hrefFor,
  onNavigate,
  expanded,
}: {
  item: NavItem;
  isActive: boolean;
  hrefFor: AppSidebarProps["hrefFor"];
  onNavigate?: () => void;
  expanded: boolean;
}) {
  const baseClass = cn(
    "group relative flex items-center gap-3 rounded-full py-3 transition-all duration-300",
    expanded ? "px-5" : "justify-center px-0",
    isActive
      ? "text-[#00DCE5] bg-[rgba(0,220,229,0.12)] border border-[rgba(0,220,229,0.25)] shadow-[0_0_20px_rgba(0,220,229,0.15)] font-semibold"
      : "text-[#9AA3AF] hover:bg-white/5 hover:text-[#F5F7FA]",
    item.status === "coming-soon" && "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-[#5B6472]",
  );

  const iconClass = cn(
    "shrink-0 transition-colors duration-300",
    isActive ? "text-[#00DCE5]" : "text-[#9AA3AF] group-hover:text-[#F5F7FA]",
  );

  const content = (
    <>
      <span aria-hidden="true" className={iconClass}>
        {item.icon}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate font-medium text-sm whitespace-nowrap transition-all duration-300",
          expanded ? "opacity-100 ml-1" : "opacity-0 w-0 overflow-hidden",
        )}
      >
        {item.label}
      </span>
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
      title={!expanded ? item.label : undefined}
    >
      {content}
    </Link>
  );
}

function UserFooter({ user, onSignOut, signingOut, expanded }: {
  user: SidebarUser;
  onSignOut: () => void;
  signingOut: boolean;
  expanded: boolean;
}) {
  const displayName = user.name?.trim() || user.email;
  const initial = ((user.name?.trim()[0] ?? user.email[0]) || "?").toUpperCase();

  const avatar = user.imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt=""
      src={user.imageUrl}
      className="h-8 w-8 shrink-0 rounded-full border border-primary-fixed/20 object-cover"
    />
  ) : (
    <div
      aria-hidden="true"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary-fixed"
    >
      {initial}
    </div>
  );

  return (
    <div className="border-t border-white/5 p-3">
      <button
        type="button"
        onClick={onSignOut}
        disabled={signingOut}
        aria-label={`Sign out ${displayName}`}
        className={cn(
          "group flex w-full items-center gap-2.5 rounded-full transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60",
          expanded ? "px-3 py-2" : "justify-center px-0 py-2",
        )}
      >
        {avatar}
        <div className={cn(
          "min-w-0 flex-1 transition-all duration-300",
          expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden",
        )}>
          <p className="truncate text-sm font-medium text-on-surface">{displayName}</p>
          <p className="truncate text-[10px] text-on-surface-variant/40 font-geist">{user.email}</p>
        </div>
        <LogOut
          aria-hidden="true"
          size={14}
          className={cn(
            "shrink-0 text-on-surface-variant/40 transition-all duration-300 group-hover:text-primary-fixed",
            expanded ? "opacity-100" : "opacity-0 w-0",
          )}
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
  onNewRecord,
  collapsed = false,
}: AppSidebarProps) {
  const expanded = !collapsed;

  return (
    <aside
      aria-label="Application navigation"
      className={cn(
        "flex h-full flex-col transition-all duration-300 ease-in-out overflow-hidden",
        "bg-surface-container-lowest/40 backdrop-blur-3xl border-r border-white/5",
        expanded ? "w-[220px]" : "w-[60px]",
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center border-b border-white/5 shrink-0",
        expanded ? "px-5 py-5 gap-3" : "justify-center px-0 py-5",
      )}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg overflow-hidden bg-primary-container shadow-[0_0_15px_rgba(0,245,255,0.3)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" alt="" className="h-full w-full object-cover" />
        </div>
        <span className={cn(
          "pulse-logo text-base whitespace-nowrap transition-all duration-300",
          expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden",
        )}>
          Expense AI
        </span>
      </div>

      {/* Navigation */}
      <nav aria-label="Primary" className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="flex flex-col gap-1">
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
                  expanded={expanded}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </nav>

      {/* New Record FAB */}
      <div className={cn("px-3 pb-3 shrink-0", expanded ? "px-3" : "px-2")}>
        <button
          onClick={onNewRecord}
          className={cn(
            "w-full bg-primary-container text-on-primary-fixed font-bold rounded-full flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,245,255,0.4)] hover:scale-105 active:scale-95",
            expanded ? "py-3 px-4" : "py-3 px-0",
          )}
        >
          <Plus size={18} strokeWidth={2.5} className="shrink-0" />
          <span className={cn(
            "text-sm whitespace-nowrap transition-all duration-300",
            expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden",
          )}>
            New Record
          </span>
        </button>
      </div>

      {/* User footer */}
      <UserFooter user={user} onSignOut={onSignOut} signingOut={signingOut} expanded={expanded} />
    </aside>
  );
}
