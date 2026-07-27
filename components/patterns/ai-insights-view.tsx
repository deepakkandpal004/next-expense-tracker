"use client";

import { useState, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { GreetingBanner } from "./ai-insights/greeting-banner";
import { SummaryKpiRow } from "./ai-insights/summary-kpi-row";
import { TopInsights } from "./ai-insights/top-insights";
import { AnalysisSummary } from "./ai-insights/analysis-summary";
import { GenerateButton } from "./ai-insights/generate-button";
import { ConfidencePanel } from "./ai-insights/confidence-panel";
import { DataSources } from "./ai-insights/data-sources";
import { RecentActivity } from "./ai-insights/recent-activity";
import { QuickActions } from "./ai-insights/quick-actions";
import { ErrorState, LinkButton } from "@/components/ui";
import { cn } from "@/lib/utils";
import { AiInsightsSkeleton } from "@/components/ui/skeletons";
import { getAiFinancialInsights, type AiFinancialInsightsData } from "@/app/actions/getAiFinancialInsights";
import type { ReportingPeriod } from "@/lib/domain/types";
import type { AIInsight } from "@/lib/ai";

interface AiInsightsViewProps {
  initialData: AiFinancialInsightsData | null;
  period: ReportingPeriod;
  error?: string;
}

function AiGeneratedInsights({ insights }: { insights: AIInsight[] }) {
  if (insights.length === 0) return null;

  return (
    <section className="rounded-2xl glass-card p-5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(0,220,229,0.12)] text-[#00DCE5]">
          <Sparkles size={16} />
        </div>
        <h3 className="text-base font-semibold text-[#F5F7FA]">AI Insights Timeline</h3>
      </div>

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
                "rounded-xl border p-4 backdrop-blur-md transition-all",
                isUnusual
                  ? "border-[rgba(240,68,56,0.3)] bg-[rgba(240,68,56,0.08)]"
                  : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] hover:border-[rgba(0,220,229,0.3)]"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className={cn("text-sm font-semibold", isUnusual ? "text-[#F04438]" : "text-[#F5F7FA]")}>
                  {insight.title}
                </h4>
                {insight.confidence !== undefined && (
                  <span className="shrink-0 rounded-full bg-[rgba(0,220,229,0.12)] px-2 py-0.5 text-xs font-semibold text-[#00DCE5] font-geist">
                    {Math.round(insight.confidence * 100)}% match
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-[#9AA3AF] leading-relaxed">
                {insight.message}
              </p>
              {insight.action && (
                <div className="mt-3">
                  <a
                    href={insight.action.startsWith("/") ? insight.action : "/budgets"}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00DCE5] hover:underline underline-offset-4"
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

export function AiInsightsView({ initialData, period, error: initialError }: AiInsightsViewProps) {
  const [data, setData] = useState<AiFinancialInsightsData | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(initialError);

  const refresh = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError(undefined);
    try {
      const result = await getAiFinancialInsights(period);
      if (result.status === "success") {
        setData(result.data);
      } else {
        setError(result.message);
      }
    } catch {
      setError("Failed to generate insights. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [loading, period]);

  if (!data && !loading && !error) {
    return (
      <div className="space-y-4">
        <ErrorState
          title="No data available"
          description="Start tracking your expenses to see AI-powered financial insights."
          action={
            <LinkButton
              label="Add Transaction"
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
          <h1 className="text-display-xl font-bold text-primary-fixed drop-shadow-[0_0_10px_rgba(0,220,229,0.3)]">
            AI Financial Insights
          </h1>
          <p className="mt-0.5 text-sm text-on-surface-variant/60">
            Smart analysis of your spending habits and financial health.
          </p>
        </div>
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
          <GreetingBanner
            greeting={data.greeting}
            userName={data.userName}
          />

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

              <AnalysisSummary
                transactions={data.analysisSummary.transactions}
                daysAnalyzed={data.analysisSummary.daysAnalyzed}
                merchants={data.analysisSummary.merchants}
                categories={data.analysisSummary.categories}
              />

              <GenerateButton
                onGenerate={() => void refresh()}
                loading={loading}
              />
            </div>

            <div className="lg:col-span-5 space-y-4">
              <ConfidencePanel
                score={data.confidence.score}
                label={data.confidence.label}
                transactionCount={data.confidence.transactionCount}
                daysAnalyzed={data.confidence.daysAnalyzed}
              />

              <DataSources sources={data.dataSources} />

              <RecentActivity activities={data.recentActivity} />

              <QuickActions />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
