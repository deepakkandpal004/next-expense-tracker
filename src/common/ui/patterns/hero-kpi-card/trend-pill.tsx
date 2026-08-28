"use client";

import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/src/common/ui/cn";
import type { KpiTrend } from "@/src/common/domain/types";

export function TrendPill({
  trend,
  invertPolarity,
}: {
  trend: KpiTrend | null;
  invertPolarity: boolean;
}) {
  if (!trend) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-on-surface-variant/50 tabular-nums">
        <Minus size={10} strokeWidth={2.5} />
        0%
      </span>
    );
  }

  const percent = Math.abs(trend.changePercent * 100).toFixed(0);
  const isFlat = trend.direction === "flat";
  const isFavourable = invertPolarity
    ? trend.direction === "down"
    : trend.direction === "up";

  const Icon = isFlat ? Minus : trend.direction === "up" ? ArrowUp : ArrowDown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums",
        isFlat
          ? "bg-white/5 text-on-surface-variant/50"
          : isFavourable
            ? "bg-kpi-income-surface text-kpi-income"
            : "bg-kpi-expense-surface text-kpi-expense",
      )}
    >
      <Icon size={10} strokeWidth={2.5} />
      {isFlat ? "0" : percent}%
    </span>
  );
}
