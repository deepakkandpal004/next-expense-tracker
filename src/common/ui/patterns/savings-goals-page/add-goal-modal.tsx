"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useToast } from "@/src/common/ui";
import { getCurrencySymbol } from "@/src/common/formatters/locale";
import { mapDbGoalToSavingsGoal } from "./utils";
import type { SavingsGoal } from "./types";

export function AddGoalModal({
  currency = "INR",
  onClose,
  onCreated,
}: {
  currency?: string;
  onClose: () => void;
  onCreated: (goal: SavingsGoal) => void;
}) {
  const { toast } = useToast();
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
      toast({ description: "Goal created.", tone: "success" });
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
                Target Amount ({getCurrencySymbol(currency)})
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
                Already Saved ({getCurrencySymbol(currency)}) <span className="text-foreground-secondary">optional</span>
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
                Monthly Contribution ({getCurrencySymbol(currency)}) <span className="text-foreground-secondary">optional</span>
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
