"use client";

import { Calculator, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { getCanAfford } from "@/app/actions/getCanAfford";
import { getCanAffordVerdict } from "@/app/actions/getCanAffordVerdict";
import { Button, Dialog, Field, useToast } from "@/components/ui";
import { formatCurrency } from "@/lib/formatters/locale";
import type { CanAffordBreakdown } from "@/lib/domain/can-i-afford";
import { appPeriodHref } from "@/lib/domain/reporting-period";
import type { ReportingPeriod } from "@/lib/domain/types";
import { cn } from "@/lib/ui/cn";

export interface CanIAffordDialogProps {
  period: ReportingPeriod;
  currency: string;
  /** Optional anchor label for the trigger button. */
  triggerLabel?: string;
}

function formatMinor(minorValue: number, currency: string): string {
  return formatCurrency({ minorValue, currency });
}

function emergencyLabel(status: CanAffordBreakdown["emergencyStatus"]): string {
  switch (status) {
    case "on-track":
      return "Emergency buffer on track";
    case "below-target":
      return "Emergency buffer below target";
    case "no-goal":
      return "No emergency (safety) goal set up yet";
  }
}

function ResultRow({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "negative" | "positive";
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-on-surface-variant/70">{label}</span>
      <span
        className={cn(
          "font-medium tabular-nums",
          tone === "negative" && "text-[#FF7AC6]",
          tone === "positive" && "text-[#4ADE80]",
          tone === "default" && "text-on-surface",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function priceToMinor(input: string): number | null {
  const value = Number(input.trim());
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100);
}

export function CanIAffordDialog({
  period,
  currency,
  triggerLabel = "Ask affordability check",
}: CanIAffordDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [priceInput, setPriceInput] = useState("");
  const [priceError, setPriceError] = useState<string | undefined>();
  const [checking, setChecking] = useState(false);
  const [breakdown, setBreakdown] = useState<CanAffordBreakdown | null>(null);
  const [verdict, setVerdict] = useState<string | null | undefined>(undefined);
  const [verdictUnavailable, setVerdictUnavailable] = useState(false);
  const [askingVerdict, setAskingVerdict] = useState(false);

  const check = async () => {
    const priceMinor = priceToMinor(priceInput);
    if (priceMinor === null) {
      setPriceError("Enter a purchase price above 0.");
      return;
    }
    setPriceError(undefined);
    setChecking(true);
    try {
      const result = await getCanAfford(priceMinor, period);
      if (result.status === "success") {
        setBreakdown(result.data.breakdown);
        setVerdict(undefined);
        setVerdictUnavailable(false);
        return;
      }
      if (result.status === "validation-error") {
        setPriceError(result.fieldErrors.price?.[0] ?? result.message);
        return;
      }
      toast({ description: result.message, tone: "error" });
    } catch {
      toast({ description: "Could not check affordability. Please retry.", tone: "error" });
    } finally {
      setChecking(false);
    }
  };

  const askVerdict = async () => {
    if (!breakdown || askingVerdict) return;
    setAskingVerdict(true);
    setVerdict(undefined);
    setVerdictUnavailable(false);
    try {
      const result = await getCanAffordVerdict(breakdown);
      if (result.status === "success") {
        setVerdict(result.data.verdict);
        setVerdictUnavailable(!result.data.verdict);
        return;
      }
      setVerdictUnavailable(true);
    } catch {
      setVerdictUnavailable(true);
    } finally {
      setAskingVerdict(false);
    }
  };

  const close = () => {
    setOpen(false);
    setPriceInput("");
    setPriceError(undefined);
    setBreakdown(null);
    setVerdict(undefined);
    setVerdictUnavailable(false);
  };

  const recordsHref = appPeriodHref("records", period) ?? "/records";
  const afterNegative = breakdown ? breakdown.afterPurchaseMinor < 0 : false;

  return (
    <Dialog
      closeLabel="Close can I afford dialog"
      description="Check a planned purchase against your current Safe-to-Spend space before buying."
      onOpenChange={setOpen}
      open={open}
      title={breakdown ? "Affordability check" : "Can I afford this?"}
      trigger={
        <Button
          icon={<Calculator size={14} />}
          intent="secondary"
          label={triggerLabel}
        />
      }
    >
      {!breakdown ? (
        <form
          className="grid gap-5"
          noValidate
          onSubmit={(e) => { e.preventDefault(); void check(); }}
        >
          <Field
            autoFocus
            disabled={checking}
            error={priceError}
            id="can-i-afford-price"
            label={`Purchase price (${currency})`}
            min="0.01"
            onChange={(e) => setPriceInput(e.target.value)}
            placeholder="e.g. 85000"
            required
            step="0.01"
            type="number"
            value={priceInput}
          />
          <div className="flex flex-wrap justify-end gap-3 border-t border-white/10 pt-5">
            <Button disabled={checking} intent="secondary" label="Cancel" onClick={close} />
            <Button label="Submit" loading={checking} type="submit" />
          </div>
        </form>
      ) : (
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
                onClick={() => void askVerdict()}
              />
            )}
            {askingVerdict && (
              <p className="flex items-center gap-2 text-xs text-on-surface-variant/70">
                <Loader2 size={13} strokeWidth={2.5} className="animate-spin" />
                Considering the figures…
              </p>
            )}
            {verdict !== undefined && verdict && (
              <div className="rounded-xl bg-[#00DCE5]/[0.08] px-4 py-3">
                <p className="text-sm leading-relaxed text-[#D8FBFD]">{verdict}</p>
                <p className="mt-2 text-[11px] leading-relaxed text-[#00DCE5]/70">
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
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00DCE5] transition-colors hover:text-[#00DCE5]/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              href={recordsHref}
            >
              <Calculator size={14} aria-hidden="true" />
              View records
            </a>
            <Button intent="secondary" label="Close" onClick={close} />
          </div>
        </div>
      )}
    </Dialog>
  );
}