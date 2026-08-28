"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { getGoalPlanAction } from "@/app/actions/getGoalPlan";
import { getGoalPlanNarration } from "@/app/actions/getGoalPlanNarration";
import { CurrencyText } from "@/src/common/ui";
import { formatDate } from "@/src/common/formatters/locale";
import type { GoalPlan } from "@/src/common/domain/goal-plan";
import { LeverRow } from "./lever-row";
import { Row } from "./row";
import type { GoalPlanPanelProps } from "./types";

export { type GoalPlanPanelProps } from "./types";

export function GoalPlanPanel({ goal, currency }: GoalPlanPanelProps) {
  const [plan, setPlan] = useState<GoalPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [narration, setNarration] = useState<string | null | undefined>(undefined);
  const [asking, setAsking] = useState(false);
  const [narrationUnavailable, setNarrationUnavailable] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(undefined);
    setNarration(undefined);
    setNarrationUnavailable(false);
    void getGoalPlanAction(goal.id)
      .then((result) => {
        if (!mounted) return;
        if (result.status === "success") setPlan(result.data);
        else setError(result.message);
      })
      .catch(() => {
        if (mounted) setError("Could not build the goal plan.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [goal.id]);

  const askNarration = async () => {
    if (!plan || asking) return;
    setAsking(true);
    setNarration(undefined);
    setNarrationUnavailable(false);
    try {
      const result = await getGoalPlanNarration(goal.id);
      if (result.status === "success") {
        setNarration(result.data.explanation);
        setNarrationUnavailable(!result.data.explanation);
      } else {
        setNarrationUnavailable(true);
      }
    } catch {
      setNarrationUnavailable(true);
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/60 bg-surface-subtle/50 p-4">
      <div className="flex items-center gap-2">
        <Wallet size={15} className="text-primary" aria-hidden="true" />
        <h4 className="text-sm font-semibold text-foreground">Goal plan</h4>
      </div>

      {loading && (
        <p className="mt-3 flex items-center gap-2 text-xs text-foreground-secondary">
          <Loader2 size={12} className="animate-spin" aria-hidden="true" />
          Working out what it takes…
        </p>
      )}

      {error && <p className="mt-3 text-xs text-danger">{error}</p>}

      {!loading && !error && plan && (
        <div className="mt-3 grid gap-3">
          {plan.status === "completed" && (
              <p className="flex items-center gap-2 rounded-lg bg-success-surface px-3 py-2 text-sm text-success">
                <CheckCircle2 size={15} aria-hidden="true" />
                Your current contribution already covers it.
              </p>
          )}

          {plan.status === "no-deadline" && (
            <p className="text-sm text-foreground-secondary">
              Add a deadline to this goal and the app will work out the monthly
              contribution needed to reach it.
            </p>
          )}

          {plan.status === "overdue" && (
            <>
              <p className="text-sm text-foreground-secondary">
                This deadline has passed — update it to replan the monthly pace.
              </p>
              {plan.requiredMonthlyMinor !== null && (
                <p className="rounded-lg bg-danger-surface px-3 py-2 text-sm text-danger">
                  A lump sum of{" "}
                  <CurrencyText currency={currency} minorValue={plan.requiredMonthlyMinor} /> is still
                  needed to reach the target.
                </p>
              )}
            </>
          )}

          {plan.status === "on-track" && plan.requiredMonthlyMinor !== null && (
            <>
              <Row
                label="Monthly pace needed"
                value={<CurrencyText currency={currency} minorValue={plan.requiredMonthlyMinor} />}
              />
            <p className="flex items-center gap-2 rounded-lg bg-success-surface px-3 py-2 text-sm text-success">
                <CheckCircle2 size={15} aria-hidden="true" />
                Your current contribution already covers it.
              </p>
            </>
          )}

          {plan.status === "off-track" && (
            <>
              <div className="grid gap-2">
                <Row label="Months to deadline" value={plan.monthsRemaining ?? "—"} />
                <Row
                  label="Monthly pace needed"
                  value={
                    plan.requiredMonthlyMinor === null ? (
                      "—"
                    ) : (
                      <CurrencyText currency={currency} minorValue={plan.requiredMonthlyMinor} />
                    )
                  }
                />
                <Row
                  label="Your monthly contribution"
                  value={<CurrencyText currency={currency} minorValue={plan.monthlyContributionMinor} />}
                />
                <Row
                  label="Monthly gap"
                  tone="negative"
                  value={
                    plan.contributionGapMinor === null ? (
                      "—"
                    ) : (
                      <CurrencyText currency={currency} minorValue={plan.contributionGapMinor} />
                    )
                  }
                />
              </div>

              <div className="mt-1 border-t border-white/10 pt-3">
                <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <Sparkles size={13} className="text-primary" aria-hidden="true" />
                  Ways to close the gap
                </p>
                <div className="mt-2 space-y-2">
                  {plan.selected.length === 0 ? (
                    <p className="text-xs text-foreground-secondary">
                      No funding levers found yet — keep tracking expenses and add recurring plans
                      to see candidates here.
                    </p>
                  ) : (
                    plan.selected.map((lever) => (
                      <LeverRow key={lever.id} lever={lever} currency={currency} />
                    ))
                  )}
                </div>
                <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-foreground-secondary">
                  <span>
                    Selected levers free up{" "}
                    <span className="font-semibold text-success">
                      <CurrencyText currency={currency} minorValue={plan.totalSelectedMinor} />
                    </span>
                    /mo
                  </span>
                  {plan.isGapCovered ? (
                    <span className="flex items-center gap-1 font-medium text-success">
                      <CheckCircle2 size={13} aria-hidden="true" />
                      gap covered
                    </span>
                  ) : (
                    <span className="text-warning">
                      · <CurrencyText currency={currency} minorValue={plan.gapRemainingMinor} />/mo short
                    </span>
                  )}
                </p>
              </div>

              <div className="grid gap-3">
                {narration === undefined && !asking && (
                  <button
                    type="button"
                    onClick={() => void askNarration()}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary/25 bg-primary/[0.06] px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/[0.12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  >
                    <Sparkles size={13} aria-hidden="true" />
                    Explain with AI
                  </button>
                )}
                {asking && (
                  <p className="flex items-center gap-2 text-xs text-foreground-secondary">
                    <Loader2 size={13} strokeWidth={2.5} className="animate-spin" />
                    Reading the numbers…
                  </p>
                )}
                {narration !== undefined && narration !== null && (
                  <div className="rounded-xl bg-primary/[0.08] px-4 py-3">
                    <p className="text-sm leading-relaxed text-primary">{narration}</p>
                    <p className="mt-2 flex items-center gap-1 text-[11px] leading-relaxed text-primary/70">
                      <ShieldCheck size={12} className="shrink-0" aria-hidden="true" />
                      Summaries only — the AI sees these computed plan figures, never your
                      transactions. It never changes the numbers.
                    </p>
                  </div>
                )}
                {narrationUnavailable && (
                  <p className="text-xs text-foreground-secondary">
                    AI narration is unavailable right now — the plan above is the app&apos;s own
                    calculation.
                  </p>
                )}
              </div>
            </>
          )}

          {plan.deadline && (
            <p className="text-xs text-foreground-secondary/70">
              Deadline: {formatDate(plan.deadline)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
