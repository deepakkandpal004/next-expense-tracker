import { motion } from "motion/react";
import { formatPercentage } from "@/lib/formatters/locale";
import { cn } from "@/lib/ui/cn";
import { utilBar, BAR_COLORS } from "./status";

export function UtilizationBar({ spent, total }: { spent: number; total: number }) {
  const ratio = total > 0 ? Math.min(spent / total, 1) : 0;
  const percentage = Math.round(ratio * 100);
  const barTone = utilBar(ratio);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-foreground-secondary">Spent</span>
        <span className="text-xs font-medium text-foreground-secondary">
          {formatPercentage(ratio)} of budget
        </span>
      </div>
      <div
        aria-label={`${percentage}% of budget used`}
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        className="relative h-2 w-full overflow-hidden rounded-full bg-surface-subtle"
        role="progressbar"
      >
        <motion.div
          className={cn("h-full rounded-full", BAR_COLORS[barTone].bar)}
          initial={{ width: "0%" }}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
      </div>
    </div>
  );
}
