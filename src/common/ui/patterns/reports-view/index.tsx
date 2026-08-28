"use client";

import { FileBarChart, Download } from "lucide-react";
import { CashFlowForecastCard } from "@/src/common/ui/patterns/cash-flow-forecast-card";
import { Button } from "@/src/common/ui";
import { CategoryBreakdown } from "./category-breakdown";
import { MonthlyTable } from "./monthly-table";
import { MonthlyTrend } from "./monthly-trend";
import { SummaryCards } from "./summary-cards";
import { exportCsv } from "./csv";
import type { ReportsViewProps } from "./types";

export { type ReportsViewProps } from "./types";

export function ReportsView({ initialData: data, initialCashFlow: cashFlow, currency = "INR" }: ReportsViewProps) {
  if (data.monthly.length === 0) {
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

      <CashFlowForecastCard projection={cashFlow} />

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
