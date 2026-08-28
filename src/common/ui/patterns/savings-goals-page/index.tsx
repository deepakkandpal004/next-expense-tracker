"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Plus, Target } from "lucide-react";
import { useToast } from "@/src/common/ui";
import { EmptyState } from "@/src/common/ui/empty-state";
import { GoalCard } from "./goal-card";
import { GoalDetailModal } from "./goal-detail-modal";
import { GoalStats } from "./goal-stats";
import { AddGoalModal } from "./add-goal-modal";
import { DeleteGoalModal } from "./delete-goal-modal";
import { CelebrationEffect } from "./celebration-effect";
import { getGoalStats, mapDbGoalToSavingsGoal } from "./utils";
import type { SavingsGoal } from "./types";

export function SavingsGoalsPage({ currency }: { currency?: string }) {
  const { toast } = useToast();
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<SavingsGoal | null>(null);
  const [deleting, setDeleting] = useState(false);
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

  async function handleDeleteGoal() {
    if (!goalToDelete) return;

    setDeleting(true);
    try {
      const res = await fetch("/api/goals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: goalToDelete.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete goal");
      }

      setGoals((prev) => prev.filter((g) => g.id !== goalToDelete.id));
      if (selectedGoal?.id === goalToDelete.id) setSelectedGoal(null);
      setGoalToDelete(null);
      toast({ description: "Goal deleted.", tone: "success" });
    } catch (err: unknown) {
      toast({
        description: err instanceof Error ? err.message : "Could not delete goal.",
        tone: "error",
      });
    } finally {
      setDeleting(false);
    }
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

      <GoalStats stats={stats} currency={currency} />

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
          actionLabel="Set goal"
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
              onDelete={setGoalToDelete}
              currency={currency}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedGoal && (
          <GoalDetailModal
            goal={selectedGoal}
            onClose={() => setSelectedGoal(null)}
            onDelete={setGoalToDelete}
            onCelebrate={handleCelebrate}
            currency={currency}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && (
          <AddGoalModal
            currency={currency}
            onClose={() => setShowAddModal(false)}
            onCreated={handleGoalCreated}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {goalToDelete && (
          <DeleteGoalModal
            goal={goalToDelete}
            deleting={deleting}
            onCancel={() => setGoalToDelete(null)}
            onConfirm={() => void handleDeleteGoal()}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
