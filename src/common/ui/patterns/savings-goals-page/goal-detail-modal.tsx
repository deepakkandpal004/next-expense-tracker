"use client";

import { motion } from "motion/react";
import { Calendar, Sparkles, Trash2 } from "lucide-react";
import { cn } from "@/src/common/ui/cn";
import { CurrencyText, Dialog } from "@/src/common/ui";
import { formatCurrency } from "@/src/common/formatters/locale";
import { GoalPlanPanel } from "@/src/common/ui/patterns/goal-plan-panel";
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

  return (
    <Dialog
      open
      onOpenChange={(next) => { if (!next) onClose(); }}
      title={goal.name}
      description={
        isCompleted
          ? "Goal reached!"
          : `Target: ${formatCurrency({ minorValue: toMinorUnits(goal.targetAmount), currency })}`
      }
    >
      <div>
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
            <p className="text-xs text-muted-foreground">Saved</p>
            <p className="mt-1 text-lg font-bold text-foreground">
              <CurrencyText currency={currency} minorValue={toMinorUnits(goal.currentAmount)} />
            </p>
          </div>
          <div className="rounded-xl bg-surface-subtle p-4">
            <p className="text-xs text-muted-foreground">
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
            <Calendar size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
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
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-white transition-transform"
          >
            <Sparkles size={18} />
            <span className="font-semibold">Celebrate!</span>
          </motion.button>
        )}

        {/* Delete goal */}
        <button
          type="button"
          onClick={() => onDelete(goal)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-danger-border py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
        >
          <Trash2 size={16} />
          <span>Delete goal</span>
        </button>
      </div>
    </Dialog>
  );
}
