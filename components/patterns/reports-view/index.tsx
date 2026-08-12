"use client";

import { FileBarChart, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { getReportData, type ReportData } from "@/app/actions/getReportData";
import { getCashFlowForecast } from "@/app/actions/getCashFlowForecast";
import { CashFlowForecastCard } from "@/components/patterns/cash-flow-forecast-card";
import { Button } from "@/components/ui";
import type { CashFlowProjection } from "@/lib/domain/cash-flow";
import { CategoryBreakdown } from "./category-breakdown";
import { MonthlyTable } from "./monthly-table";
import { MonthlyTrend } from "./monthly-trend";
import { SummaryCards } from "./summary-cards";
import { exportCsv } from "./csv";
import type { ReportsViewProps } from "./types";

export { type ReportsViewProps } from "./types";

export function ReportsView({ period, currency = "INR" }: ReportsViewProps) {
  const [data, setData] = useState<ReportData | null>(null);
  const [cashFlow, setCashFlow] = useState<CashFlowProjection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setCashFlow(null);
    Promise.all([getReportData(period), getCashFlowForecast(period)]).then(
      ([reportResult, forecastResult]) => {
        setData(reportResult);
        if (forecastResult.status === "success") {
          setCashFlow(forecastResult.data);
        }
        setLoading(false);
      },
    );
  }, [period]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-card/50" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-card/50" />)}
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-card/50" />
      </div>
    );
  }

  if (!data || data.monthly.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileBarChart className="mb-3 size-10 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">No data yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">Add some transactions to see reports.</p>
      </div>
    );
  }

  const maxExpense = Math.max(...data.monthly.map(m => m.expenseMinor));
  const maxIncome = Math.max(...data.monthly.map(m => m.incomeMinor));

  return (
    <div className="grid gap-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-display-xl font-bold text-foreground">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">12-month spending analysis</p>
        </div>
        <Button icon={<Download size={16} />} label="Export CSV" onClick={() => exportCsv(data)} />
      </header>

      {cashFlow ? <CashFlowForecastCard projection={cashFlow} /> : null}

      <SummaryCards
        totalIncomeMinor={data.totalIncomeMinor}
        totalExpenseMinor={data.totalExpenseMinor}
        netMinor={data.netMinor}
        currency={currency}
      />

      <MonthlyTrend
        monthly={data.monthly}
        maxIncome={maxIncome}
        maxExpense={maxExpense}
      />

      <CategoryBreakdown
        categories={data.byCategory}
        currency={currency}
      />

      <MonthlyTable
        monthly={data.monthly}
        currency={currency}
      />
    </div>
  );
}
