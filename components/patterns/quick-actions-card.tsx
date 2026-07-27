"use client";

import { motion } from "motion/react";
import { ArrowDownLeft, ArrowUpRight, BarChart3, Target } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/ui/cn";
import { listItemVariants } from "@/lib/ui/motion";

interface QuickActionsCardProps {
  onAddExpense: () => void;
  onAddIncome: () => void;
  className?: string;
}

const actions = [
  {
    label: "Expense",
    icon: ArrowDownLeft,
    color: "bg-kpi-expense-surface text-kpi-expense",
    onClick: "expense" as const,
  },
  {
    label: "Income",
    icon: ArrowUpRight,
    color: "bg-kpi-income-surface text-kpi-income",
    onClick: "income" as const,
  },
  {
    label: "Budget",
    icon: Target,
    color: "bg-primary-container/15 text-primary-fixed",
    href: "/budgets",
  },
  {
    label: "Reports",
    icon: BarChart3,
    color: "bg-secondary-container/15 text-secondary-fixed",
    href: "/reports",
  },
];

export function QuickActionsCard({ onAddExpense, onAddIncome, className }: QuickActionsCardProps) {
  const handleClick = (action: typeof actions[number]) => {
    if (action.onClick === "expense") onAddExpense();
    if (action.onClick === "income") onAddIncome();
  };

  return (
    <motion.section
      aria-labelledby="quick-actions-title"
      className={cn(
        "flex items-center gap-2 sm:gap-3 rounded-2xl bg-white/5 px-4 sm:px-5 py-3 shadow-sm",
        className,
      )}
      variants={listItemVariants}
    >
      <h2 className="text-[11px] font-medium text-on-surface-variant/60 uppercase tracking-wider mr-1 sm:mr-2 hidden sm:block" id="quick-actions-title">
        Quick Actions
      </h2>

      {actions.map((action) => {
        const Icon = action.icon;
        const content = (
          <span className="group flex items-center gap-2 rounded-xl border border-white/5 bg-transparent px-3 sm:px-4 py-2 text-[13px] font-medium text-on-surface transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
            <span className={cn("flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-150 group-hover:scale-110", action.color)}>
              <Icon size={14} strokeWidth={2.4} />
            </span>
            <span className="hidden sm:inline">{action.label}</span>
          </span>
        );

        if ("href" in action && action.href) {
          return (
            <Link key={action.label} href={action.href}>
              {content}
            </Link>
          );
        }

        return (
          <button
            key={action.label}
            aria-label={`Add ${action.label.toLowerCase()}`}
            onClick={() => handleClick(action)}
            type="button"
          >
            {content}
          </button>
        );
      })}
    </motion.section>
  );
}
