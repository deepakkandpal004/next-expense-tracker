"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { SummaryKpiRow } from "./ai-insights/summary-kpi-row";
import { TopInsights } from "./ai-insights/top-insights";
import { GenerateButton } from "./ai-insights/generate-button";
import { ConfidencePanel } from "./ai-insights/confidence-panel";
import { MonthSwitcher } from "@/components/patterns/month-switcher";
import { ErrorState, LinkButton, useToast } from "@/components/ui";
import { cn } from "@/lib/utils";
import { AiInsightsSkeleton } from "@/components/ui/skeletons";
import { getAiFinancialInsights, type AiFinancialInsightsData } from "@/app/actions/getAiFinancialInsights";
import type { ReportingPeriod, ResolvedPeriod } from "@/lib/domain/types";
import type { AIInsight } from "@/lib/ai";

interface AiInsightsViewProps {
  initialData: AiFinancialInsightsData | null;
  period: ReportingPeriod;
  resolvedPeriod: ResolvedPeriod;
  error?: string;
}

function AiGeneratedInsights({ insights }: { insights: AIInsight[] }) {
  return (
    <section className="rounded-xl border border-border/50 bg-surface p-4 space-y-4">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Sparkles size={12} />
        </span>
        <h2 className="text-sm font-semibold text-foreground">AI Insights Timeline</h2>
      </div>

      {insights.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No AI insights yet for this period. Click Generate to create them.
        </p>
      )}

      <div className="space-y-3">
        {insights.map((insight) => {
          const isUnusual =
            insight.type === "warning" ||
            insight.title.toLowerCase().includes("unusual") ||
            insight.title.toLowerCase().includes("alert") ||
            insight.title.toLowerCase().includes("spike");

          return (
            <div
              key={insight.id}
              className={cn(
                "rounded-xl border p-4 transition-all",
                isUnusual
                  ? "border-danger/25 bg-danger/5"
                  : "border-border/50 bg-surface hover:border-primary/30"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className={cn("text-sm font-semibold", isUnusual ? "text-danger" : "text-foreground")}>
                  {insight.title}
                </h3>
                {insight.confidence !== undefined && (
                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {Math.round(insight.confidence * 100)}% match
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-foreground-secondary leading-relaxed">
                {insight.message}
              </p>
              {insight.action && (
                <div className="mt-3">
                  <a
                    href={insight.action.startsWith("/") ? insight.action : "/budgets"}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline underline-offset-4"
                  >
                    <span>{insight.action.startsWith("/") ? "View Action" : insight.action}</span>
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function AiInsightsView({ initialData, period, resolvedPeriod, error: initialError }: AiInsightsViewProps) {
  const [data, setData] = useState<AiFinancialInsightsData | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(initialError);
  const { toast } = useToast();

  // Keep local state in sync with the server-rendered payload: useState only
  // initializes once, so after switching periods delivers a new initialData
  // the page would otherwise keep showing the previous month's insights.
  useEffect(() => {
    setData(initialData);
    setError(initialError);
    setLoading(false);
  }, [initialData, initialError]);

  const latestPeriodRef = useRef(period);
  latestPeriodRef.current = period;

  const refresh = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError(undefined);
    const requestedPeriod = period;
    try {
      const result = await getAiFinancialInsights(requestedPeriod, { generateAi: true, refreshCache: true });
      // Ignore results for a period the user has already navigated away from.
      if (latestPeriodRef.current !== requestedPeriod) return;
      if (result.status === "success") {
        setData(result.data);
        toast({ description: result.message, tone: "success" });
      } else {
        setError(result.message);
        if (data) {
          toast({ description: result.message, tone: "error" });
        }
      }
    } catch {
      if (latestPeriodRef.current === requestedPeriod) {
        setError("Failed to generate insights. Please try again.");
        if (data) {
          toast({ description: "Failed to generate insights. Please try again.", tone: "error" });
        }
      }
    } finally {
      if (latestPeriodRef.current === requestedPeriod) {
        setLoading(false);
      }
    }
  }, [loading, period, data, toast]);

  if (!data && !loading && !error) {
    return (
      <div className="space-y-4">
        <ErrorState
          title="No data available"
          description="Start tracking your expenses to see AI-powered financial insights."
          action={
            <LinkButton
              label="Add transaction"
              href="/records?addTransaction=1"
            />
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-display-2xl font-bold tracking-tight text-foreground">
            AI Insights
          </h1>
          <p className="mt-0.5 text-sm text-on-surface-variant/60">
            Smart analysis of your spending habits and financial health.
          </p>
        </div>
        <MonthSwitcher period={resolvedPeriod} />
      </header>

      {error && !data ? (
        <ErrorState
          title="Insights unavailable"
          description={error}
        />
      ) : null}

      {loading && !data ? (
        <AiInsightsSkeleton />
      ) : data ? (
        <>
          <SummaryKpiRow
            totalSpending={{ label: "Total Spending", ...data.summaryMetrics.totalSpending }}
            potentialSavings={{ label: "Potential Savings", ...data.summaryMetrics.potentialSavings }}
            topCategory={data.summaryMetrics.topCategory}
            financialHealth={data.summaryMetrics.financialHealth}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 space-y-4">
              <TopInsights insights={data.insights} />

              <AiGeneratedInsights insights={data.aiInsights} />
            </div>

            <div className="lg:col-span-5 space-y-4">
              <ConfidencePanel
                score={data.confidence.score}
                label={data.confidence.label}
                transactionCount={data.confidence.transactionCount}
                daysAnalyzed={data.confidence.daysAnalyzed}
              />

              <GenerateButton
                onGenerate={() => void refresh()}
                loading={loading}
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
