"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { AnimatedNumber } from "@/components/ui";
import { formatCurrency, formatPercentage } from "@/lib/formatters/locale";
import { cn } from "@/lib/ui/cn";
import { listContainerVariants, listItemVariants } from "@/lib/ui/motion";
import type { DashboardSnapshot } from "@/lib/domain/types";
import { MiniSparkline } from "./mini-sparkline";

export interface MonthlySnapshotProps {
  snapshot: DashboardSnapshot;
  currency: string;
}

interface SnapshotCard {
  id: string;
  label: string;
  value: ReactNode;
  /** Plain-text screen-reader value for animated numbers */
  srValue: string;
  sublabel: string;
  sparkline: readonly number[];
  sparklineColor: string;
}

export function MonthlySnapshot({ snapshot, currency }: MonthlySnapshotProps) {
  const { averageDailyExpenseMinor, highestExpense, transactionCount, savingsRate, sparklines } =
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
      sparkline: sparklines.dailyExpense,
      sparklineColor: "var(--color-kpi-expense)",
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
      sparkline: sparklines.dailyExpense,
      sparklineColor: "var(--color-warning)",
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
      sparkline: sparklines.dailyTransactionCount,
      sparklineColor: "var(--color-kpi-balance)",
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
      sparkline: sparklines.dailyNet,
      sparklineColor: "var(--color-kpi-savings)",
    },
  ];

  return (
    <section aria-labelledby="monthly-snapshot-title" className="grid gap-6">
      <h2
        className="text-interface-md font-semibold text-foreground"
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
            className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm"
            key={card.id}
            variants={listItemVariants}
          >
            <p className="text-interface-xs font-medium text-foreground-secondary">{card.label}</p>

            <p
              aria-label={`${card.label}: ${card.srValue}`}
              className={cn(
                "financial-value mt-2 text-display-sm font-bold text-foreground",
                card.id === "savings-rate" && "tabular-nums",
              )}
            >
              {card.value}
            </p>

            <p className="mt-1 text-interface-xs text-foreground-secondary">{card.sublabel}</p>

            {card.sparkline.length >= 2 ? (
              <div className="mt-auto pt-3">
                <MiniSparkline
                  color={card.sparklineColor}
                  data={card.id === "total-transactions"
                    ? card.sparkline
                    : card.sparkline.map((v) => v / 100)}
                  height={40}
                />
              </div>
            ) : null}
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
