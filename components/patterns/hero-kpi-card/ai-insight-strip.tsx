"use client";

import { motion } from "motion/react";
import { BookOpen, Brain, Target, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import type { AiInsight } from "./types";

const AI_STYLES = {
  positive: { icon: TrendingUp, chip: "bg-[#4ADE80]/15 text-[#4ADE80]" },
  warning: { icon: Zap, chip: "bg-[#FF7AC6]/15 text-[#FF7AC6]" },
  info: { icon: Brain, chip: "bg-[#00DCE5]/15 text-[#00DCE5]" },
  celebration: { icon: Target, chip: "bg-[#A855F7]/15 text-[#A855F7]" },
} as const;

export function AIInsightStrip({ insight }: { insight: AiInsight }) {
  const style = AI_STYLES[insight.type];
  const Icon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      className="flex flex-col gap-3 rounded-2xl glass-vessel p-5 sm:flex-row sm:items-center"
    >
      <span
        className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", style.chip)}
        aria-hidden="true"
      >
        <Icon size={18} strokeWidth={2.2} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-on-surface">{insight.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-on-surface-variant/60">
          {insight.description}
        </p>
      </div>

      {(insight.actionLabel || insight.secondaryActionLabel) && (
        <div className="flex shrink-0 items-center gap-2">
          {insight.actionLabel && insight.actionHref && (
            <a
              href={insight.actionHref}
              className="inline-flex items-center gap-1 rounded-full bg-[#00DCE5]/15 px-3.5 py-1.5 text-xs font-semibold text-[#00DCE5] transition-colors hover:bg-[#00DCE5]/25"
            >
              {insight.actionLabel}
            </a>
          )}
          {insight.secondaryActionLabel && insight.secondaryActionHref && (
            <a
              href={insight.secondaryActionHref}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-medium text-on-surface-variant/70 transition-colors hover:bg-white/5 hover:text-on-surface"
            >
              {insight.secondaryActionLabel}
              <BookOpen size={12} strokeWidth={2} />
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}
