"use client";

import { motion } from "motion/react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { listItemVariants } from "@/lib/ui/motion";

interface QuickActionsCardProps {
  onAddExpense: () => void;
  onAddIncome: () => void;
  className?: string;
}

export function QuickActionsCard({ onAddExpense, onAddIncome, className }: QuickActionsCardProps) {
  return (
    <motion.section
      aria-labelledby="quick-actions-title"
      className={cn(
        "flex items-center gap-3 rounded-2xl bg-surface px-5 py-3 shadow-sm",
        className,
      )}
      variants={listItemVariants}
    >
      <h2 className="text-[11px] font-medium text-foreground-secondary uppercase tracking-wider mr-2" id="quick-actions-title">
        Quick Actions
      </h2>

      <button
        aria-label="Add expense"
        className="group flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-[13px] font-medium text-foreground transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        onClick={onAddExpense}
        type="button"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-kpi-expense-surface text-kpi-expense transition-transform duration-150 group-hover:scale-110">
          <ArrowDownLeft size={14} strokeWidth={2.4} />
        </span>
        Expense
      </button>

      <button
        aria-label="Add income"
        className="group flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-[13px] font-medium text-foreground transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        onClick={onAddIncome}
        type="button"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-kpi-income-surface text-kpi-income transition-transform duration-150 group-hover:scale-110">
          <ArrowUpRight size={14} strokeWidth={2.4} />
        </span>
        Income
      </button>
    </motion.section>
  );
}
