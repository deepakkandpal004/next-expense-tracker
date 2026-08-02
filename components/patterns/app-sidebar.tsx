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
    "group relative flex items-center gap-3 rounded-xl py-2.5 transition-all duration-200",
    expanded ? "px-3" : "justify-center px-0",
    isActive
      ? "text-white bg-[rgba(0,220,229,0.12)] font-medium"
      : "text-[#8B95A5] hover:bg-white/[0.04] hover:text-[#C5CCD6]",
    item.status === "coming-soon" && "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-[#5B6472]",
  );

  const iconClass = cn(
    "shrink-0 transition-colors duration-200",
    isActive
      ? "text-[#00DCE5]"
      : "text-[#6B7580] group-hover:text-[#9AA3AF]",
  );

  const content = (
    <>
      <span aria-hidden="true" className={iconClass}>
        {item.icon}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm whitespace-nowrap transition-all duration-200",
          expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden",
        )}
      >
        {item.label}
      </span>
      {isActive && expanded && (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#00DCE5] shadow-[0_0_6px_rgba(0,220,229,0.6)]" />
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
  collapsed = false,
}: AppSidebarProps) {
  const expanded = !collapsed;

  return (
    <aside
      aria-label="Application navigation"
      className={cn(
        "flex h-full flex-col transition-all duration-300 ease-in-out overflow-hidden",
        "bg-[#0D1117] border-r border-white/[0.06]",
        expanded ? "w-[240px]" : "w-[60px]",
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center border-b border-white/[0.06] shrink-0",
        expanded ? "px-5 py-5 gap-3" : "justify-center px-0 py-5",
      )}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg overflow-hidden bg-[#00DCE5]/10 ring-1 ring-[#00DCE5]/20">
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
      <nav aria-label="Primary" className="flex-1 overflow-y-auto px-3 py-4">
        {expanded ? (
          <ul className="flex flex-col gap-5">
            {NAV_SECTIONS.map((section) => (
              <li key={section.title}>
                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#5B6472]">
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
      <div className="px-3 pb-3 shrink-0">
        <button
          onClick={() => onNewRecord?.()}
          className={cn(
            "w-full bg-[#00DCE5] text-[#0B0F14] font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 hover:bg-[#00DCE5]/90 hover:shadow-[0_0_20px_rgba(0,220,229,0.3)] active:scale-[0.98]",
            expanded ? "py-3 px-4" : "py-3 px-0",
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
      </div>
    </aside>
  );
}
