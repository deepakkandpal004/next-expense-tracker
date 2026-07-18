"use client";

import { ArrowUpRight, Bot, Database, RefreshCw, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAIInsightsResult, type AiInsightsData, type AiInsightsRequest } from "@/app/actions/getAIInsights";
import { Alert, Button, Card, DateText, ErrorState, LinkButton, SectionHeader, Skeleton, StatusRegion } from "@/components/ui";
import { appPeriodHref } from "@/lib/domain/reporting-period";
import type { ActionResult, AiDataUseDisclosure, AiInsightSet, ReportingPeriod } from "@/lib/domain/types";
import { formatPercentage } from "@/lib/formatters/locale";

const DISCLOSURE_SESSION_KEY = "expense-ai.ai-insights-disclosure";

export type AiHighlightsResult = ActionResult<AiInsightsData, "period" | "disclosure">;
export type AiHighlightsLoader = (request: AiInsightsRequest) => Promise<AiHighlightsResult>;

export interface AiHighlightListProps {
  /** URL-owned period input; no KPI, record, chart, or export data crosses this boundary. */
  period: ReportingPeriod;
  disclosure: AiDataUseDisclosure;
  initialInsightSet?: AiInsightSet;
  loadInsights?: AiHighlightsLoader;
}

function periodKey(period: ReportingPeriod): string {
  return period.kind === "custom" ? `${period.kind}:${period.start}:${period.end}` : period.kind;
}

function hasReviewedDisclosure(version: string): boolean {
  try {
    return window.sessionStorage.getItem(DISCLOSURE_SESSION_KEY) === version;
  } catch {
    return false;
  }
}

function rememberDisclosure(version: string) {
  try {
    window.sessionStorage.setItem(DISCLOSURE_SESSION_KEY, version);
  } catch {
    // Session storage is a convenience only; the server still requires the disclosure version.
  }
}

function confidenceText(confidence: number | undefined): string | undefined {
  return typeof confidence === "number" && Number.isFinite(confidence) && confidence >= 0 && confidence <= 1
    ? formatPercentage(confidence)
    : undefined;
}

function DisclosurePanel({ disclosure, onContinue }: { disclosure: AiDataUseDisclosure; onContinue: () => void }) {
  return (
    <section aria-labelledby="ai-disclosure-title" className="rounded-2xl border border-border/60 bg-surface-subtle/50 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Database aria-hidden="true" size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-interface-sm font-semibold text-foreground" id="ai-disclosure-title">AI data-use disclosure</h3>
          <p className="mt-1 text-interface-xs text-foreground-secondary leading-relaxed">{disclosure.purpose}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-interface-xs font-medium text-foreground-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {disclosure.fields.length} data fields
            </span>
            <span className="text-interface-xs text-foreground-secondary/70">{disclosure.providerRetention.statement}</span>
          </div>
          <Button className="mt-4" icon={<Bot size={16} />} intent="primary" label="Continue and generate highlights" onClick={onContinue} />
        </div>
      </div>
    </section>
  );
}

function InsightContent({ insightSet }: { insightSet: AiInsightSet }) {
  const confidenceExplanation = insightSet.interpretations.find((item) => item.confidenceExplanation)?.confidenceExplanation
    ?? insightSet.recommendations.find((item) => item.confidenceExplanation)?.confidenceExplanation
    ?? "Confidence is the model's estimate based on the disclosed recorded-data summary; it is not a guarantee.";
  const hasConfidence = [...insightSet.interpretations, ...insightSet.recommendations].some((item) => confidenceText(item.confidence));

  return (
    <div className="grid gap-4">
      <section aria-labelledby="recorded-facts-title" className="rounded-2xl border border-border/50 bg-surface p-4">
        <h3 className="text-interface-sm font-semibold text-foreground" id="recorded-facts-title">Recorded data facts</h3>
        <p className="mt-0.5 text-interface-xs text-foreground-secondary">Observed from recorded transactions in this reporting period.</p>
        <dl className="mt-3 grid gap-1.5 text-interface-sm">
          {insightSet.facts.map((fact) => (
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg px-3 py-2 first:pt-0 last:pb-0 hover:bg-surface-subtle/50" key={`${fact.label}-${fact.value}`}>
              <dt className="text-foreground-secondary">{fact.label}</dt>
              <dd className="financial-value font-semibold text-foreground">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="ai-interpretations-title" className="grid gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-interface-sm font-semibold text-foreground" id="ai-interpretations-title">AI-generated interpretations</h3>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-interface-xs font-medium text-primary">{insightSet.interpretations.length}</span>
        </div>
        {insightSet.interpretations.length ? insightSet.interpretations.map((interpretation) => {
          const confidence = confidenceText(interpretation.confidence);
          return (
            <article className="rounded-2xl border border-border/50 bg-surface p-4" key={interpretation.id}>
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-foreground">{interpretation.title}</h4>
                {confidence ? <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-interface-xs font-semibold text-primary">{confidence}</span> : null}
              </div>
              <p className="mt-1.5 text-interface-sm text-foreground-secondary leading-relaxed">{interpretation.text}</p>
            </article>
          );
        }) : <p className="rounded-2xl border border-dashed border-border bg-surface-subtle/30 p-4 text-center text-interface-sm text-foreground-secondary">No AI-generated interpretations are available for this period.</p>}
      </section>

      <section aria-labelledby="ai-recommendations-title" className="grid gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-interface-sm font-semibold text-foreground" id="ai-recommendations-title">AI-generated recommendations</h3>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-interface-xs font-medium text-primary">{insightSet.recommendations.length}</span>
        </div>
        {insightSet.recommendations.length ? <ul className="grid gap-2">
          {insightSet.recommendations.map((recommendation) => {
            const confidence = confidenceText(recommendation.confidence);
            return <li className="rounded-2xl border border-border/50 bg-surface p-4" key={recommendation.id}>
              <div className="flex items-start justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-interface-xs font-medium text-primary">Recommendation</span>
                {confidence ? <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-interface-xs font-semibold text-primary">{confidence}</span> : null}
              </div>
              <p className="mt-2 text-interface-sm text-foreground-secondary leading-relaxed">{recommendation.text}</p>
            </li>;
          })}
        </ul> : <p className="rounded-2xl border border-dashed border-border bg-surface-subtle/30 p-4 text-center text-interface-sm text-foreground-secondary">No AI-generated recommendations are available for this period.</p>}
      </section>

      {hasConfidence ? <details className="rounded-2xl border border-border/50 bg-surface p-4 text-interface-sm">
        <summary className="cursor-pointer font-semibold text-foreground">What does AI confidence mean?</summary>
        <p className="mt-2 text-foreground-secondary leading-relaxed">{confidenceExplanation}</p>
      </details> : null}
      <Alert description={insightSet.disclaimer} title="AI guidance notice" tone="info" />
    </div>
  );
}

/**
 * A deliberately isolated dashboard boundary for proactive AI content. It owns
 * only disclosed AI generation state and never receives or refreshes KPI,
 * records, chart, or export state.
 */
export function AiHighlightList({ period, disclosure: initialDisclosure, initialInsightSet, loadInsights = getAIInsightsResult }: AiHighlightListProps) {
  const key = useMemo(() => periodKey(period), [period]);
  const [disclosure, setDisclosure] = useState(initialDisclosure);
  const [insightSet, setInsightSet] = useState<AiInsightSet | undefined>(initialInsightSet);
  const [disclosureAccepted, setDisclosureAccepted] = useState(Boolean(initialInsightSet));
  const [sessionChecked, setSessionChecked] = useState(Boolean(initialInsightSet));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>(undefined);
  const requestedKey = useRef<string | undefined>(undefined);
  const sectionId = useRef(`ai-highlights-${Math.random().toString(36).slice(2)}`).current;
  const insightsHref = appPeriodHref("insights", period) ?? "/insights";

  useEffect(() => {
    setDisclosure(initialDisclosure);
    setInsightSet(initialInsightSet);
    setError(undefined);
    setStatus(undefined);
    requestedKey.current = undefined;
    const accepted = Boolean(initialInsightSet) || hasReviewedDisclosure(initialDisclosure.version);
    setDisclosureAccepted(accepted);
    setSessionChecked(true);
  }, [initialDisclosure, initialInsightSet, key]);

  const refresh = useCallback(async () => {
    if (pending) return;
    const previousInsightSet = insightSet;
    setPending(true);
    setError(undefined);
    setStatus(undefined);
    try {
      const result = await loadInsights({
        period,
        disclosureVersion: disclosure.version,
        previousInsightSet,
      });
      if (result.status !== "success") {
        const preserved = result.data?.state === "ready" ? result.data.insightSet : previousInsightSet;
        if (preserved) setInsightSet({ ...preserved, stale: true });
        setError(result.message);
        return;
      }
      if (result.data.state === "disclosure-required") {
        setDisclosure(result.data.disclosure);
        setDisclosureAccepted(false);
        setError(undefined);
        return;
      }
      setInsightSet(result.data.insightSet);
      setStatus(previousInsightSet ? "AI highlights refreshed." : "AI highlights generated.");
    } catch {
      if (previousInsightSet) setInsightSet({ ...previousInsightSet, stale: true });
      setError("AI highlights could not be refreshed. Please try again.");
    } finally {
      setPending(false);
    }
  }, [disclosure.version, insightSet, loadInsights, pending, period]);

  useEffect(() => {
    if (!sessionChecked || !disclosureAccepted || insightSet || requestedKey.current === key) return;
    requestedKey.current = key;
    void refresh();
  }, [disclosureAccepted, insightSet, key, refresh, sessionChecked]);

  const acceptDisclosure = () => {
    rememberDisclosure(disclosure.version);
    setDisclosureAccepted(true);
    requestedKey.current = key;
    void refresh();
  };

  return (
    <Card aria-labelledby={sectionId} as="section" className="min-h-[24rem] space-y-4 border-border/50" elevation="raised" data-ai-boundary="dashboard-highlights">
      <SectionHeader
        action={<Button icon={<RefreshCw size={14} />} intent="ghost" label="Refresh AI highlights" loading={pending} onClick={() => void refresh()} />}
        description="AI-generated observations and optional guidance are kept separate from recorded financial data."
        metadata={insightSet ? <><span>Reporting period: {insightSet.period.label}</span><span aria-hidden="true"> · </span><span>Generated <DateText format="date-time" value={insightSet.generatedAt} /></span></> : "Choose to generate guidance for the current reporting period."}
        title="AI-generated highlights"
      />
      <StatusRegion busy={pending} message={pending ? "AI highlights are refreshing." : status} visible={Boolean(pending || status)} />

      {!sessionChecked ? <Skeleton label="Preparing AI highlights" minimumHeight="14rem" /> : null}
      {sessionChecked && !disclosureAccepted && !insightSet ? <DisclosurePanel disclosure={disclosure} onContinue={acceptDisclosure} /> : null}
      {pending && !insightSet ? <Skeleton label="Generating AI highlights" minimumHeight="14rem" /> : null}
      {error && insightSet ? <Alert
        action={<Button icon={<RefreshCw size={14} />} intent="ghost" label="Retry AI highlights" onClick={() => void refresh()} />}
        description={`${error} Last successful AI highlights are shown below.`}
        icon={<TriangleAlert size={18} />}
        title="Showing stale AI highlights"
        tone="warning"
      /> : null}
      {error && !insightSet && !pending ? <ErrorState
        action={<Button icon={<RefreshCw size={14} />} label="Retry AI highlights" onClick={() => void refresh()} />}
        description={error}
        title="AI highlights unavailable"
      /> : null}
      {insightSet ? <InsightContent insightSet={insightSet} /> : null}
      <LinkButton href={insightsHref} icon={<ArrowUpRight size={16} />} intent="secondary" label="Open detailed insights" />
    </Card>
  );
}
