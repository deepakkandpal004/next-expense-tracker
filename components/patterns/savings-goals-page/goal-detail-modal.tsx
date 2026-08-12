"use client";

import { motion } from "motion/react";
import { Calendar, Sparkles, Trash2 } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { CurrencyText } from "@/components/ui";
import { formatCurrency } from "@/lib/formatters/locale";
import { GoalPlanPanel } from "@/components/patterns/goal-plan-panel";
import { CircularProgress } from "./circular-progress";
import { MilestoneTimeline } from "./milestone-timeline";
import { calculateEstimatedCompletion, calculateProgress, toMinorUnits } from "./utils";
import type { SavingsGoal } from "./types";

export function GoalDetailModal({
  goal,
  onClose,
  onDelete,
  onCelebrate,
  currency = "INR",
}: {
  goal: SavingsGoal;
  onClose: () => void;
  onDelete: (goal: SavingsGoal) => void;
  onCelebrate: () => void;
  currency?: string;
}) {
  const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
  const isCompleted = progress >= 1;
  const estimatedCompletion = calculateEstimatedCompletion(
    goal.currentAmount,
    goal.targetAmount,
    goal.monthlyContribution,
  );
  const remaining = goal.targetAmount - goal.currentAmount;

  const Icon = goal.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`${goal.name} goal details`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-xl"
      >
        {/* Header gradient */}
        <div
          className={`bg-gradient-to-br ${goal.gradient} p-6`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <Icon size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{goal.name}</h2>
                <p className="text-sm text-white/80">
                  {isCompleted ? "Goal reached!" : `Target: ${formatCurrency({ minorValue: toMinorUnits(goal.targetAmount), currency: currency })}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close goal details"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Progress ring */}
          <div className="flex justify-center">
            <CircularProgress
              value={progress}
              size={160}
              strokeWidth={12}
              color={goal.color}
            />
          </div>

          {/* Amount details */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-surface-subtle p-4">
              <p className="text-xs text-foreground-secondary">Saved</p>
              <p className="mt-1 text-lg font-bold text-foreground">
                <CurrencyText currency={currency} minorValue={toMinorUnits(goal.currentAmount)} />
              </p>
            </div>
            <div className="rounded-xl bg-surface-subtle p-4">
              <p className="text-xs text-foreground-secondary">
                {isCompleted ? "Reached" : "Remaining"}
              </p>
              <p className={cn(
                "mt-1 text-lg font-bold",
                isCompleted ? "text-success" : "text-foreground",
              )}>
                <CurrencyText currency={currency} minorValue={toMinorUnits(isCompleted ? goal.targetAmount : remaining)} />
              </p>
            </div>
          </div>

          {/* Milestones */}
          <div className="mt-6">
            <MilestoneTimeline
              milestones={goal.milestones}
              currentAmount={goal.currentAmount}
              color={goal.color}
              currency={currency}
            />
          </div>

          {/* Estimated completion */}
          {!isCompleted && (
            <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-surface-subtle p-4">
              <Calendar size={16} className="text-foreground-secondary" />
              <span className="text-sm text-foreground-secondary">
                Estimated completion:{" "}
                <span className="font-semibold text-foreground">{estimatedCompletion}</span>
              </span>
            </div>
          )}

          {/* AI Goal Plan */}
          {!isCompleted && (
            <div className="mt-6">
              <GoalPlanPanel
                currency={currency}
                goal={{
                  id: goal.id,
                  name: goal.name,
                  targetAmount: goal.targetAmount,
                  currentAmount: goal.currentAmount,
                  monthlyContribution: goal.monthlyContribution,
                  deadline: goal.deadline,
                }}
              />
            </div>
          )}

          {/* Celebrate button */}
          {isCompleted && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={onCelebrate}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-white transition-transform hover:scale-[1.02]"
            >
              <Sparkles size={18} />
              <span className="font-semibold">Celebrate!</span>
            </motion.button>
          )}

          {/* Delete goal */}
          <button
            type="button"
            onClick={() => onDelete(goal)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-error/30 py-2.5 text-sm font-medium text-error transition-colors hover:bg-error/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
          >
            <Trash2 size={16} />
            <span>Delete Goal</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
