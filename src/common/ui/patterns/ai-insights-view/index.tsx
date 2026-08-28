"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { SummaryKpiRow } from "../ai-insights/summary-kpi-row";
import { TopInsights } from "../ai-insights/top-insights";
import { GenerateButton } from "../ai-insights/generate-button";
import { ConfidencePanel } from "../ai-insights/confidence-panel";
import { MoneyLeakDetectorCard } from "@/src/common/ui/patterns/money-leak-detector-card";
import { MonthSwitcher } from "@/src/common/ui/patterns/month-switcher";
import { ErrorState, LinkButton, useToast } from "@/src/common/ui";
import { AiInsightsSkeleton } from "@/src/common/ui/skeletons";
import { getAiFinancialInsights, type AiFinancialInsightsData } from "@/app/actions/getAiFinancialInsights";
import { AiGeneratedInsights } from "./generated-insights";
import type { AiInsightsViewProps } from "./types";

export { type AiInsightsViewProps } from "./types";

export function AiInsightsView({ initialData, period, resolvedPeriod, currency, error: initialError }: AiInsightsViewProps) {
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

          <MoneyLeakDetectorCard
            report={data.moneyLeaks}
            currency={currency}
            period={period}
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
