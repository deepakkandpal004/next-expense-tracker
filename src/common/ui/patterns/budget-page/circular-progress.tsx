"use client";

import { motion } from "motion/react";
import type { BudgetMetric } from "@/src/common/domain/types";

export function CircularProgress({
  value,
  size = 180,
  strokeWidth = 12,
  status,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  status: BudgetMetric["status"];
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value, 1);
  const strokeDashoffset = circumference * (1 - progress);

  const colorMap = {
    "on-track": "stroke-kpi-income",
    approaching: "stroke-warning",
    exceeded: "stroke-danger",
    "not-configured": "stroke-foreground-secondary/30",
    unavailable: "stroke-foreground-secondary/30",
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="rotate-[-90deg]"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-surface-subtle"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={colorMap[status]}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-foreground tabular-nums">
          {Math.round(progress * 100)}%
        </span>
        <span className="text-xs text-foreground-secondary">used</span>
      </div>
    </div>
  );
}
