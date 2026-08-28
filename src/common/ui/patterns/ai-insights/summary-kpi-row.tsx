"use client";

import { motion } from "motion/react";
import { TrendingUp, TrendingDown, PiggyBank, Tag, Activity } from "lucide-react";
import { cn } from "@/src/common/ui/cn";
import { listItemVariants } from "@/src/common/ui/motion";

interface SummaryMetric {
  value: string;
  changePercent: number;
  trend: "up" | "down";
}

interface SummaryKpiRowProps {
  totalSpending: SummaryMetric & { label: string };
  potentialSavings: SummaryMetric & { label: string };
  topCategory: { name: string; amount: string; percentage: string };
  financialHealth: { score: number; changePoints: number };
  className?: string;
}

function KpiCard({
  icon,
  iconBg,
  label,
  value,
  changePercent,
  trend,
  sublabel,
  positiveWhenUp = false,
  suffix = "%",
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  changePercent?: number;
  trend?: "up" | "down";
  sublabel?: string;
  positiveWhenUp?: boolean;
  suffix?: string;
}) {
  const isPositive = positiveWhenUp ? trend === "up" : trend === "down";
  const tone = isPositive ? "bg-success-surface text-success" : "bg-danger-surface text-danger";
  return (
    <motion.div
      variants={listItemVariants}
      className="flex flex-col justify-between rounded-xl border border-border/50 bg-surface p-4 transition-all duration-300 hover:shadow-lg min-h-[110px]"
    >
      <div className="flex items-start gap-2.5">
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            iconBg,
          )}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium text-foreground-secondary truncate">{label}</p>
          <p className="mt-0.5 text-lg font-bold text-foreground tabular-nums truncate">{value}</p>
        </div>
      </div>
      <div className="mt-2">
        {changePercent !== undefined && trend && (
          <div className="flex items-center gap-1">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                tone,
              )}
            >
              {trend === "up" ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {trend === "up" ? "+" : ""}{changePercent}{suffix}
            </span>
            <span className="text-[10px] text-foreground-secondary">vs last month</span>
          </div>
        )}
        {sublabel && (
          <p className="text-[10px] text-foreground-secondary mt-0.5">{sublabel}</p>
        )}
      </div>
    </motion.div>
  );
}

export function SummaryKpiRow({
  totalSpending,
  potentialSavings,
  topCategory,
  financialHealth,
  className,
}: SummaryKpiRowProps) {
  return (
    <motion.div
      className={cn("grid grid-cols-2 lg:grid-cols-4 gap-3", className)}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.06 } },
      }}
    >
      <KpiCard
        icon={<TrendingUp size={16} className="text-danger" />}
        iconBg="bg-danger-surface"
        label="Total Spending"
        value={totalSpending.value}
        changePercent={totalSpending.changePercent}
        trend={totalSpending.trend}
      />
      <KpiCard
        icon={<PiggyBank size={16} className="text-success" />}
        iconBg="bg-success-surface"
        label="Potential Savings"
        value={potentialSavings.value}
        changePercent={potentialSavings.changePercent}
        trend={potentialSavings.trend}
      />
      <KpiCard
        icon={<Tag size={16} className="text-warning" />}
        iconBg="bg-warning-surface"
        label="Top Category"
        value={topCategory.name}
        sublabel={`${topCategory.amount} (${topCategory.percentage})`}
      />
      <KpiCard
        icon={<Activity size={16} className="text-info" />}
        iconBg="bg-info-surface"
        label="Financial Health"
        value={`${financialHealth.score} / 100`}
        changePercent={financialHealth.changePoints}
        trend={financialHealth.changePoints >= 0 ? "up" : "down"}
        positiveWhenUp
        suffix=""
        sublabel={`${financialHealth.changePoints >= 0 ? "+" : ""}${financialHealth.changePoints} points vs last month`}
      />
    </motion.div>
  );
}
