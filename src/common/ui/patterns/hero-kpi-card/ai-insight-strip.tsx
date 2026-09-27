"use client";

import { motion } from "motion/react";
import { ArrowUpRight, AlertCircle, Info, Target, TrendingUp } from "lucide-react";
import { cn } from "@/src/common/ui/cn";
import type { AiInsight } from "./types";

const INSIGHT_STYLES = {
  positive: { icon: TrendingUp, chip: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
  warning: { icon: AlertCircle, chip: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
  info: { icon: Info, chip: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
  celebration: { icon: Target, chip: "bg-primary/10 text-primary border border-primary/20" },
} as const;

export function AIInsightStrip({ insight }: { insight: AiInsight }) {
  const style = INSIGHT_STYLES[insight.type];
  const Icon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-[#0c0e14]/60 p-4 sm:flex-row sm:items-center"
    >
      <span
        className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", style.chip)}
        aria-hidden="true"
      >
        <Icon size={15} strokeWidth={2} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-text-primary">{insight.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
          {insight.description}
        </p>
      </div>

      {(insight.actionLabel || insight.secondaryActionLabel) && (
        <div className="flex shrink-0 items-center gap-2">
          {insight.actionLabel && insight.actionHref && (
            <a
              href={insight.actionHref}
              className="inline-flex items-center gap-1 rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/25"
            >
              {insight.actionLabel}
            </a>
          )}
          {insight.secondaryActionLabel && insight.secondaryActionHref && (
            <a
              href={insight.secondaryActionHref}
              className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
            >
              {insight.secondaryActionLabel}
              <ArrowUpRight size={12} strokeWidth={2} />
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}
