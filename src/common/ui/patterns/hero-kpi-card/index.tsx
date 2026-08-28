"use client";

import { motion } from "motion/react";
import { Flame } from "lucide-react";
import { formatPercentage } from "@/src/common/formatters/locale";
import { listItemVariants } from "@/src/common/ui/motion";
import { KpiCard } from "./kpi-card";
import { AIInsightStrip } from "./ai-insight-strip";
import type { HeroKpiCardProps } from "./types";

export { type HeroKpiCardProps, type AiInsight } from "./types";

export function HeroKpiCard({
  currency,
  balance,
  income,
  expense,
  savings,
  savingsRate,
  snapshot,
  aiInsight,
}: HeroKpiCardProps) {
  const streak = Math.min(snapshot?.daysInPeriod ?? 0, 30);

  return (
    <motion.section
      className="grid gap-4"
      variants={listItemVariants}
      initial="hidden"
      animate="visible"
      aria-label="Financial overview"
    >
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard
          kind="balance"
          valueMinor={balance.currentMinor}
          currency={currency}
          trend={balance.trend}
          sparkline={balance.sparkline}
          invertPolarity={false}
          footer={
            streak >= 3 ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-warning">
                <Flame size={10} strokeWidth={2.5} />
                {streak}d
              </span>
            ) : undefined
          }
        />
        <KpiCard
          kind="income"
          valueMinor={income.currentMinor}
          currency={currency}
          trend={income.trend}
          sparkline={income.sparkline}
          invertPolarity={false}
        />
        <KpiCard
          kind="expense"
          valueMinor={expense.currentMinor}
          currency={currency}
          trend={expense.trend}
          sparkline={expense.sparkline}
          invertPolarity
        />
        <KpiCard
          kind="savings"
          valueMinor={savings.currentMinor}
          currency={currency}
          trend={savings.trend}
          sparkline={savings.sparkline}
          invertPolarity={false}
          footer={
            savingsRate > 0 ? (
              <span className="text-[10px] font-medium text-on-surface-variant/60">
                {formatPercentage(savingsRate / 100)} rate
              </span>
            ) : undefined
          }
        />
      </div>

      {aiInsight && <AIInsightStrip insight={aiInsight} />}
    </motion.section>
  );
}
