"use client";

import { motion } from "motion/react";
import { DollarSign, Target, TrendingUp, Trophy } from "lucide-react";
import { cn } from "@/src/common/ui/cn";
import { formatCurrency } from "@/src/common/formatters/locale";
import { toMinorUnits } from "./utils";
import type { GoalStats } from "./types";

export function GoalStats({ stats, currency = "INR" }: { stats: GoalStats; currency?: string }) {
  const statItems = [
    {
      label: "Total saved",
      value: formatCurrency({ minorValue: toMinorUnits(stats.totalSaved), currency: currency }),
      icon: DollarSign,
      color: "text-kpi-savings",
      bg: "bg-kpi-savings-surface",
    },
    {
      label: "Monthly savings",
      value: formatCurrency({ minorValue: toMinorUnits(stats.monthlyRate), currency: currency }),
      icon: TrendingUp,
      color: "text-accent",
      bg: "bg-primary-muted",
    },
    {
      label: "Goals on track",
      value: stats.goalsOnTrack.toString(),
      icon: Target,
      color: "text-info",
      bg: "bg-info-surface",
    },
    {
      label: "Completed",
      value: stats.goalsCompleted.toString(),
      icon: Trophy,
      color: "text-success",
      bg: "bg-success-surface",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {statItems.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="rounded-xl border border-border bg-surface p-4 shadow-premium-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", stat.bg)}>
                <Icon size={16} className={stat.color} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-lg font-bold text-foreground tabular-nums">{stat.value}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
