"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Plus, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { menuSurfaceVariants } from "@/lib/ui/motion";
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
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl overflow-hidden transition-transform duration-300 ease-out hover:scale-110">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo1.png" alt="" className="h-full w-full object-cover" />
        </div>
        <span className={cn(
          "pulse-logo text-base font-extrabold leading-none whitespace-nowrap transition-all duration-300",
          expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden",
        )}>
          <span className="text-white">Expense Tracker </span>
          <span className="text-[#00DCE5]">AI</span>
        </span>
      </Link>

      <nav aria-label="Primary" className={cn("flex-1 overflow-y-auto py-4", expanded ? "px-3" : "px-2")}>
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

      <div className={cn("shrink-0 pb-3", expanded ? "px-3" : "px-2")}>
        <button
          onClick={() => onNewRecord?.()}
          className={cn(
            "flex items-center justify-center rounded-xl bg-[#00DCE5] font-semibold text-[#0B0F14] transition-all duration-200 hover:bg-[#00DCE5]/90 hover:shadow-[0_0_20px_rgba(0,220,229,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5] focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.98]",
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
              "mt-2 flex items-center justify-center rounded-xl text-[#5B6472] transition-colors hover:bg-white/[0.04] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00DCE5]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
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
