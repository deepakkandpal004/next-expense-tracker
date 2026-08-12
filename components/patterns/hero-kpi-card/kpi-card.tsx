"use client";

import { PiggyBank, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { formatCurrency } from "@/lib/formatters/locale";
import { AnimatedNumber } from "@/components/ui/animated-number";
import type { KpiTrend } from "@/lib/domain/types";
import { Sparkline } from "./sparkline";
import { TrendPill } from "./trend-pill";

const minorToMajor = (minor: number) => minor / 100;

const KPI_STYLES = {
  balance: {
    label: "Balance",
    icon: Wallet,
    chip: "bg-[#00DCE5]/15 text-[#00DCE5]",
    spark: "#00DCE5",
  },
  income: {
    label: "Income",
    icon: TrendingUp,
    chip: "bg-[#4ADE80]/15 text-[#4ADE80]",
    spark: "#4ADE80",
  },
  expense: {
    label: "Expenses",
    icon: TrendingDown,
    chip: "bg-[#FF7AC6]/15 text-[#FF7AC6]",
    spark: "#FF7AC6",
  },
  savings: {
    label: "Savings",
    icon: PiggyBank,
    chip: "bg-[#A855F7]/15 text-[#A855F7]",
    spark: "#A855F7",
  },
} as const;

export function KpiCard({
  kind,
  valueMinor,
  currency,
  trend,
  sparkline,
  invertPolarity,
  footer,
}: {
  kind: keyof typeof KPI_STYLES;
  valueMinor: number;
  currency: string;
  trend: KpiTrend | null;
  sparkline?: readonly number[];
  invertPolarity: boolean;
  footer?: React.ReactNode;
}) {
  const style = KPI_STYLES[kind];
  const Icon = style.icon;

  return (
    <div className="flex flex-col gap-4 rounded-2xl glass-vessel p-5">
      <div className="flex items-center justify-between">
        <span
          className={cn("flex h-9 w-9 items-center justify-center rounded-xl", style.chip)}
          aria-hidden="true"
        >
          <Icon size={17} strokeWidth={2.2} />
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant/60">
          {style.label}
        </span>
      </div>

      <div className="flex items-end justify-between gap-2">
        <AnimatedNumber
          value={minorToMajor(valueMinor)}
          format={(v) => formatCurrency({ minorValue: Math.round(v * 100), currency })}
          className="text-2xl font-bold tabular-nums tracking-tight text-on-surface"
        />
        {sparkline && sparkline.length >= 2 && (
          <span className="shrink-0 opacity-70">
            <Sparkline data={sparkline} color={style.spark} />
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <TrendPill trend={trend} invertPolarity={invertPolarity} />
        {footer}
      </div>
    </div>
  );
}
