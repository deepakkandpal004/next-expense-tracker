"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  FileBarChart,
  LayoutDashboard,
  Layers,
  Sparkles,
  ListChecks,
  Repeat,
  Settings,
  Target,
  Wallet,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
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

interface AppSidebarProps {
  activeDestinationId: SidebarDestinationId;
  hrefFor: (destination: Exclude<SidebarDestinationId, NavPlaceholderId>) => string;
  onNavigate?: () => void;
  onNewRecord?: () => void;
  onToggleCollapsed?: () => void;
  collapsed?: boolean;
}

type NavPlaceholderId = never;

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
  { id: "categories", label: "Categories", icon: <Layers size={18} strokeWidth={2} />, status: "available" },
  { id: "recurring", label: "Recurring", icon: <Repeat size={18} strokeWidth={2} />, status: "available" },
  { id: "reports", label: "Reports", icon: <FileBarChart size={18} strokeWidth={2} />, status: "available" },
  { id: "settings", label: "Settings", icon: <Settings size={18} strokeWidth={2} />, status: "available" },
];

const NAV_SECTIONS: readonly { title: string; items: SidebarDestinationId[] }[] = [
  { title: "Overview", items: ["dashboard", "transactions", "ai-insights"] },
  { title: "Manage", items: ["budgets", "goals", "categories", "recurring"] },
  { title: "Analytics", items: ["reports", "settings"] },
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
    "group relative flex h-11 items-center rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#36ADA3]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121358]",
    expanded ? "w-full gap-3 px-3" : "mx-auto w-11 justify-center px-0",
    isActive
      ? "bg-[rgba(54,173,163,0.12)] font-medium text-white hover:bg-[rgba(54,173,163,0.18)]"
      : "text-[#8B95A5] hover:bg-white/[0.04] hover:text-[#D3DBEB]",
    item.status === "coming-soon" && "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-[#6B769E]",
  );

  const iconClass = cn(
    "shrink-0 transition-colors duration-200",
    isActive
      ? "text-[#36ADA3]"
      : "text-[#6B769E] group-hover:text-[#A9B4CF]",
  );

  const content = (
    <>
      <span aria-hidden="true" className={iconClass}>
        {item.icon}
      </span>
      <span
        className={cn(
          "truncate text-sm whitespace-nowrap transition-all duration-200",
          expanded
            ? "min-w-0 flex-1 opacity-100"
            : "w-0 flex-none overflow-hidden opacity-0",
        )}
      >
        {item.label}
      </span>
      {isActive && expanded && (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#36ADA3] shadow-[0_0_6px_rgba(54,173,163,0.6)]" />
      )}
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

export function AppSidebar({
  activeDestinationId,
  hrefFor,
  onNavigate,
  onNewRecord,
  onToggleCollapsed,
  collapsed = false,
}: AppSidebarProps) {
  const expanded = !collapsed;

  return (
    <aside
      aria-label="Application navigation"
      className={cn(
        "flex h-full flex-col transition-all duration-300 ease-in-out overflow-hidden",
        "bg-[#121358] border-r border-white/[0.06]",
        expanded ? "w-[240px]" : "w-[60px]",
      )}
    >
      {/* Logo */}
      <Link href="/" aria-label="Expense AI home" className={cn(
        "group flex items-center border-b border-white/[0.06] shrink-0 hover:bg-white/[0.03] transition-colors",
        expanded ? "pl-5 pr-0 py-5 gap-1" : "justify-center px-0 py-5 gap-0",
      )}>
        <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-2xl overflow-hidden -mr-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="h-full w-full object-cover" />
        </div>
        <span className={cn(
          "pulse-logo text-xl whitespace-nowrap transition-all duration-300",
          expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden",
        )}>
          <span className="text-white">Expense </span>
          <span className="text-[#36ADA3]">AI</span>
        </span>
      </Link>

      {/* Navigation */}
      <nav aria-label="Primary" className={cn("flex-1 overflow-y-auto py-4", expanded ? "px-3" : "px-2")}>
        {expanded ? (
          <ul className="flex flex-col gap-5">
            {NAV_SECTIONS.map((section) => (
              <li key={section.title}>
                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#6B769E]">
                  {section.title}
                </p>
                <ul className="flex flex-col gap-0.5">
                  {section.items.map((id) => {
                    const item = NAV_ITEMS.find((n) => n.id === id);
                    if (!item) return null;
                    return (
                      <motion.li
                        key={item.id}
                        initial="hidden"
                        animate="visible"
                        variants={menuSurfaceVariants}
                      >
                        <NavRow
                          item={item}
                          isActive={item.id === activeDestinationId}
                          hrefFor={hrefFor}
                          onNavigate={onNavigate}
                          expanded={expanded}
                        />
                      </motion.li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        ) : (
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
                    isActive={item.id === activeDestinationId}
                    hrefFor={hrefFor}
                    onNavigate={onNavigate}
                    expanded={expanded}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </nav>

      {/* New Record FAB */}
      <div className={cn("shrink-0 pb-3", expanded ? "px-3" : "px-2")}>
        <button
          onClick={() => onNewRecord?.()}
          className={cn(
            "flex items-center justify-center rounded-xl bg-[#36ADA3] font-semibold text-[#121358] transition-all duration-200 hover:bg-[#36ADA3]/90 hover:shadow-[0_0_20px_rgba(54,173,163,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#36ADA3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121358] active:scale-[0.98]",
            expanded ? "h-12 w-full gap-2 px-4" : "mx-auto size-11",
          )}
        >
          <Plus size={18} strokeWidth={2.5} className="shrink-0" />
          <span className={cn(
            "text-sm whitespace-nowrap transition-all duration-200",
            expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden",
          )}>
            New Record
          </span>
        </button>

        {onToggleCollapsed && (
          <button
            type="button"
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
            title={expanded ? "Collapse sidebar" : "Expand sidebar"}
            onClick={onToggleCollapsed}
            className={cn(
              "mt-2 flex items-center justify-center rounded-xl text-[#6B769E] transition-colors hover:bg-white/[0.04] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#36ADA3]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121358]",
              expanded ? "h-10 w-full" : "mx-auto size-11",
            )}
          >
            {expanded ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
        )}
      </div>
    </aside>
  );
}
