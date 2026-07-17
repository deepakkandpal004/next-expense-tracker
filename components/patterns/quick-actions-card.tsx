"use client";

import { motion } from "motion/react";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Target } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";
import { listItemVariants } from "@/lib/ui/motion";

type ActionTone = "expense" | "income" | "balance" | "savings";

interface QuickAction {
  id: string;
  label: string;
  icon: ReactNode;
  tone: ActionTone;
  status: "available" | "coming-soon";
  onSelect?: () => void;
}

interface QuickActionsCardProps {
  onAddExpense: () => void;
  onAddIncome: () => void;
  className?: string;
}

const TONE_SURFACE: Record<ActionTone, string> = {
  expense: "bg-kpi-expense-surface",
  income: "bg-kpi-income-surface",
  balance: "bg-kpi-balance-surface",
  savings: "bg-kpi-savings-surface",
};

const TONE_FOREGROUND: Record<ActionTone, string> = {
  expense: "text-kpi-expense-foreground",
  income: "text-kpi-income-foreground",
  balance: "text-kpi-balance-foreground",
  savings: "text-kpi-savings-foreground",
};

function ActionButton({ action }: { action: QuickAction }) {
  const isDisabled = action.status === "coming-soon";
  const commonClass = cn(
    "group/action flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-interface-sm font-medium transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
    isDisabled
      ? "cursor-not-allowed border-border opacity-50 text-foreground-secondary bg-surface"
      : "border-border bg-surface text-foreground hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]",
  );
  const inner = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-150",
          TONE_SURFACE[action.tone],
          !isDisabled && "group-hover/action:scale-[1.08]",
        )}
      >
        <span className={cn("flex items-center justify-center", TONE_FOREGROUND[action.tone])}>
          {action.icon}
        </span>
      </span>
      <span>{action.label}</span>
      {isDisabled ? (
        <span className="rounded-full bg-surface-subtle px-1.5 py-0.5 text-interface-xs text-foreground-secondary">
          Soon
        </span>
      ) : null}
    </>
  );

  if (isDisabled) {
    return (
      <button
        aria-disabled="true"
        aria-label={`${action.label} — coming soon`}
        className={commonClass}
        disabled
        title={`${action.label} — coming soon`}
        type="button"
      >
        {inner}
      </button>
    );
  }

  return (
    <button
      aria-label={action.label}
      className={commonClass}
      onClick={action.onSelect}
      type="button"
    >
      {inner}
    </button>
  );
}

export function QuickActionsCard({ onAddExpense, onAddIncome, className }: QuickActionsCardProps) {
  const actions: readonly QuickAction[] = [
    {
      id: "expense",
      label: "Add Expense",
      icon: <ArrowDownLeft size={20} strokeWidth={2.4} />,
      tone: "expense",
      status: "available",
      onSelect: onAddExpense,
    },
    {
      id: "income",
      label: "Add Income",
      icon: <ArrowUpRight size={20} strokeWidth={2.4} />,
      tone: "income",
      status: "available",
      onSelect: onAddIncome,
    },
    {
      id: "transfer",
      label: "Transfer",
      icon: <ArrowLeftRight size={20} strokeWidth={2.4} />,
      tone: "balance",
      status: "coming-soon",
    },
    {
      id: "goal",
      label: "Set Goal",
      icon: <Target size={20} strokeWidth={2.4} />,
      tone: "savings",
      status: "coming-soon",
    },
  ];

  return (
    <motion.section
      aria-labelledby="quick-actions-title"
      className={cn(
        "rounded-2xl border border-border bg-surface px-6 py-4 shadow-sm",
        className,
      )}
      variants={listItemVariants}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-interface-sm font-semibold text-foreground" id="quick-actions-title">
          Quick Actions
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          {actions.map((action) => (
            <ActionButton action={action} key={action.id} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
