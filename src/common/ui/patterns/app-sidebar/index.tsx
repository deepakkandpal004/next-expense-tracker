"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Plus, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/src/common/ui/cn";
import { menuSurfaceVariants } from "@/src/common/ui/motion";
import { NAV_ITEMS, NAV_SECTIONS } from "./nav-data";
import { NavRow } from "./nav-row";
import type { AppSidebarProps } from "./types";

export { type AppSidebarProps, type NavItem, type SidebarDestinationId } from "./types";

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
        "bg-black border-r border-white/[0.06]",
        expanded ? "w-[240px]" : "w-[60px]",
      )}
    >
      <Link href="/" aria-label="Expense Tracker AI home" className={cn(
        "flex items-center shrink-0 transition-colors",
        expanded ? "px-4 py-5 gap-2.5" : "justify-center px-0 py-5 gap-0",
      )}>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo1.png" alt="" className="h-full w-full object-cover" />
        </div>
        <span className={cn(
          "pulse-logo text-base font-extrabold leading-none whitespace-nowrap transition-all duration-300",
          expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden",
        )}>
          <span className="text-white">Expense Tracker </span>
          <span className="text-primary">AI</span>
        </span>
      </Link>

      <nav aria-label="Primary" className={cn("flex-1 overflow-y-auto py-4", expanded ? "px-3" : "px-2")}>
        {expanded ? (
          <ul className="flex flex-col gap-5">
            {NAV_SECTIONS.map((section) => (
              <li key={section.title}>
                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
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

      <div className={cn("shrink-0 pb-3", expanded ? "px-3" : "px-2")}>
        <button
          onClick={() => onNewRecord?.()}
          className={cn(
            "flex items-center justify-center rounded-lg bg-primary font-medium text-foreground-inverse transition-all duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98]",
            expanded ? "h-10 w-full gap-2 px-3 text-xs" : "mx-auto size-9",
          )}
        >
          <Plus size={16} strokeWidth={2.5} className="shrink-0" />
          <span className={cn(
            "whitespace-nowrap transition-all duration-150",
            expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden",
          )}>
            New record
          </span>
        </button>

        {onToggleCollapsed && (
          <button
            type="button"
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
            title={expanded ? "Collapse sidebar" : "Expand sidebar"}
            onClick={onToggleCollapsed}
            className={cn(
              "mt-2 flex items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-white/[0.04] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              expanded ? "h-8 w-full" : "mx-auto size-8",
            )}
          >
            {expanded ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
          </button>
        )}
      </div>
    </aside>
  );
}
