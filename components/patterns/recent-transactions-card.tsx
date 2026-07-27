"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  ChevronRight,
  CreditCard,
  DollarSign,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { formatCurrency } from "@/lib/formatters/locale";
import { getCategoryDefinition } from "@/lib/domain/categories";
import { cn } from "@/lib/ui/cn";
import { listContainerVariants, listItemVariants, pressVariants } from "@/lib/ui/motion";
import type { Transaction, TransactionType } from "@/lib/domain/types";

export interface RecentTransactionsCardProps {
  transactions: readonly Transaction[];
  currency: string;
  allRecordsHref: string;
}

const CATEGORY_ICON: Record<string, ReactNode> = {
  Food: <DollarSign size={16} strokeWidth={2.2} />,
  Transportation: <CreditCard size={16} strokeWidth={2.2} />,
  Shopping: <DollarSign size={16} strokeWidth={2.2} />,
  Entertainment: <DollarSign size={16} strokeWidth={2.2} />,
  Bills: <CreditCard size={16} strokeWidth={2.2} />,
  Healthcare: <DollarSign size={16} strokeWidth={2.2} />,
  Income: <DollarSign size={16} strokeWidth={2.2} />,
  Other: <DollarSign size={16} strokeWidth={2.2} />,
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
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function getPaymentMethodIcon(type: TransactionType): ReactNode {
  return type === "income" ? <DollarSign size={14} strokeWidth={2.2} /> : <CreditCard size={14} strokeWidth={2.2} />;
}

interface TransactionRowProps {
  transaction: Transaction;
  currency: string;
  index: number;
  onDelete?: (id: string) => void;
}

function TransactionRow({ transaction, currency, index, onDelete }: TransactionRowProps) {
  const definition = getCategoryDefinition(transaction.categoryId);
  const cssVar = `var(--color-${definition.semanticToken})`;
  const isIncome = transaction.type === "income";
  const formattedAmount = formatCurrency({ minorValue: Math.abs(transaction.amountMinor), currency });
  const sign = isIncome ? "+" : "−";
  const [isHovered, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.li
      layout
      onMouseEnter={() => { setIsHovered(true); setShowActions(true); }}
      onMouseLeave={() => { setIsHovered(false); setShowActions(false); }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "group relative rounded-xl bg-white/[0.02] p-4 transition-all duration-300",
        "hover:bg-white/[0.05]",
        isHovered && "bg-white/[0.05]",
      )}
      initial={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: index * 0.04 }}
      variants={listItemVariants}
    >
      <div className="flex items-start gap-3">
        <motion.div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200",
            isIncome ? "bg-tertiary-container/15 text-tertiary-fixed" : "bg-secondary-container/15 text-secondary-fixed",
          )}
          animate={isHovered ? { scale: 1.08, rotate: 3 } : { scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          aria-hidden="true"
        >
          <span style={{ color: cssVar }}>{categoryIcon(transaction.categoryId)}</span>
        </motion.div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-on-surface">{transaction.description}</p>
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {isIncome && (
                <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-container/15 px-2 py-0.5 text-[10px] font-semibold text-tertiary-fixed">
                  Income
                </span>
              )}
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  isIncome ? "bg-tertiary-container/15 text-tertiary-fixed" : "bg-secondary-container/15 text-secondary-fixed",
                )}
              >
                {getPaymentMethodIcon(transaction.type)}
                <span className="hidden sm:inline">{isIncome ? "Income" : "Card"}</span>
              </span>
            </div>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant/50">
            <span
              className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px]"
              style={{ borderColor: `color-mix(in srgb, ${cssVar} 30%, transparent)` }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cssVar }} aria-hidden="true" />
              {definition.label}
            </span>
            <span className="flex items-center gap-1 font-geist">
              <span className="h-1.5 w-1.5 rounded-full bg-on-surface-variant/20" aria-hidden="true" />
              {relativeDate(transaction.occurredOn)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <motion.p
            className={cn(
              "financial-value text-sm font-bold tabular-nums transition-colors",
              isIncome ? "text-tertiary-fixed" : "text-secondary-fixed",
            )}
            aria-label={`${isIncome ? "Income" : "Expense"} ${formattedAmount}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.04 }}
          >
            {sign} {formattedAmount}
          </motion.p>

          <AnimatePresence mode="popLayout">
            {showActions && onDelete ? (
              <motion.div
                initial={{ opacity: 0, x: 16, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 16, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1"
              >
                <button
                  onClick={() => onDelete(transaction.id)}
                  className="p-2 rounded-lg text-on-surface-variant/50 hover:bg-danger-container/15 hover:text-danger transition-colors"
                  aria-label={`Delete ${transaction.description}`}
                  {...pressVariants}
                >
                  <Trash2 size={16} strokeWidth={2.2} />
                </button>
                <button
                  className="p-2 rounded-lg text-on-surface-variant/50 hover:bg-white/5 hover:text-on-surface transition-colors"
                  aria-label="More options"
                  {...pressVariants}
                >
                  <MoreHorizontal size={16} strokeWidth={2.2} />
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent origin-left"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      />
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
      className="glass-vessel overflow-hidden"
    >
      <header className="flex items-center justify-between border-b border-white/5 px-5 py-4">
        <h2
          className="text-sm font-semibold text-on-surface"
          id="recent-tx-title"
        >
          Recent Transactions
        </h2>
        <Link
          aria-label="View all transactions"
          className="text-xs font-medium text-primary-fixed transition-all hover:drop-shadow-[0_0_8px_#00dce5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          href={allRecordsHref}
        >
          View all
          <ChevronRight size={14} strokeWidth={2.5} className="ml-1 inline-block" aria-hidden="true" />
        </Link>
      </header>

      {transactions.length === 0 ? (
        <div className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-container/10 text-primary-fixed">
            <DollarSign size={28} strokeWidth={1.8} />
          </div>
          <p className="text-sm font-medium text-on-surface">
            No transactions yet
          </p>
          <p className="mt-1 text-xs text-on-surface-variant/50 max-w-[240px] mx-auto">
            Start by adding your first expense or income to track your financial activity
          </p>
          <a
            href={allRecordsHref.replace("/records", "/records?addTransaction=1")}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-on-primary-fixed bg-primary-container rounded-full hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,245,255,0.3)]"
          >
            <DollarSign size={16} strokeWidth={2.2} />
            Add Your First Transaction
          </a>
        </div>
      ) : (
        <ul
          aria-label="Recent transactions"
          className="divide-y divide-white/5"
        >
          <AnimatePresence mode="popLayout">
            <motion.ul
              animate="visible"
              className="grid gap-0"
              data-record-view="cards"
              initial="hidden"
              variants={listContainerVariants}
            >
              {transactions.map((tx, index) => (
                <TransactionRow
                  key={tx.id}
                  currency={currency}
                  index={index}
                  transaction={tx}
                />
              ))}
            </motion.ul>
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}