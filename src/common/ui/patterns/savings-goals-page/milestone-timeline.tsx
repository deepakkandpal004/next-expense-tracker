"use client";

import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/src/common/ui/cn";
import { CurrencyText } from "@/src/common/ui";
import { toMinorUnits } from "./utils";
import type { Milestone } from "./types";

export function MilestoneTimeline({
  milestones,
  currentAmount,
  color,
  currency = "INR",
}: {
  milestones: Milestone[];
  currentAmount: number;
  color: string;
  currency?: string;
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
        Milestones
      </h4>
      <div className="relative">
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-surface-subtle" />
        <div className="space-y-4">
          {milestones.map((milestone, index) => {
            const isCompleted = milestone.completed || currentAmount >= milestone.amount;
            const isCurrent = !isCompleted && (index === 0 || currentAmount >= milestones[index - 1].amount);

            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative flex items-center gap-3"
              >
                <div
                  className={cn(
                    "relative z-10 flex h-6 w-6 items-center justify-center rounded-full",
                    isCompleted
                      ? "bg-current"
                      : isCurrent
                        ? "bg-current"
                        : "bg-surface-subtle",
                  )}
                  style={{ color: isCompleted || isCurrent ? color : undefined }}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={14} className="text-white" />
                  ) : isCurrent ? (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-foreground-secondary/30" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isCompleted ? "text-foreground" : isCurrent ? "text-foreground" : "text-foreground-secondary",
                      )}
                    >
                      {milestone.label}
                    </span>
                    <span className="text-xs text-foreground-secondary tabular-nums">
                      <CurrencyText currency={currency} minorValue={toMinorUnits(milestone.amount)} />
                    </span>
                  </div>
                  {milestone.completedAt && (
                    <span className="text-xs text-foreground-secondary">
                      {new Date(milestone.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
