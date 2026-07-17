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
    <section aria-labelledby="ai-disclosure-title" className="rounded-container border border-info-border bg-info-surface p-4">
      <div className="flex gap-3">
        <Database aria-hidden="true" className="mt-0.5 shrink-0" size={20} />
        <div className="min-w-0">
          <h3 className="text-interface-md font-semibold" id="ai-disclosure-title">AI data-use disclosure</h3>
          <p className="mt-1 text-interface-sm">{disclosure.purpose}</p>
          <p className="mt-3 text-interface-sm font-semibold">Fields sent for generation</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-interface-sm">
            {disclosure.fields.map((field) => <li key={field}>{field}</li>)}
          </ul>
          <p className="mt-3 text-interface-sm">{disclosure.providerRetention.statement}</p>
          <Button className="mt-4" icon={<Bot size={18} />} intent="secondary" label="Continue and generate highlights" onClick={onContinue} />
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
    <div className="grid gap-5">
      <section aria-labelledby="recorded-facts-title" className="rounded-container border border-border bg-surface-subtle p-4">
        <h3 className="text-interface-md font-semibold text-foreground" id="recorded-facts-title">Recorded data facts</h3>
        <p className="mt-1 text-interface-sm text-foreground-secondary">Observed from recorded transactions in this reporting period.</p>
        <dl className="mt-3 grid gap-2 text-interface-sm">
          {insightSet.facts.map((fact) => (
            <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-border pt-2 first:border-0 first:pt-0" key={`${fact.label}-${fact.value}`}>
              <dt className="text-foreground-secondary">{fact.label}</dt>
              <dd className="financial-value font-semibold text-foreground">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="ai-interpretations-title" className="grid gap-3">
        <h3 className="text-interface-md font-semibold text-foreground" id="ai-interpretations-title">AI-generated interpretations</h3>
        {insightSet.interpretations.length ? insightSet.interpretations.map((interpretation) => {
          const confidence = confidenceText(interpretation.confidence);
          return (
            <article className="rounded-container border border-info-border bg-info-surface p-4" key={interpretation.id}>
              <p className="text-interface-xs font-semibold uppercase tracking-wide">AI-generated</p>
              <h4 className="mt-1 font-semibold">{interpretation.title}</h4>
              <p className="mt-1 text-interface-sm">{interpretation.text}</p>
              {confidence ? <p className="mt-2 text-interface-xs font-semibold">Confidence: {confidence}</p> : null}
            </article>
          );
        }) : <p className="rounded-container border border-border p-4 text-interface-sm text-foreground-secondary">No AI-generated interpretations are available for this period.</p>}
      </section>

      <section aria-labelledby="ai-recommendations-title" className="grid gap-3">
        <h3 className="text-interface-md font-semibold text-foreground" id="ai-recommendations-title">AI-generated recommendations</h3>
        {insightSet.recommendations.length ? <ul className="grid gap-2">
          {insightSet.recommendations.map((recommendation) => {
            const confidence = confidenceText(recommendation.confidence);
            return <li className="rounded-container border border-primary/40 bg-surface p-4 text-interface-sm" key={recommendation.id}>
              <p className="text-interface-xs font-semibold uppercase tracking-wide text-primary">AI-generated recommendation</p>
              <p className="mt-1">{recommendation.text}</p>
              {confidence ? <p className="mt-2 text-interface-xs font-semibold">Confidence: {confidence}</p> : null}
            </li>;
          })}
        </ul> : <p className="rounded-container border border-border p-4 text-interface-sm text-foreground-secondary">No AI-generated recommendations are available for this period.</p>}
      </section>

      {hasConfidence ? <details className="rounded-container border border-border bg-surface p-4 text-interface-sm">
        <summary className="cursor-pointer font-semibold">What does AI confidence mean?</summary>
        <p className="mt-2 text-foreground-secondary">{confidenceExplanation}</p>
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
    <Card aria-labelledby={sectionId} as="section" className="min-h-[24rem] space-y-5 border-primary/40" elevation="raised" data-ai-boundary="dashboard-highlights">
      <SectionHeader
        action={<Button icon={<RefreshCw size={18} />} intent="secondary" label="Refresh AI highlights" loading={pending} onClick={() => void refresh()} />}
        description="AI-generated observations and optional guidance are kept separate from recorded financial data."
        metadata={insightSet ? <><span>Reporting period: {insightSet.period.label}</span><span aria-hidden="true"> · </span><span>Generated <DateText format="date-time" value={insightSet.generatedAt} /></span></> : "Choose to generate guidance for the current reporting period."}
        title="AI-generated highlights"
      />
      <StatusRegion busy={pending} message={pending ? "AI highlights are refreshing." : status} visible={Boolean(pending || status)} />

      {!sessionChecked ? <Skeleton label="Preparing AI highlights" minimumHeight="14rem" /> : null}
      {sessionChecked && !disclosureAccepted && !insightSet ? <DisclosurePanel disclosure={disclosure} onContinue={acceptDisclosure} /> : null}
      {pending && !insightSet ? <Skeleton label="Generating AI highlights" minimumHeight="14rem" /> : null}
      {error && insightSet ? <Alert
        action={<Button icon={<RefreshCw size={18} />} intent="secondary" label="Retry AI highlights" onClick={() => void refresh()} />}
        description={`${error} Last successful AI highlights are shown below.`}
        icon={<TriangleAlert size={20} />}
        title="Showing stale AI highlights"
        tone="warning"
      /> : null}
      {error && !insightSet && !pending ? <ErrorState
        action={<Button icon={<RefreshCw size={18} />} label="Retry AI highlights" onClick={() => void refresh()} />}
        description={error}
        title="AI highlights unavailable"
      /> : null}
      {insightSet ? <InsightContent insightSet={insightSet} /> : null}
      <LinkButton href={insightsHref} icon={<ArrowUpRight size={18} />} intent="secondary" label="Open detailed insights" />
    </Card>
  );
}
