"use client";

import { Calculator, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/src/common/ui";
import { appPeriodHref } from "@/src/common/domain/reporting-period";
import type { CanAffordBreakdown } from "@/src/common/domain/can-i-afford";
import type { ReportingPeriod } from "@/src/common/domain/types";
import { emergencyLabel, formatMinor, ResultRow } from "./utils";

export function BreakdownView({
  breakdown,
  currency,
  period,
  verdict,
  verdictUnavailable,
  askingVerdict,
  onAskVerdict,
  onClose,
}: {
  breakdown: CanAffordBreakdown;
  currency: string;
  period: ReportingPeriod;
  verdict: string | null | undefined;
  verdictUnavailable: boolean;
  askingVerdict: boolean;
  onAskVerdict: () => void;
  onClose: () => void;
}) {
  const recordsHref = appPeriodHref("records", period) ?? "/records";
  const afterNegative = breakdown.afterPurchaseMinor < 0;

  return (
    <div className="grid gap-5">
      <div className="grid gap-2 rounded-xl bg-white/[0.03] p-4">
        <ResultRow
          label="Safe to spend this period"
          value={formatMinor(breakdown.safeToSpendMinor, currency)}
        />
        <ResultRow
          label="This purchase"
          tone="negative"
          value={`−${formatMinor(breakdown.priceMinor, currency)}`}
        />
        <div className="mt-2 border-t border-white/10 pt-2">
          <ResultRow
            label="Balance after purchase"
            tone={afterNegative ? "negative" : "positive"}
            value={`${afterNegative ? "−" : ""}${formatMinor(Math.abs(breakdown.afterPurchaseMinor), currency)}`}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <ResultRow
          label="Goal impact"
          value={
            breakdown.goalImpactMonths === null
              ? "No goal savings to displace"
              : `≈ ${breakdown.goalImpactMonths} month${breakdown.goalImpactMonths === 1 ? "" : "s"} of savings`
          }
        />
        <ResultRow label="Emergency buffer" value={emergencyLabel(breakdown.emergencyStatus)} />
      </div>

      <div className="grid gap-3">
        {!askingVerdict && verdict === undefined && verdictUnavailable === false && (
          <Button
            icon={<Sparkles size={14} />}
            intent="secondary"
            label="Ask AI for a verdict"
            onClick={onAskVerdict}
          />
        )}
        {askingVerdict && (
          <p className="flex items-center gap-2 text-xs text-on-surface-variant/70">
            <Loader2 size={13} strokeWidth={2.5} className="animate-spin" />
            Considering the figures…
          </p>
        )}
        {verdict !== undefined && verdict && (
          <div className="rounded-xl bg-primary/[0.08] px-4 py-3">
            <p className="text-sm leading-relaxed text-primary">{verdict}</p>
            <p className="mt-2 text-[11px] leading-relaxed text-primary/70">
              <ShieldCheck className="mr-1 inline size-3" aria-hidden="true" />
              Summaries only — the AI sees these computed figures, never your transactions. It never changes the numbers.
            </p>
          </div>
        )}
        {verdictUnavailable && (
          <p className="text-xs text-on-surface-variant/70">
            AI narration is unavailable right now — the numbers above are the app&apos;s own calculation.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
        <a
          aria-label="View the underlying records for this period"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          href={recordsHref}
        >
          <Calculator size={14} aria-hidden="true" />
          View records
        </a>
        <Button intent="secondary" label="Close" onClick={onClose} />
      </div>
    </div>
  );
}
