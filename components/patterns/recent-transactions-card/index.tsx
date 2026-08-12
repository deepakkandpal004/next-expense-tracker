"use client";

import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, DollarSign } from "lucide-react";
import Link from "next/link";
import { listContainerVariants } from "@/lib/ui/motion";
import { TransactionRow } from "./transaction-row";
import type { RecentTransactionsCardProps } from "./types";

export { type RecentTransactionsCardProps } from "./types";

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
