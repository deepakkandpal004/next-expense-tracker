import { motion } from "motion/react";
import { formatCurrency, formatPercentage } from "@/lib/formatters/locale";
import type { CategoryBreakdownRow } from "@/lib/domain/types";

export function CategoryRow({
  row,
  currency,
  index,
}: {
  row: CategoryBreakdownRow;
  currency: string;
  index: number;
}) {
  const percentDisplay = formatPercentage(row.percentage);
  const formatted = formatCurrency({ minorValue: row.amountMinor, currency });
  const cssVar = `var(--color-${row.semanticToken})`;

  return (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      className="group flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors duration-150 hover:bg-surface-subtle/50"
      initial={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.25, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      <span
        aria-hidden="true"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-transform duration-150 group-hover:scale-110"
        style={{ backgroundColor: `color-mix(in srgb, ${cssVar} 15%, transparent)` }}
      >
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: cssVar }}
        />
      </span>

      <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">{row.label}</span>

      <span className="shrink-0 text-xs font-semibold text-foreground tabular-nums">{formatted}</span>

      <div className="h-1 w-14 shrink-0 overflow-hidden rounded-full bg-surface-subtle">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: cssVar }}
          initial={{ width: "0%" }}
          animate={{ width: `${row.percentage * 100}%` }}
          transition={{ duration: 0.6, delay: index * 0.05 + 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <span className="w-10 shrink-0 text-right text-[10px] tabular-nums text-foreground-secondary">{percentDisplay}</span>
    </motion.div>
  );
}
