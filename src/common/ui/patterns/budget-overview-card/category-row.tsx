import { motion } from "motion/react";
import { formatCurrency } from "@/src/common/formatters/locale";
import { cn } from "@/src/common/ui/cn";
import type { CategoryBreakdownRow } from "@/src/common/domain/types";
import { utilBar, BAR_COLORS } from "./status";

export function CategoryRow({
  row,
  budgetMinor,
  currency,
  index,
}: {
  row: CategoryBreakdownRow;
  budgetMinor: number;
  currency: string;
  index: number;
}) {
  const ratio = budgetMinor > 0 ? Math.min(row.amountMinor / budgetMinor, 1) : 0;
  const barTone = utilBar(ratio);
  const amount = formatCurrency({ minorValue: row.amountMinor, currency });

  return (
    <motion.div
      className="group flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors duration-150 hover:bg-surface-subtle/50"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: `var(--${row.semanticToken})` }}
        aria-hidden="true"
      />

      <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
        {row.label}
      </span>

      <span className="shrink-0 text-xs font-semibold text-foreground tabular-nums">
        {amount}
      </span>

      <div className="h-1 w-12 shrink-0 overflow-hidden rounded-full bg-surface-subtle">
        <motion.div
          className={cn("h-full rounded-full", BAR_COLORS[barTone].bar)}
          initial={{ width: "0%" }}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ duration: 0.6, delay: index * 0.05 + 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </motion.div>
  );
}
