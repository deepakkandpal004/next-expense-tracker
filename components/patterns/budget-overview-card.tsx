"use client";

import { motion } from "motion/react";
import { AlertTriangle, CheckCircle2, CreditCard, Plus, Wallet } from "lucide-react";
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
  onBudgetSaved?: () => Promise<void>;
}

function utilBar(percentage: number): "safe" | "caution" | "danger" {
  if (percentage >= 1) return "danger";
  if (percentage >= 0.8) return "caution";
  return "safe";
}

const BAR_COLORS: Record<ReturnType<typeof utilBar>, { bar: string; bg: string }> = {
  safe: { bar: "bg-kpi-income", bg: "bg-kpi-income-surface" },
  caution: { bar: "bg-warning", bg: "bg-warning-surface" },
  danger: { bar: "bg-danger", bg: "bg-danger-surface" },
};

const STATUS_CONFIG = {
  "on-track": { icon: CheckCircle2, label: "On Track", tone: "success" as const },
  "approaching": { icon: AlertTriangle, label: "Near Limit", tone: "warning" as const },
  "exceeded": { icon: CreditCard, label: "Exceeded", tone: "danger" as const },
  "not-configured": { icon: Wallet, label: "No Budget", tone: "neutral" as const },
  "unavailable": { icon: Wallet, label: "Unavailable", tone: "neutral" as const },
} as const;

/* ────────────────────────────────────────────────────────────
   STATUS PILL
   ──────────────────────────────────────────────────────────── */

function StatusPill({ status }: { status: BudgetMetric["status"] }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG["not-configured"];
  const Icon = config.icon;

  const toneClasses = {
    success: "bg-kpi-income-surface text-kpi-income-foreground",
    warning: "bg-warning-surface text-warning-foreground",
    danger: "bg-danger-surface text-danger-foreground",
      neutral: "bg-surface-subtle text-foreground-secondary",
  };

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", toneClasses[config.tone])}>
      <Icon size={10} strokeWidth={2.5} />
      {config.label}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────
   UTILIZATION BAR (Big visual)
   ──────────────────────────────────────────────────────────── */

function UtilizationBar({
  spent,
  total,
}: {
  spent: number;
  total: number;
}) {
  const ratio = total > 0 ? Math.min(spent / total, 1) : 0;
  const percentage = Math.round(ratio * 100);
  const barTone = utilBar(ratio);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-foreground-secondary">Spent</span>
        <span className="text-xs font-medium text-foreground-secondary">
          {formatPercentage(ratio)} of budget
        </span>
      </div>
      <div
        aria-label={`${percentage}% of budget used`}
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        className="relative h-2 w-full overflow-hidden rounded-full bg-surface-subtle"
        role="progressbar"
      >
        <motion.div
          className={cn("h-full rounded-full", BAR_COLORS[barTone].bar)}
          initial={{ width: "0%" }}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   CATEGORY ROW
   ──────────────────────────────────────────────────────────── */

function CategoryRow({
  row,
  budgetMinor,
  currency,
  index,
}: {
  row: CategoryBreakdownRow;
  budgetMinor: number;
  currency: string;
  index: number;
}) {
  const ratio = budgetMinor > 0 ? Math.min(row.amountMinor / budgetMinor, 1) : 0;
  const barTone = utilBar(ratio);
  const amount = formatCurrency({ minorValue: row.amountMinor, currency });

  return (
    <motion.div
      className="group flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors duration-150 hover:bg-surface-subtle/50"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Color dot */}
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: `var(--${row.semanticToken})` }}
        aria-hidden="true"
      />

      {/* Label */}
      <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
        {row.label}
      </span>

      {/* Amount */}
      <span className="shrink-0 text-xs font-semibold text-foreground tabular-nums">
        {amount}
      </span>

      {/* Mini bar */}
      <div className="h-1 w-12 shrink-0 overflow-hidden rounded-full bg-surface-subtle">
        <motion.div
          className={cn("h-full rounded-full", BAR_COLORS[barTone].bar)}
          initial={{ width: "0%" }}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ duration: 0.6, delay: index * 0.05 + 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   SET BUDGET DIALOG
   ──────────────────────────────────────────────────────────── */

function SetBudgetDialog({ currency, onSaved }: { currency: string; onSaved?: () => Promise<void> }) {
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
        await onSaved?.();
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
          icon={<Plus size={14} />}
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

/* ────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────────────────────── */

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
  const spentMinor = budget.status === "exceeded"
    ? budgetMinor + budget.excessMinor
    : hasBudget
      ? budget.budgetMinor - budget.remainingMinor
      : 0;

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
  const spentFormatted = formatCurrency({ minorValue: spentMinor, currency });
  const budgetFormatted = formatCurrency({ minorValue: budgetMinor, currency });

  const topCategories = categoryBreakdown.slice(0, 4);

  return (
    <section
      aria-labelledby="budget-overview-title"
      className="relative overflow-hidden glass-vessel"
    >
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-5 pb-4">
        <h2 className="text-sm font-semibold text-foreground" id="budget-overview-title">
          Budget Overview
        </h2>
        {hasBudget && <StatusPill status={budget.status} />}
      </header>

      {!hasBudget ? (
        /* Empty state */
        <div className="px-5 pb-5">
          <div className="flex flex-col items-center rounded-xl border border-dashed border-border-strong py-8 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-subtle mb-3">
              <Wallet size={20} className="text-foreground-secondary" />
            </span>
            <p className="text-sm font-medium text-foreground mb-1">No budget set</p>
            <p className="text-xs text-foreground-secondary mb-3 max-w-[200px]">
              Set a monthly budget to track spending against a target.
            </p>
            <SetBudgetDialog currency={currency} onSaved={onBudgetSaved} />
          </div>
        </div>
      ) : (
        <div className="px-5 pb-5 space-y-4">
          {/* Utilization summary */}
          <div className="rounded-xl bg-surface-subtle p-3">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-lg font-bold text-foreground tabular-nums">{spentFormatted}</span>
              <span className="text-xs text-foreground-secondary">of {budgetFormatted}</span>
            </div>
            <UtilizationBar spent={spentMinor} total={budgetMinor} />
          </div>

          {/* Remaining callout */}
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2",
              isExceeded
                ? "border-danger-border bg-danger-surface"
                : "border-kpi-income-border bg-kpi-income-surface",
            )}
          >
            {isExceeded ? (
              <AlertTriangle size={14} className="text-danger shrink-0" />
            ) : (
              <CheckCircle2 size={14} className="text-kpi-income shrink-0" />
            )}
            <p
              className={cn(
                "text-xs font-medium",
                isExceeded ? "text-danger-foreground" : "text-kpi-income-foreground",
              )}
            >
              {isExceeded
                ? `${remainingFormatted} over budget`
                : `${remainingFormatted} remaining`}
            </p>
          </div>

          {/* Category breakdown */}
          {topCategories.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground-secondary mb-2 px-1">
                Top Categories
              </p>
              <div className="space-y-0.5">
                {topCategories.map((row, index) => (
                  <CategoryRow
                    budgetMinor={budgetMinor}
                    currency={currency}
                    index={index}
                    key={row.categoryId}
                    row={row}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
