"use client";

import { motion } from "motion/react";
import {
  Car,
  CircleDollarSign,
  Film,
  HeartPulse,
  LayoutGrid,
  Receipt,
  ShoppingBag,
  Utensils,
} from "lucide-react";
import Link from "next/link";
import { type ReactNode } from "react";
import { formatCurrency } from "@/lib/formatters/locale";
import { getCategoryDefinition } from "@/lib/domain/categories";
import { cn } from "@/lib/ui/cn";
import type { Transaction } from "@/lib/domain/types";

export interface RecentTransactionsCardProps {
  transactions: readonly Transaction[];
  currency: string;
  allRecordsHref: string;
}

/** Lucide icons keyed by the app's category IDs. */
const CATEGORY_ICON: Record<string, ReactNode> = {
  Food: <Utensils size={18} strokeWidth={2.2} />,
  Transportation: <Car size={18} strokeWidth={2.2} />,
  Shopping: <ShoppingBag size={18} strokeWidth={2.2} />,
  Entertainment: <Film size={18} strokeWidth={2.2} />,
  Bills: <Receipt size={18} strokeWidth={2.2} />,
  Healthcare: <HeartPulse size={18} strokeWidth={2.2} />,
  Income: <CircleDollarSign size={18} strokeWidth={2.2} />,
  Other: <LayoutGrid size={18} strokeWidth={2.2} />,
};

function categoryIcon(categoryId: string): ReactNode {
  return CATEGORY_ICON[categoryId] ?? CATEGORY_ICON.Other;
}

function relativeDate(isoString: string): string {
  const now = new Date();
  const date = new Date(isoString);
  const nowDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const targetDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const diffMs = nowDay.getTime() - targetDay.getTime();
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

interface TransactionRowProps {
  transaction: Transaction;
  currency: string;
  index: number;
}

function TransactionRow({ transaction, currency, index }: TransactionRowProps) {
  const definition = getCategoryDefinition(transaction.categoryId);
  const cssVar = `var(--color-${definition.semanticToken})`;
  const isIncome = transaction.type === "income";
  const formattedAmount = formatCurrency({ minorValue: Math.abs(transaction.amountMinor), currency });
  const sign = isIncome ? "+" : "−";

  return (
    <motion.li
      animate={{ opacity: 1, x: 0 }}
      className="flex min-w-0 items-center gap-3 py-2.5"
      initial={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.22, delay: index * 0.045, ease: [0.16, 1, 0.3, 1] }}
    >
      <span
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: `color-mix(in srgb, ${cssVar} 16%, transparent)`,
          color: cssVar,
        }}
      >
        {categoryIcon(transaction.categoryId)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-interface-sm font-semibold text-foreground">
          {transaction.description}
        </p>
        <p className="mt-0.5 text-interface-xs text-foreground-secondary">
          {definition.label}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p
          className={cn(
            "financial-value text-interface-sm font-semibold tabular-nums",
            isIncome ? "text-trend-up-foreground" : "text-trend-down-foreground",
          )}
          aria-label={`${isIncome ? "Income" : "Expense"} ${formattedAmount}`}
        >
          {sign} {formattedAmount}
        </p>
        <p className="mt-0.5 text-interface-xs text-foreground-secondary">
          {relativeDate(transaction.occurredOn)}
        </p>
      </div>
    </motion.li>
  );
}

export function RecentTransactionsCard({
  transactions,
  currency,
  allRecordsHref,
}: RecentTransactionsCardProps) {
  return (
    <section
      aria-labelledby="recent-tx-title"
      className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm"
    >
      <header className="flex items-center justify-between">
        <h2
          className="text-interface-md font-semibold text-foreground"
          id="recent-tx-title"
        >
          Recent Transactions
        </h2>
        <Link
          aria-label="View all transactions"
          className="text-interface-xs font-semibold text-accent transition-colors hover:text-accent/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          href={allRecordsHref}
        >
          View all
        </Link>
      </header>

      {transactions.length === 0 ? (
        <p className="mt-4 text-interface-sm text-foreground-secondary">
          No transactions recorded for this period yet.
        </p>
      ) : (
        <ul
          aria-label="Recent transactions"
          className="mt-1 divide-y divide-border"
        >
          {transactions.map((tx, index) => (
            <TransactionRow
              currency={currency}
              index={index}
              key={tx.id}
              transaction={tx}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
