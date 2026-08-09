"use client";

import { FileBarChart, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { getReportData, type ReportData } from "@/app/actions/getReportData";
import { getCashFlowForecast } from "@/app/actions/getCashFlowForecast";
import { CashFlowForecastCard } from "@/components/patterns/cash-flow-forecast-card";
import { formatCurrency } from "@/lib/formatters/locale";
import { Button } from "@/components/ui";
import type { CashFlowProjection } from "@/lib/domain/cash-flow";
import type { ResolvedPeriod } from "@/lib/domain/types";

function SparkBar({ value, max, color }: { value: number; max: number; color: string }) {
  const height = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="h-20 w-6 rounded-md bg-muted/30 relative overflow-hidden">
        <div
          className="absolute bottom-0 w-full rounded-t-md transition-all duration-500"
          style={{ height: `${height}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function ReportsView({ period, currency = "INR" }: { period: ResolvedPeriod; currency?: string }) {
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

  const exportCsv = () => {
    if (!data) return;
    const header = "Month,Income,Expense,Net,Transactions";
    const rows = data.monthly.map(m =>
      `${m.month},${(m.incomeMinor / 100).toFixed(2)},${(m.expenseMinor / 100).toFixed(2)},${(m.netMinor / 100).toFixed(2)},${m.transactionCount}`
    );
    const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "spending-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

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
        <Button icon={<Download size={16} />} label="Export CSV" onClick={exportCsv} />
      </header>

      {cashFlow ? <CashFlowForecastCard projection={cashFlow} /> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border/50 bg-surface p-4">
          <p className="text-xs text-muted-foreground">Total Income</p>
          <p className="mt-1 text-xl font-bold text-[#22C55E]">
            {formatCurrency({ minorValue: data.totalIncomeMinor, currency })}
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-surface p-4">
          <p className="text-xs text-muted-foreground">Total Expenses</p>
          <p className="mt-1 text-xl font-bold text-[#F04438]">
            {formatCurrency({ minorValue: data.totalExpenseMinor, currency })}
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-surface p-4">
          <p className="text-xs text-muted-foreground">Net</p>
          <p className={`mt-1 text-xl font-bold ${data.netMinor >= 0 ? "text-[#22C55E]" : "text-[#F04438]"}`}>
            {formatCurrency({ minorValue: data.netMinor, currency })}
          </p>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-sm font-semibold text-foreground">Monthly Trend</h2>
        <div className="rounded-xl border border-border/50 bg-surface p-6">
          <div className="flex items-end justify-between gap-2" style={{ minHeight: 160 }}>
            {data.monthly.map(m => (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex gap-0.5">
                  <SparkBar value={m.incomeMinor} max={maxIncome} color="#22C55E" />
                  <SparkBar value={m.expenseMinor} max={maxExpense} color="#F04438" />
                </div>
                <span className="text-[10px] text-muted-foreground">{m.month.slice(5)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#22C55E]" /> Income</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#F04438]" /> Expenses</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold text-foreground">Spending by Category</h2>
        <div className="space-y-2">
          {data.byCategory.map(cat => (
            <div key={cat.categoryId} className="flex items-center gap-3 rounded-xl border border-border/50 bg-surface px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileBarChart size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{cat.label}</span>
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency({ minorValue: cat.amountMinor, currency })}
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-muted/30 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(cat.percentage * 100, 100)}%` }}
                  />
                </div>
                <div className="mt-0.5 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{(cat.percentage * 100).toFixed(1)}%</span>
                  <span>{cat.transactionCount} txns</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold text-foreground">Monthly Breakdown</h2>
        <div className="overflow-x-auto rounded-xl border border-border/50">
          <table className="w-full min-w-max text-left text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Month</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Income</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Expenses</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Net</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Txns</th>
              </tr>
            </thead>
            <tbody>
              {data.monthly.map(m => (
                <tr key={m.month} className="border-b border-border/30 last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{m.month}</td>
                  <td className="px-4 py-3 text-right text-[#22C55E]">
                    {formatCurrency({ minorValue: m.incomeMinor, currency })}
                  </td>
                  <td className="px-4 py-3 text-right text-[#F04438]">
                    {formatCurrency({ minorValue: m.expenseMinor, currency })}
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${m.netMinor >= 0 ? "text-[#22C55E]" : "text-[#F04438]"}`}>
                    {formatCurrency({ minorValue: m.netMinor, currency })}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{m.transactionCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
