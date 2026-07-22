"use client";

import { motion } from "motion/react";
import { Receipt, Calendar, Store, Tag } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { listItemVariants } from "@/lib/ui/motion";

interface AnalysisSummaryProps {
  transactions: number;
  daysAnalyzed: number;
  merchants: number;
  categories: number;
  className?: string;
}

function StatItem({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <motion.div
      variants={listItemVariants}
      className="flex items-center gap-2.5 rounded-xl bg-white/5 dark:bg-white/[0.03] px-3 py-2.5"
    >
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `${color}15`, color }}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-base font-bold text-foreground tabular-nums">{value}</p>
        <p className="text-[10px] text-foreground-secondary">{label}</p>
      </div>
    </motion.div>
  );
}

export function AnalysisSummary({
  transactions,
  daysAnalyzed,
  merchants,
  categories,
  className,
}: AnalysisSummaryProps) {
  return (
    <motion.section
      aria-labelledby="analysis-summary-title"
      className={cn("", className)}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.04 } },
      }}
    >
      <div className="mb-2">
        <h2 className="text-sm font-semibold text-foreground" id="analysis-summary-title">
          Analysis summary
        </h2>
        <p className="mt-0.5 text-xs text-foreground-secondary">
          Overview of the data used in this analysis.
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <StatItem
          icon={<Receipt size={14} strokeWidth={2} />}
          value={transactions}
          label="Transactions"
          color="var(--color-primary)"
        />
        <StatItem
          icon={<Calendar size={14} strokeWidth={2} />}
          value={daysAnalyzed}
          label="Days analyzed"
          color="var(--color-info)"
        />
        <StatItem
          icon={<Store size={14} strokeWidth={2} />}
          value={merchants}
          label="Merchants"
          color="var(--color-warning)"
        />
        <StatItem
          icon={<Tag size={14} strokeWidth={2} />}
          value={categories}
          label="Categories"
          color="var(--color-success)"
        />
      </div>
    </motion.section>
  );
}
