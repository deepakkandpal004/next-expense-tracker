"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  Target,
  Plane,
  Car,
  Shield,
  Home,
  Trophy,
  TrendingUp,
  Calendar,
  Clock,
  DollarSign,
  Sparkles,
  ChevronRight,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/ui/cn";
import { CurrencyText } from "@/components/ui";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/formatters/locale";

/* ────────────────────────────────────────────────────────────
   TYPES
   ──────────────────────────────────────────────────────────── */

interface Milestone {
  id: string;
  label: string;
  amount: number;
  completed: boolean;
  completedAt?: string;
}

interface SavingsGoal {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  gradient: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  startDate: string;
  milestones: Milestone[];
  category: "travel" | "vehicle" | "safety" | "property" | "education" | "other";
}

interface GoalStats {
  totalSaved: number;
  totalTarget: number;
  monthlyRate: number;
  averageProgress: number;
  goalsOnTrack: number;
  goalsCompleted: number;
}

/* ────────────────────────────────────────────────────────────
   CATEGORY CONFIG (maps category string → visual props)
   ──────────────────────────────────────────────────────────── */

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

function getCategoryConfig(category: string) {
  return CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.other;
}

/* ────────────────────────────────────────────────────────────
   DB GOAL → UI GOAL MAPPING
   ──────────────────────────────────────────────────────────── */

interface DbGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  category: string;
  deadline: string | null;
  createdAt: string;
}

function mapDbGoalToSavingsGoal(db: DbGoal): SavingsGoal {
  const cfg = getCategoryConfig(db.category);
  return {
    id: db.id,
    name: db.name,
    icon: cfg.icon,
    color: cfg.color,
    gradient: cfg.gradient,
    targetAmount: db.targetAmount,
    currentAmount: db.currentAmount,
    monthlyContribution: db.monthlyContribution,
    startDate: db.createdAt,
    category: db.category as SavingsGoal["category"],
    milestones: [
      { id: "m1", label: "25% Saved", amount: db.targetAmount * 0.25, completed: db.currentAmount >= db.targetAmount * 0.25 },
      { id: "m2", label: "50% Saved", amount: db.targetAmount * 0.5, completed: db.currentAmount >= db.targetAmount * 0.5 },
      { id: "m3", label: "75% Saved", amount: db.targetAmount * 0.75, completed: db.currentAmount >= db.targetAmount * 0.75 },
      { id: "m4", label: "Full Amount", amount: db.targetAmount, completed: db.currentAmount >= db.targetAmount },
    ],
  };
}

/* ────────────────────────────────────────────────────────────
   UTILITY FUNCTIONS
   ──────────────────────────────────────────────────────────── */

function calculateProgress(current: number, target: number): number {
  return Math.min(current / target, 1);
}

function calculateEstimatedCompletion(
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

function calculateDaysRemaining(
  current: number,
  target: number,
  monthlyContribution: number,
): number {
  if (monthlyContribution <= 0) return 0;
  const remaining = target - current;
  if (remaining <= 0) return 0;
  return Math.ceil((remaining / monthlyContribution) * 30);
}

function getGoalStats(goals: SavingsGoal[]): GoalStats {
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

/* ────────────────────────────────────────────────────────────
   CELEBRATION EFFECT
   ──────────────────────────────────────────────────────────── */

function CelebrationEffect({ show }: { show: boolean }) {
  if (!show) return null;

  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 1,
    color: ["#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"][Math.floor(Math.random() * 5)],
    size: 4 + Math.random() * 6,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ y: -20, x: `${particle.x}vw`, opacity: 1, scale: 0 }}
          animate={{
            y: "100vh",
            opacity: [1, 1, 0],
            scale: [0, 1.5, 0.5],
            rotate: [0, 360],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: "easeOut",
          }}
          className="absolute"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   CIRCULAR PROGRESS RING
   ──────────────────────────────────────────────────────────── */

function CircularProgress({
  value,
  size = 120,
  strokeWidth = 10,
  color,
  showPercentage = true,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  showPercentage?: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value, 1);
  const strokeDashoffset = circumference * (1 - progress);

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
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground tabular-nums">
            {Math.round(progress * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   MILESTONE TIMELINE
   ──────────────────────────────────────────────────────────── */

function MilestoneTimeline({
  milestones,
  currentAmount,
  color,
}: {
  milestones: Milestone[];
  currentAmount: number;
  color: string;
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
                      <CurrencyText currency="INR" minorValue={milestone.amount} />
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

/* ────────────────────────────────────────────────────────────
   GOAL CARD
   ──────────────────────────────────────────────────────────── */

function GoalCard({
  goal,
  index,
  onSelect,
}: {
  goal: SavingsGoal;
  index: number;
  onSelect: (goal: SavingsGoal) => void;
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
          className="absolute right-4 top-4"
        >
          <div className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-1">
            <Trophy size={12} className="text-success" />
            <span className="text-xs font-semibold text-success">Complete</span>
          </div>
        </motion.div>
      )}

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
              <CurrencyText currency="INR" minorValue={goal.currentAmount} /> of{" "}
              <CurrencyText currency="INR" minorValue={goal.targetAmount} />
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
                <CurrencyText currency="INR" minorValue={goal.monthlyContribution} />/mo
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

/* ────────────────────────────────────────────────────────────
   GOAL DETAIL MODAL
   ──────────────────────────────────────────────────────────── */

function GoalDetailModal({
  goal,
  onClose,
  onCelebrate,
}: {
  goal: SavingsGoal;
  onClose: () => void;
  onCelebrate: () => void;
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
                  {isCompleted ? "Goal reached!" : `Target: ${formatCurrency({ minorValue: goal.targetAmount, currency: "INR" })}`}
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
                <CurrencyText currency="INR" minorValue={goal.currentAmount} />
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
                <CurrencyText currency="INR" minorValue={isCompleted ? goal.targetAmount : remaining} />
              </p>
            </div>
          </div>

          {/* Milestones */}
          <div className="mt-6">
            <MilestoneTimeline
              milestones={goal.milestones}
              currentAmount={goal.currentAmount}
              color={goal.color}
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
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   GOAL STATS
   ──────────────────────────────────────────────────────────── */

function GoalStats({ stats }: { stats: GoalStats }) {
  const statItems = [
    {
      label: "Total Saved",
      value: formatCurrency({ minorValue: stats.totalSaved, currency: "INR" }),
      icon: DollarSign,
      color: "text-kpi-savings",
      bg: "bg-kpi-savings-surface",
    },
    {
      label: "Monthly Savings",
      value: formatCurrency({ minorValue: stats.monthlyRate, currency: "INR" }),
      icon: TrendingUp,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Goals On Track",
      value: stats.goalsOnTrack.toString(),
      icon: Target,
      color: "text-info",
      bg: "bg-info-surface",
    },
    {
      label: "Completed",
      value: stats.goalsCompleted.toString(),
      icon: Trophy,
      color: "text-success",
      bg: "bg-success-surface",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {statItems.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="rounded-xl border border-border/60 bg-surface p-4 shadow-premium-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", stat.bg)}>
                <Icon size={16} className={stat.color} />
              </div>
            </div>
            <p className="text-xs text-foreground-secondary">{stat.label}</p>
            <p className="mt-1 text-lg font-bold text-foreground tabular-nums">{stat.value}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   ADD GOAL MODAL
   ──────────────────────────────────────────────────────────── */

function AddGoalModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (goal: SavingsGoal) => void;
}) {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [category, setCategory] = useState<string>("other");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    { value: "travel", label: "Travel" },
    { value: "vehicle", label: "Vehicle" },
    { value: "safety", label: "Safety" },
    { value: "property", label: "Property" },
    { value: "education", label: "Education" },
    { value: "other", label: "Other" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Goal name is required");
      return;
    }
    const target = parseFloat(targetAmount);
    if (!target || target <= 0) {
      setError("Target amount must be greater than 0");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          targetAmount: target,
          currentAmount: parseFloat(currentAmount) || 0,
          monthlyContribution: parseFloat(monthlyContribution) || 0,
          category,
          deadline: deadline || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create goal");
      }

      const { goal: dbGoal } = await res.json();
      onCreated(mapDbGoalToSavingsGoal(dbGoal));
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

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
      aria-label="Create new savings goal"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 p-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">New Savings Goal</h2>
            <p className="text-sm text-foreground-secondary">Set a target and track your progress</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-secondary transition-colors hover:bg-surface-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Goal Name */}
            <div>
              <label htmlFor="goal-name" className="mb-1 block text-sm font-medium text-foreground">
                Goal Name
              </label>
              <input
                id="goal-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dream Vacation"
                className="w-full rounded-xl border border-border/60 bg-surface-subtle px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-secondary/50 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>

            {/* Target Amount */}
            <div>
              <label htmlFor="target-amount" className="mb-1 block text-sm font-medium text-foreground">
                Target Amount (₹)
              </label>
              <input
                id="target-amount"
                type="number"
                min="1"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="500000"
                className="w-full rounded-xl border border-border/60 bg-surface-subtle px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-secondary/50 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>

            {/* Current Amount */}
            <div>
              <label htmlFor="current-amount" className="mb-1 block text-sm font-medium text-foreground">
                Already Saved (₹) <span className="text-foreground-secondary">optional</span>
              </label>
              <input
                id="current-amount"
                type="number"
                min="0"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-border/60 bg-surface-subtle px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-secondary/50 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>

            {/* Monthly Contribution */}
            <div>
              <label htmlFor="monthly-contrib" className="mb-1 block text-sm font-medium text-foreground">
                Monthly Contribution (₹) <span className="text-foreground-secondary">optional</span>
              </label>
              <input
                id="monthly-contrib"
                type="number"
                min="0"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                placeholder="25000"
                className="w-full rounded-xl border border-border/60 bg-surface-subtle px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-secondary/50 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="goal-category" className="mb-1 block text-sm font-medium text-foreground">
                Category
              </label>
              <select
                id="goal-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-surface-subtle px-4 py-2.5 text-sm text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Deadline */}
            <div>
              <label htmlFor="goal-deadline" className="mb-1 block text-sm font-medium text-foreground">
                Deadline <span className="text-foreground-secondary">optional</span>
              </label>
              <input
                id="goal-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-surface-subtle px-4 py-2.5 text-sm text-foreground transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="rounded-lg bg-error-surface px-3 py-2 text-sm text-error">{error}</p>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border/60 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              {saving ? "Creating…" : "Create Goal"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────────────────────── */

export function SavingsGoalsPage() {
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  async function fetchGoals() {
    try {
      const res = await fetch("/api/goals");
      if (res.ok) {
        const { goals: dbGoals } = await res.json();
        setGoals(dbGoals.map(mapDbGoalToSavingsGoal));
      }
    } catch {
      // silently fail — show empty state
    } finally {
      setLoading(false);
    }
  }

  function handleGoalCreated(goal: SavingsGoal) {
    setGoals((prev) => [goal, ...prev]);
  }

  const stats = useMemo(() => getGoalStats(goals), [goals]);

  const handleCelebrate = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  return (
    <div className="grid gap-6">
      <CelebrationEffect show={showCelebration} />

      <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-display-xl font-bold text-foreground">Savings Goals</h1>
          <p className="mt-1 text-body text-foreground-secondary">
            Track progress toward your financial targets
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          aria-label="Create new savings goal"
          className="flex items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background transition-all hover:scale-[1.02] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          <Plus size={16} />
          New Goal
        </button>
      </header>

      <GoalStats stats={stats} />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 animate-shimmer rounded-2xl border border-border/50 bg-surface" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <EmptyState
          title="Set your first goal"
          description="Define a target amount and deadline to start tracking your savings progress effortlessly."
          actionLabel="Set Goal"
          onAction={() => setShowAddModal(true)}
          icon={<Target className="w-6 h-6" />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((goal, index) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              index={index}
              onSelect={setSelectedGoal}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedGoal && (
          <GoalDetailModal
            goal={selectedGoal}
            onClose={() => setSelectedGoal(null)}
            onCelebrate={handleCelebrate}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && (
          <AddGoalModal
            onClose={() => setShowAddModal(false)}
            onCreated={handleGoalCreated}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
