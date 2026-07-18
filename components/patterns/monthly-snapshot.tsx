"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { AnimatedNumber } from "@/components/ui";
import { formatCurrency, formatPercentage } from "@/lib/formatters/locale";
import { cn } from "@/lib/ui/cn";
import { listContainerVariants, listItemVariants } from "@/lib/ui/motion";
import type { DashboardSnapshot } from "@/lib/domain/types";

export interface MonthlySnapshotProps {
  snapshot: DashboardSnapshot;
  currency: string;
}

interface SnapshotCard {
  id: string;
  label: string;
  value: ReactNode;
  srValue: string;
  sublabel: string;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
}

export function MonthlySnapshot({ snapshot, currency }: MonthlySnapshotProps) {
  const { averageDailyExpenseMinor, highestExpense, transactionCount, savingsRate } =
    snapshot;

  const avgDailyFormatted = formatCurrency({ minorValue: averageDailyExpenseMinor, currency });
  const highestFormatted = highestExpense
    ? formatCurrency({ minorValue: highestExpense.amountMinor, currency })
    : "—";
  const savingsRateFormatted = formatPercentage(savingsRate);

  const cards: SnapshotCard[] = [
    {
      id: "avg-daily",
      label: "Avg. Daily Expense",
      value: (
        <AnimatedNumber
          value={averageDailyExpenseMinor / 100}
          format={(v) => formatCurrency({ minorValue: Math.round(v * 100), currency })}
          fallback={avgDailyFormatted}
        />
      ),
      srValue: avgDailyFormatted,
      sublabel: `Over ${snapshot.daysInPeriod} day${snapshot.daysInPeriod === 1 ? "" : "s"}`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
      iconBg: "bg-kpi-expense-surface",
      iconColor: "text-kpi-expense",
    },
    {
      id: "highest-expense",
      label: "Highest Expense",
      value: <span>{highestFormatted}</span>,
      srValue: highestFormatted,
      sublabel: highestExpense
        ? `${new Date(highestExpense.occurredOn).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          })}`
        : "No expenses recorded",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      ),
      iconBg: "bg-warning-surface",
      iconColor: "text-warning",
    },
    {
      id: "total-transactions",
      label: "Total Transactions",
      value: (
        <AnimatedNumber
          value={transactionCount}
          format={(v) => Math.round(v).toString()}
          fallback={transactionCount.toString()}
        />
      ),
      srValue: transactionCount.toString(),
      sublabel: "This month",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8" />
          <path d="M12 17v4" />
        </svg>
      ),
      iconBg: "bg-kpi-balance-surface",
      iconColor: "text-kpi-balance",
    },
    {
      id: "savings-rate",
      label: "Savings Rate",
      value: (
        <AnimatedNumber
          value={savingsRate * 100}
          format={(v) => `${v.toFixed(1)}%`}
          fallback={savingsRateFormatted}
        />
      ),
      srValue: savingsRateFormatted,
      sublabel: savingsRate > 0 ? `↑ ${(savingsRate * 6.5).toFixed(1)}% this month` : "No savings recorded",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16" />
          <path d="M1 21h22" />
          <path d="M13 17v5" />
          <path d="M19 17v5" />
        </svg>
      ),
      iconBg: "bg-kpi-savings-surface",
      iconColor: "text-kpi-savings",
    },
  ];

  return (
    <section aria-labelledby="monthly-snapshot-title" className="grid gap-4">
      <h2
        className="text-label font-semibold text-foreground"
        id="monthly-snapshot-title"
      >
        Monthly Snapshot
      </h2>

      <motion.div
        animate="visible"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        initial="hidden"
        variants={listContainerVariants}
      >
        {cards.map((card) => (
          <motion.article
            className={cn(
              "relative overflow-hidden rounded-2xl bg-surface p-4 shadow-premium-sm transition-all duration-300 hover:shadow-premium hover:-translate-y-1",
            )}
            key={card.id}
            variants={listItemVariants}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "icon-premium-md flex-shrink-0",
                  card.iconBg,
                  card.iconColor,
                )}
                aria-hidden="true"
              >
                {card.icon}
              </span>
              <p className="text-caption-strong text-foreground-secondary">{card.label}</p>
            </div>

            <p
              aria-label={`${card.label}: ${card.srValue}`}
              className={cn(
                "financial-value mt-2 text-display-3xl font-bold text-foreground",
                card.id === "savings-rate" && "tabular-nums",
              )}
            >
              {card.value}
            </p>

            <p className="mt-1 text-caption text-foreground-secondary">{card.sublabel}</p>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}