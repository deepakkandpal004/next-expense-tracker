"use client";

import { useState, useTransition } from "react";
import { Loader2, Sparkles, Wallet } from "lucide-react";
import { getSafeToSpend } from "@/app/actions/getSafeToSpend";
import { getSafeToSpendExplanation } from "@/app/actions/getSafeToSpendExplanation";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { CanIAffordDialog } from "@/components/patterns/can-i-afford-dialog";
import { formatCurrency } from "@/lib/formatters/locale";
import type { ReportingPeriod } from "@/lib/domain/types";
import type { SafeToSpendBreakdown } from "@/lib/domain/safe-to-spend";
import { cn } from "@/lib/ui/cn";

export interface SafeToSpendCardProps {
  period: ReportingPeriod;
  initialBreakdown: SafeToSpendBreakdown;
}

function formatMinor(minorValue: number, currency: string): string {
  return formatCurrency({ minorValue, currency });
}

export function SafeToSpendCard({
  period,
  initialBreakdown,
}: SafeToSpendCardProps) {
  const [breakdown, setBreakdown] = useState<SafeToSpendBreakdown>(initialBreakdown);
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
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00DCE5]/15 text-[#00DCE5]"
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
        <div className="mt-5 rounded-xl bg-[#FF7AC6]/10 px-4 py-3">
          <p className="text-sm font-semibold text-[#FF7AC6]">
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
                className="text-base font-semibold tabular-nums text-[#4ADE80]"
              />
              <p className="text-[11px] text-on-surface-variant/60">per day</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 space-y-2">
        {breakdown.lines
          .filter((line) => line.key !== "safe-to-spend")
          .map((line) => (
            <div key={line.key} className="flex items-center justify-between gap-2 text-sm">
              <span className="text-on-surface-variant/70">{line.label}</span>
              <span
                className={cn(
                  "font-medium tabular-nums",
                  line.subtracts ? "text-[#FF7AC6]" : "text-on-surface",
                )}
              >
                {line.subtracts ? "−" : ""}
                {formatMinor(line.amountMinor, currency)}
              </span>
            </div>
          ))}

        <div className="mt-3 border-t border-white/10 pt-3" />

        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-on-surface">Safe to spend</span>
          <span className="text-xl font-bold tabular-nums tracking-tight text-on-surface">
            {breakdown.isDeficit
              ? "—"
              : formatMinor(safeToSpend, currency)}
          </span>
        </div>
      </div>

      <div className="mt-5">
        <CanIAffordDialog currency={currency} period={period} />
      </div>

      <div className="mt-5">
        {!showExplanation ? (
          <button
            type="button"
            onClick={explain}
            disabled={isExplaining}
            className="inline-flex items-center gap-2 rounded-xl bg-[#A855F7]/15 px-4 py-2 text-xs font-semibold text-[#A855F7] transition-colors hover:bg-[#A855F7]/25 disabled:opacity-50"
          >
            {isExplaining ? (
              <Loader2 size={14} strokeWidth={2.5} className="animate-spin" />
            ) : (
              <Sparkles size={14} strokeWidth={2.5} />
            )}
            Explain with AI
          </button>
        ) : (
          <div className="rounded-xl bg-white/5 px-4 py-3">
            {isExplaining ? (
              <p className="flex items-center gap-2 text-xs text-on-surface-variant/70">
                <Loader2 size={13} strokeWidth={2.5} className="animate-spin" />
                Explaining the safe-to-spend calculation…
              </p>
            ) : explanation ? (
              <>
                <p className="text-xs leading-relaxed text-on-surface/90">{explanation}</p>
                <p className="mt-2 text-[10px] text-on-surface-variant/50">
                  AI-narrated explanation of the calculated figure. It never changes the number.
                </p>
              </>
            ) : (
              <p className="text-xs leading-relaxed text-on-surface-variant/70">
                {explanationUnavailable
                  ? "AI narration is unavailable right now."
                  : "Safe to spend was calculated from your records; no narration is available."}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}