"use client";

import { useState } from "react";
import { Alert, Button, Dialog, Field, Select, useToast } from "@/src/common/ui";
import { getCurrencySymbol } from "@/src/common/formatters/locale";
import { mapDbGoalToSavingsGoal } from "./utils";
import type { SavingsGoal } from "./types";

const GOAL_CATEGORY_OPTIONS = [
  { value: "travel", label: "Travel" },
  { value: "vehicle", label: "Vehicle" },
  { value: "safety", label: "Safety" },
  { value: "property", label: "Property" },
  { value: "education", label: "Education" },
  { value: "other", label: "Other" },
];

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

  const currencySymbol = getCurrencySymbol(currency);

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
    <Dialog
      open
      onOpenChange={(next) => { if (!next) onClose(); }}
      title="New savings goal"
      description="Set a target and track your progress"
      footer={
        <>
          <Button intent="secondary" label="Cancel" onClick={onClose} />
          <Button label="Create goal" loading={saving} type="submit" form="add-goal-form" />
        </>
      }
    >
      <form id="add-goal-form" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Field
            id="goal-name"
            label="Goal name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dream vacation"
          />
          <Field
            id="target-amount"
            label={`Target amount (${currencySymbol})`}
            type="number"
            min="1"
            step="0.01"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="500000"
          />
          <Field
            id="current-amount"
            label={`Already saved (${currencySymbol})`}
            description="Optional"
            type="number"
            min="0"
            step="0.01"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            placeholder="0"
          />
          <Field
            id="monthly-contrib"
            label={`Monthly contribution (${currencySymbol})`}
            description="Optional"
            type="number"
            min="0"
            step="0.01"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
            placeholder="25000"
          />
          <Select
            id="goal-category"
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={GOAL_CATEGORY_OPTIONS}
          />
          <Field
            id="goal-deadline"
            label="Deadline (optional)"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
          {error && <Alert title="Error" description={error} tone="danger" />}
        </div>
      </form>
    </Dialog>
  );
}
