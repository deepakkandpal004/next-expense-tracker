"use client";

import { motion } from "motion/react";
import { Calendar, ChevronRight, Clock, Trash2, TrendingUp, Trophy } from "lucide-react";
import { cn } from "@/src/common/ui/cn";
import { CurrencyText } from "@/src/common/ui";
import { calculateDaysRemaining, calculateEstimatedCompletion, calculateProgress, toMinorUnits } from "./utils";
import type { SavingsGoal } from "./types";

export function GoalCard({
  goal,
  index,
  onSelect,
  onDelete,
  currency = "INR",
}: {
  goal: SavingsGoal;
  index: number;
  onSelect: (goal: SavingsGoal) => void;
  onDelete: (goal: SavingsGoal) => void;
  currency?: string;
}) {
  const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
  const isCompleted = progress >= 1;
  const estimatedCompletion = calculateEstimatedCompletion(
    goal.currentAmount,
    goal.targetAmount,
    goal.monthlyContribution,
  );
  const daysRemaining = calculateDaysRemaining(
    goal.currentAmount,
    goal.targetAmount,
    goal.monthlyContribution,
  );

  const Icon = goal.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(goal)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(goal); } }}
      tabIndex={0}
      role="button"
      aria-label={`${goal.name} goal: ${Math.round(progress * 100)}% complete`}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-2xl border bg-surface p-5 shadow-premium-sm transition-shadow hover:shadow-premium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        isCompleted ? "border-success/30" : "border-border/60",
      )}
    >
      {/* Gradient overlay */}
      <div
        className={cn(
          "absolute inset-0 opacity-5 transition-opacity group-hover:opacity-10",
          `bg-gradient-to-br ${goal.gradient}`,
        )}
      />

      {/* Completed badge */}
      {isCompleted && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="absolute right-12 top-4"
        >
          <div className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-1">
            <Trophy size={12} className="text-success" />
            <span className="text-xs font-semibold text-success">Complete</span>
          </div>
        </motion.div>
      )}

      {/* Delete button */}
      <button
        type="button"
        aria-label={`Delete ${goal.name} goal`}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(goal);
        }}
        className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-foreground-secondary/60 transition-colors hover:bg-error/10 hover:text-error focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
      >
        <Trash2 size={16} />
      </button>

      <div className="relative flex items-start gap-4">
        {/* Icon */}
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: `color-mix(in srgb, ${goal.color} 12%, transparent)`,
          }}
        >
          <Icon size={24} className={`text-[${goal.color}]`} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-foreground">{goal.name}</h3>
          <div className="mt-1 flex items-center gap-2 text-sm text-foreground-secondary">
            <span>
              <CurrencyText currency={currency} minorValue={toMinorUnits(goal.currentAmount)} /> of{" "}
              <CurrencyText currency={currency} minorValue={toMinorUnits(goal.targetAmount)} />
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: goal.color }}
                initial={{ width: "0%" }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 + 0.3 }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-foreground-secondary">
            {!isCompleted && (
              <>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{daysRemaining} days left</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>by {estimatedCompletion}</span>
                </div>
              </>
            )}
            <div className="flex items-center gap-1">
              <TrendingUp size={12} />
              <span>
                <CurrencyText currency={currency} minorValue={toMinorUnits(goal.monthlyContribution)} />/mo
              </span>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight
          size={20}
          className="shrink-0 text-foreground-secondary transition-transform group-hover:translate-x-1"
        />
      </div>
    </motion.div>
  );
}
