"use client";

import { motion } from "motion/react";
import { Wallet } from "lucide-react";
import { useState } from "react";
import { setBudgetResult } from "@/app/actions/setBudget";
import { Button, Dialog, Field } from "@/components/ui";
import { formatCurrency, formatPercentage } from "@/lib/formatters/locale";
import { cn } from "@/lib/ui/cn";
import type { BudgetMetric, CategoryBreakdownRow } from "@/lib/domain/types";

export interface BudgetOverviewCardProps {
  budget: BudgetMetric;
  categoryBreakdown: readonly CategoryBreakdownRow[];
  currency: string;
  onBudgetSaved: () => Promise<void>;
}

function utilBar(percentage: number): "safe" | "caution" | "danger" {
  if (percentage >= 1) return "danger";
  if (percentage >= 0.8) return "caution";
  return "safe";
}

const BAR_COLOR: Record<ReturnType<typeof utilBar>, string> = {
  safe: "bg-accent",
  caution: "bg-warning",
  danger: "bg-danger",
};

interface CategoryBudgetRowProps {
  row: CategoryBreakdownRow;
  budgetMinor: number;
  currency: string;
  index: number;
}

function CategoryBudgetRow({ row, budgetMinor, currency, index }: CategoryBudgetRowProps) {
  const utilization = budgetMinor > 0 ? row.amountMinor / budgetMinor : 0;
  const clamped = Math.min(utilization, 1);
  const barTone = utilBar(utilization);
  const spentFormatted = formatCurrency({ minorValue: row.amountMinor, currency });
  const budgetFormatted = formatCurrency({ minorValue: budgetMinor, currency });

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-1.5"
      initial={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.25, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center justify-between gap-2 text-interface-xs">
        <span className="font-medium text-foreground">{row.label}</span>
        <span className="shrink-0 font-semibold text-foreground-secondary tabular-nums">
          {spentFormatted}
          <span className="font-normal text-foreground-secondary"> / {budgetFormatted}</span>
        </span>
      </div>
      <div
        aria-label={`${row.label}: ${formatPercentage(clamped)} of budget used`}
        aria-valuenow={Math.round(clamped * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle"
        role="progressbar"
      >
        <motion.div
          animate={{ width: `${(clamped * 100).toFixed(1)}%` }}
          className={cn("h-full rounded-full", BAR_COLOR[barTone])}
          initial={{ width: "0%" }}
          transition={{ duration: 0.7, delay: index * 0.06 + 0.15, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <p className="text-right text-interface-xs text-foreground-secondary">
        {formatPercentage(clamped)}
      </p>
    </motion.div>
  );
}

function SetBudgetDialog({ currency, onSaved }: { currency: string; onSaved: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const today = new Date().toISOString().slice(0, 10);

  const submit = async () => {
    setPending(true);
    setError(undefined);
    try {
      const result = await setBudgetResult({ amount, effectiveFrom: today, currency });
      if (result.status === "success") {
        setOpen(false);
        setAmount("");
        await onSaved();
        return;
      }
      setError(result.message);
    } catch {
      setError("The budget could not be saved. Please retry.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog
      closeLabel="Close set budget"
      description="Set the monthly budget used to evaluate spending against your target."
      onOpenChange={setOpen}
      open={open}
      title="Set budget"
      trigger={
        <Button
          icon={<Wallet size={16} />}
          intent="secondary"
          label="Set budget"
        />
      }
    >
      <form
        className="grid gap-5"
        noValidate
        onSubmit={(e) => { e.preventDefault(); void submit(); }}
      >
        <Field
          disabled={pending}
          error={error}
          id="budget-amount-overview"
          label={`Monthly budget amount (${currency})`}
          min="0.01"
          onChange={(e) => setAmount(e.target.value)}
          required
          step="0.01"
          type="number"
          value={amount}
        />
        <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5">
          <Button disabled={pending} intent="secondary" label="Cancel" onClick={() => setOpen(false)} />
          <Button label="Save budget" loading={pending} type="submit" />
        </div>
      </form>
    </Dialog>
  );
}

export function BudgetOverviewCard({
  budget,
  categoryBreakdown,
  currency,
  onBudgetSaved,
}: BudgetOverviewCardProps) {
  const hasBudget =
    budget.status === "on-track" ||
    budget.status === "approaching" ||
    budget.status === "exceeded";

  const budgetMinor = hasBudget ? budget.budgetMinor : 0;

  const remainingMinor =
    budget.status === "on-track" || budget.status === "approaching"
      ? budget.remainingMinor
      : budget.status === "exceeded"
        ? -(budget.excessMinor)
        : 0;

  const remainingFormatted = formatCurrency({
    minorValue: Math.abs(remainingMinor),
    currency,
  });

  const isExceeded = budget.status === "exceeded";
  const remainingLabel = isExceeded
    ? `${remainingFormatted} over budget`
    : `${remainingFormatted} remaining in total budget`;

  const topCategories = categoryBreakdown.slice(0, 4);

  return (
    <section
      aria-labelledby="budget-overview-title"
      className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm"
    >
      <header className="flex items-center justify-between">
        <h2
          className="text-interface-md font-semibold text-foreground"
          id="budget-overview-title"
        >
          Budget Overview
        </h2>
        {hasBudget ? (
          <button
            aria-label="View all budget details"
            className="text-interface-xs font-semibold text-accent transition-colors hover:text-accent/70"
            type="button"
          >
            View all
          </button>
        ) : null}
      </header>

      {!hasBudget ? (
        <div className="mt-4 grid gap-3">
          <p className="text-interface-sm text-foreground-secondary">
            {budget.status === "unavailable"
              ? budget.reason
              : "No monthly budget is configured yet. Set one to track your spending against a target."}
          </p>
          <SetBudgetDialog currency={currency} onSaved={onBudgetSaved} />
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-4">
            {topCategories.map((row, index) => (
              <CategoryBudgetRow
                budgetMinor={budgetMinor}
                currency={currency}
                index={index}
                key={row.categoryId}
                row={row}
              />
            ))}
          </div>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-4 flex items-start gap-2 rounded-xl border p-3",
              isExceeded
                ? "border-danger-border bg-danger-surface"
                : "border-accent-border bg-accent-surface",
            )}
            initial={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.3, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Wallet
              aria-hidden="true"
              className={cn(
                "mt-0.5 shrink-0",
                isExceeded ? "text-danger-foreground" : "text-accent",
              )}
              size={16}
            />
            <p
              className={cn(
                "text-interface-xs font-medium",
                isExceeded ? "text-danger-foreground" : "text-accent-foreground",
              )}
            >
              {isExceeded
                ? `You are ${remainingLabel}.`
                : `You have ${remainingLabel}. Keep going! 💪`}
            </p>
          </motion.div>
        </>
      )}
    </section>
  );
}
