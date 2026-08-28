"use client";

import { motion } from "motion/react";
import { cn } from "@/src/common/ui/cn";

interface ConfidencePanelProps {
  score: number;
  label: string;
  transactionCount: number;
  daysAnalyzed: number;
  className?: string;
}

function ConfidenceRing({ score }: { score: number }) {
  const size = 80;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, score / 100));
  const offset = circumference * (1 - progress);

  let color = "var(--color-danger)";
  if (score >= 80) color = "var(--color-success)";
  else if (score >= 60) color = "var(--color-warning)";

  return (
    <div className="relative flex items-center justify-center">
      <svg className="progress-ring -rotate-90" width={size} height={size} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.1}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          style={{ stroke: color }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-foreground tabular-nums">{score}%</span>
      </div>
    </div>
  );
}

export function ConfidencePanel({
  score,
  label,
  transactionCount,
  daysAnalyzed,
  className,
}: ConfidencePanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "rounded-xl border border-border/50 bg-surface p-4",
        className,
      )}
    >
      <h3 className="text-sm font-semibold text-foreground mb-3">AI Confidence</h3>

      <div className="flex flex-col items-center gap-2">
        <ConfidenceRing score={score} />
        <div className="text-center">
          <p className="text-xs font-semibold text-success">{label}</p>
          <p className="mt-0.5 text-[10px] text-foreground-secondary">
            Based on {transactionCount} transactions from the last {daysAnalyzed} days.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
