"use client";

import { useState, useTransition } from "react";
import { Wallet } from "lucide-react";
import { getSafeToSpend } from "@/app/actions/getSafeToSpend";
import { getSafeToSpendExplanation } from "@/app/actions/getSafeToSpendExplanation";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { CanIAffordDialog } from "@/components/patterns/can-i-afford-dialog";
import { BreakdownLines } from "./breakdown-lines";
import { ExplainSection } from "./explain-section";
import { formatMinor } from "./utils";
import type { SafeToSpendCardProps } from "./types";

export { type SafeToSpendCardProps } from "./types";

export function SafeToSpendCard({
  period,
  initialBreakdown,
}: SafeToSpendCardProps) {
  const [breakdown, setBreakdown] = useState(initialBreakdown);
  const [isPending, startTransition] = useTransition();
  const [explanation, setExplanation] = useState<string | null | undefined>(undefined);
  const [isExplaining, startExplanation] = useTransition();
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationUnavailable, setExplanationUnavailable] = useState(false);

  const refresh = () => {
    startTransition(async () => {
      const result = await getSafeToSpend(period);
      if (result.status === "success") {
        setBreakdown(result.data.breakdown);
        setExplanation(undefined);
        setShowExplanation(false);
        setExplanationUnavailable(false);
      }
    });
  };

  const explain = () => {
    setShowExplanation(true);
    startExplanation(async () => {
      const result = await getSafeToSpendExplanation(breakdown);
      if (result.status === "success" && result.data.explanation) {
        setExplanation(result.data.explanation);
      } else {
        setExplanationUnavailable(true);
      }
    });
  };

  const currency = breakdown.currency;
  const safeToSpend = breakdown.safeToSpendMinor;
  const perDay =
    breakdown.remainingDays > 0
      ? Math.floor(safeToSpend / breakdown.remainingDays)
      : 0;

  return (
    <section className="rounded-2xl glass-vessel p-5" aria-label="Safe to spend">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-kpi-balance-surface text-kpi-balance"
            aria-hidden="true"
          >
            <Wallet size={17} strokeWidth={2.2} />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-on-surface">Safe to spend</h2>
            <p className="text-[11px] text-on-surface-variant/60">
              Up to {breakdown.remainingDays} day{breakdown.remainingDays === 1 ? "" : "s"} left in this period
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={isPending}
          className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-on-surface-variant/70 transition-colors hover:bg-white/5 hover:text-on-surface disabled:opacity-50"
        >
          {isPending ? "Refreshing…" : "Recompute"}
        </button>
      </div>

      {breakdown.isDeficit ? (
        <div className="mt-5 rounded-xl bg-kpi-expense-surface px-4 py-3">
          <p className="text-sm font-semibold text-kpi-expense">
            Reserved amounts exceed your balance
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-on-surface-variant/70">
            Upcoming bills, goal contributions, and expected expenses total{" "}
            {formatMinor(breakdown.reservedMinor, currency)} but your balance is{" "}
            {formatMinor(breakdown.balanceMinor, currency)}. Review your plans or add income before spending further.
          </p>
        </div>
      ) : (
        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <AnimatedNumber
              value={safeToSpend / 100}
              format={(v) => formatMinor(Math.round(v * 100), currency)}
              className="text-4xl font-bold tabular-nums tracking-tight text-on-surface"
            />
            <p className="mt-1 text-xs text-on-surface-variant/60">
              Available to spend risk-free this period
            </p>
          </div>
          {perDay > 0 && breakdown.remainingDays > 0 && (
            <div className="shrink-0 text-right">
              <AnimatedNumber
                value={perDay / 100}
                format={(v) => formatMinor(Math.round(v * 100), currency)}
                className="text-base font-semibold tabular-nums text-kpi-income"
              />
              <p className="text-[11px] text-on-surface-variant/60">per day</p>
            </div>
          )}
        </div>
      )}

      <BreakdownLines
        currency={currency}
        isDeficit={breakdown.isDeficit}
        lines={breakdown.lines}
        safeToSpendMinor={safeToSpend}
      />

      <div className="mt-5">
        <CanIAffordDialog currency={currency} period={period} />
      </div>

      <ExplainSection
        explanation={explanation}
        explanationUnavailable={explanationUnavailable}
        isExplaining={isExplaining}
        onExplain={explain}
        showExplanation={showExplanation}
      />
    </section>
  );
}
