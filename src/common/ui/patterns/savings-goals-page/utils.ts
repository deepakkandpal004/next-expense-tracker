import { Plane, Car, Shield, Home, Target } from "lucide-react";
import type { DbGoal, GoalStats, SavingsGoal } from "./types";

const CATEGORY_CONFIG: Record<
  string,
  { icon: React.ComponentType<{ size?: number; className?: string }>; color: string; gradient: string }
> = {
  travel: { icon: Plane, color: "#3b82f6", gradient: "from-blue-500 to-cyan-400" },
  vehicle: { icon: Car, color: "#8b5cf6", gradient: "from-violet-500 to-purple-400" },
  safety: { icon: Shield, color: "#22c55e", gradient: "from-emerald-500 to-green-400" },
  property: { icon: Home, color: "#f59e0b", gradient: "from-amber-500 to-orange-400" },
  education: { icon: Target, color: "#ec4899", gradient: "from-pink-500 to-rose-400" },
  other: { icon: Target, color: "#6366f1", gradient: "from-indigo-500 to-blue-400" },
};

export function getCategoryConfig(category: string) {
  return CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.other;
}

/** Converts a major-unit monetary amount (as stored in the DB) to minor units. */
export function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

export function mapDbGoalToSavingsGoal(db: DbGoal): SavingsGoal {
  const cfg = getCategoryConfig(db.category);
  const target = Number(db.targetAmount);
  const current = Number(db.currentAmount);
  const monthly = Number(db.monthlyContribution);
  return {
    id: db.id,
    name: db.name,
    icon: cfg.icon,
    color: cfg.color,
    gradient: cfg.gradient,
    targetAmount: target,
    currentAmount: current,
    monthlyContribution: monthly,
    startDate: db.createdAt,
    deadline: db.deadline ?? null,
    category: db.category as SavingsGoal["category"],
    milestones: [
      { id: "m1", label: "25% Saved", amount: target * 0.25, completed: current >= target * 0.25 },
      { id: "m2", label: "50% Saved", amount: target * 0.5, completed: current >= target * 0.5 },
      { id: "m3", label: "75% Saved", amount: target * 0.75, completed: current >= target * 0.75 },
      { id: "m4", label: "Full Amount", amount: target, completed: current >= target },
    ],
  };
}

export function calculateProgress(current: number, target: number): number {
  return Math.min(current / target, 1);
}

export function calculateEstimatedCompletion(
  current: number,
  target: number,
  monthlyContribution: number,
): string {
  if (monthlyContribution <= 0) return "N/A";
  const remaining = target - current;
  if (remaining <= 0) return "Completed!";
  const months = Math.ceil(remaining / monthlyContribution);
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function calculateDaysRemaining(
  current: number,
  target: number,
  monthlyContribution: number,
): number {
  if (monthlyContribution <= 0) return 0;
  const remaining = target - current;
  if (remaining <= 0) return 0;
  return Math.ceil((remaining / monthlyContribution) * 30);
}

export function getGoalStats(goals: SavingsGoal[]): GoalStats {
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const monthlyRate = goals.reduce((sum, g) => sum + g.monthlyContribution, 0);
  const averageProgress = goals.reduce((sum, g) => sum + calculateProgress(g.currentAmount, g.targetAmount), 0) / goals.length;
  const goalsOnTrack = goals.filter(g => {
    const progress = calculateProgress(g.currentAmount, g.targetAmount);
    return progress < 1 && progress > 0;
  }).length;
  const goalsCompleted = goals.filter(g => g.currentAmount >= g.targetAmount).length;

  return { totalSaved, totalTarget, monthlyRate, averageProgress, goalsOnTrack, goalsCompleted };
}
