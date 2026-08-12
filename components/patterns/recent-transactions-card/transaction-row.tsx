"use client";

import { motion, AnimatePresence } from "motion/react";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/formatters/locale";
import { getCategoryDefinition } from "@/lib/domain/categories";
import { cn } from "@/lib/ui/cn";
import { listItemVariants, pressVariants } from "@/lib/ui/motion";
import type { Transaction } from "@/lib/domain/types";
import { categoryIcon, getPaymentMethodIcon, relativeDate } from "./utils";

interface TransactionRowProps {
  transaction: Transaction;
  currency: string;
  index: number;
  onDelete?: (id: string) => void;
}

export function TransactionRow({ transaction, currency, index, onDelete }: TransactionRowProps) {
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
            <span className="flex items-center gap-1 font-manrope">
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
