"use client";

import { motion } from "motion/react";
import { Target } from "lucide-react";
import { CurrencyText } from "@/src/common/ui";
import { MOTION_DURATION, MOTION_EASE, listContainerVariants, listItemVariants } from "@/src/common/ui/motion";
import { CATEGORY_REGISTRY } from "@/src/common/domain/categories";
import type { CategoryBreakdownRow } from "@/src/common/domain/types";

export function CategoryBreakdown({
  categoryBreakdown,
  currency,
}: {
  categoryBreakdown: readonly CategoryBreakdownRow[];
  currency: string;
}) {
  if (categoryBreakdown.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: MOTION_DURATION.standard, ease: MOTION_EASE.emphasized, delay: 0.2 }}
      className="rounded-2xl border border-border/60 bg-surface p-5 shadow-premium-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
          <Target size={16} className="text-accent" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Spending by Category</h3>
      </div>

      <motion.div
        animate="visible"
        initial="hidden"
        variants={listContainerVariants}
        className="space-y-2"
      >
        {categoryBreakdown.map((row, index) => {
          const categoryDef = CATEGORY_REGISTRY[row.categoryId as keyof typeof CATEGORY_REGISTRY];
          const color = `var(--color-${row.semanticToken})`;
          const percentage = Math.round(row.percentage * 100);

          return (
            <motion.div
              key={row.categoryId}
              variants={listItemVariants}
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-subtle"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
                }}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground truncate">
                    {categoryDef?.label ?? row.categoryId}
                  </span>
                  <span className="text-sm font-semibold text-foreground tabular-nums">
                    <CurrencyText currency={currency} minorValue={row.amountMinor} />
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-subtle">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                      initial={{ width: "0%" }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.6, delay: index * 0.05 + 0.3, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                  <span className="text-xs text-foreground-secondary tabular-nums w-10 text-right">
                    {percentage}%
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
