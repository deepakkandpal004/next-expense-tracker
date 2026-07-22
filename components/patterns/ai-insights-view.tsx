"use client";

import { useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { GreetingBanner } from "./ai-insights/greeting-banner";
import { SummaryKpiRow } from "./ai-insights/summary-kpi-row";
import { TopInsights } from "./ai-insights/top-insights";
import { AnalysisSummary } from "./ai-insights/analysis-summary";
import { GenerateButton } from "./ai-insights/generate-button";
import { ConfidencePanel } from "./ai-insights/confidence-panel";
import { DataSources } from "./ai-insights/data-sources";
import { RecentActivity } from "./ai-insights/recent-activity";
import { QuickActions } from "./ai-insights/quick-actions";
import { Button, ErrorState, LinkButton, StatusRegion } from "@/components/ui";
import { AiInsightsSkeleton } from "@/components/ui/skeletons";
import { getAiFinancialInsights, type AiFinancialInsightsData } from "@/app/actions/getAiFinancialInsights";
import type { ReportingPeriod } from "@/lib/domain/types";

interface AiInsightsViewProps {
  initialData: AiFinancialInsightsData | null;
  period: ReportingPeriod;
  error?: string;
}

export function AiInsightsView({ initialData, period, error: initialError }: AiInsightsViewProps) {
  const [data, setData] = useState<AiFinancialInsightsData | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(initialError);
  const [status, setStatus] = useState<string | undefined>();

  const refresh = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError(undefined);
    setStatus("Generating new insights...");
    try {
      const result = await getAiFinancialInsights(period);
      if (result.status === "success") {
        setData(result.data);
        setStatus("Insights refreshed successfully.");
      } else {
        setError(result.message);
        setStatus(undefined);
      }
    } catch {
      setError("Failed to generate insights. Please try again.");
      setStatus(undefined);
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
        <Button
          icon={<RefreshCw size={14} />}
          intent="secondary"
          label="Refresh insights"
          loading={loading}
          onClick={() => void refresh()}
        />
      </header>

      <StatusRegion message={status} visible={Boolean(status)} />

      {error && !data ? (
        <ErrorState
          title="Insights unavailable"
          description={error}
          action={
            <Button
              icon={<RefreshCw size={14} />}
              label="Retry"
              loading={loading}
              onClick={() => void refresh()}
            />
          }
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
