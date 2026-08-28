"use client";

import { motion } from "motion/react";
import { Receipt, Search, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/src/common/ui";
import { MOTION_DURATION, MOTION_EASE } from "@/src/common/ui/motion";

export interface TransactionEmptyStateProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
  onAddTransaction?: () => void;
}

export function TransactionEmptyState({
  hasFilters,
  onClearFilters,
  onAddTransaction,
}: TransactionEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: MOTION_DURATION.slow, ease: MOTION_EASE.emphasized }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-subtle/30 px-6 py-16 text-center"
    >
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-subtle">
          {hasFilters ? (
            <Search size={32} className="text-foreground-secondary" strokeWidth={1.5} />
          ) : (
            <Receipt size={32} className="text-foreground-secondary" strokeWidth={1.5} />
          )}
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
          className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white shadow-lg"
        >
          {hasFilters ? (
            <Search size={14} strokeWidth={2.5} />
          ) : (
            <Plus size={14} strokeWidth={2.5} />
          )}
        </motion.div>
      </div>

      <h3 className="text-lg font-semibold text-foreground">
        {hasFilters ? "No matching transactions" : "No transactions yet"}
      </h3>

      <p className="mt-2 max-w-sm text-sm text-foreground-secondary">
        {hasFilters
          ? "Try adjusting your search or filters to find what you're looking for."
          : "Start tracking your expenses by adding your first transaction."}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {hasFilters && onClearFilters && (
          <Button
            intent="secondary"
            label="Clear filters"
            onClick={onClearFilters}
          />
        )}
        {onAddTransaction && (
          <Button
            label="Add transaction"
            icon={<Plus size={16} />}
            onClick={onAddTransaction}
          />
        )}
      </div>

      {!hasFilters && (
        <div className="mt-8 flex items-center gap-2 text-xs text-foreground-secondary/60">
          <span>Quick tip</span>
          <ArrowRight size={12} />
          <span>Use the button above or press <kbd className="rounded bg-surface-subtle px-1.5 py-0.5 font-mono text-foreground-secondary">⌘N</kbd></span>
        </div>
      )}
    </motion.div>
  );
}