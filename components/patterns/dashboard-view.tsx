"use client";

import { ArrowUpRight, Plus, RefreshCw, Wallet } from "lucide-react";
import { useState } from "react";
import { createTransaction, type CreateTransactionRequest } from "@/app/actions/addExpenseRecord";
import { getDashboardSnapshot } from "@/app/actions/getDashboardSnapshot";
import { setBudgetResult } from "@/app/actions/setBudget";
import AddNewRecord, { type TransactionSubmission } from "@/components/AddNewRecord";
import { AiHighlightList } from "@/components/patterns/ai-highlight-list";
import { ChartPanel } from "@/components/patterns/chart-panel";
import {
  Alert,
  Badge,
  Button,
  Card,
  CurrencyText,
  DataTable,
  DateText,
  Dialog,
  Field,
  LinkButton,
  SectionHeader,
  StatusRegion,
} from "@/components/ui";
import type { DashboardDTO } from "@/lib/domain/dashboard";
import { appPeriodHref } from "@/lib/domain/reporting-period";
import type { AiDataUseDisclosure, BudgetMetric, MetricValue, ReportingPeriod } from "@/lib/domain/types";
import { formatMetricValue, formatPercentage } from "@/lib/formatters/locale";

export interface DashboardViewProps {
  dashboard: DashboardDTO;
  disclosure: AiDataUseDisclosure;
  period: ReportingPeriod;
}

function KpiCard({ label, metric, currency }: { label: string; metric: MetricValue; currency: string }) {
  return (
    <Card as="article" elevation="raised" className="min-w-0">
      <p className="text-interface-sm font-medium text-foreground-secondary">{label}</p>
      <p className="financial-value mt-2 text-display-md font-bold text-foreground">{formatMetricValue(metric, currency)}</p>
      {metric.status === "unavailable" ? <p className="mt-1 text-interface-xs text-foreground-secondary">{metric.reason}</p> : null}
    </Card>
  );
}

function budgetStatusLabel(budget: BudgetMetric): string {
  switch (budget.status) {
    case "not-configured":
      return "No budget set";
    case "unavailable":
      return "Unavailable";
    case "on-track":
      return "On track";
    case "approaching":
      return "Approaching limit";
    case "exceeded":
      return "Exceeded";
  }
}

function budgetTone(budget: BudgetMetric): "neutral" | "success" | "warning" | "danger" {
  switch (budget.status) {
    case "on-track":
      return "success";
    case "approaching":
      return "warning";
    case "exceeded":
      return "danger";
    default:
      return "neutral";
  }
}

function SetBudgetDialog({ currency, onSaved }: { currency: string; onSaved: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const today = new Date().toISOString().slice(0, 10);

  const submit = async () => {
    setPending(true);
    setError(undefined);
    try {
      const result = await setBudgetResult({ amount, effectiveFrom: today, currency });
      if (result.status === "success") {
        setOpen(false);
        setAmount("");
        await onSaved();
        return;
      }
      setError(result.message);
    } catch {
      setError("The budget could not be saved. Please retry.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog
      closeLabel="Close set budget"
      description="Set the monthly budget used to evaluate spending against your target."
      onOpenChange={setOpen}
      open={open}
      title="Set budget"
      trigger={<Button icon={<Wallet size={18} />} intent="secondary" label="Set budget" />}
    >
      <form className="grid gap-5" noValidate onSubmit={(event) => { event.preventDefault(); void submit(); }}>
        <Field
          disabled={pending}
          error={error}
          id="budget-amount"
          label={`Monthly budget amount (${currency})`}
          min="0.01"
          onChange={(event) => setAmount(event.target.value)}
          required
          step="0.01"
          type="number"
          value={amount}
        />
        <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5">
          <Button disabled={pending} intent="secondary" label="Cancel" onClick={() => setOpen(false)} />
          <Button label="Save budget" loading={pending} type="submit" />
        </div>
      </form>
    </Dialog>
  );
}

function BudgetCard({ budget, onRefresh }: { budget: BudgetMetric; onRefresh: () => Promise<void> }) {
  return (
    <Card as="article" elevation="raised" className="min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-interface-sm font-medium text-foreground-secondary">Budget</p>
        <Badge tone={budgetTone(budget)}>{budgetStatusLabel(budget)}</Badge>
      </div>
      {budget.status === "not-configured" || budget.status === "unavailable" ? (
        <div className="mt-2 grid gap-3">
          <p className="text-interface-sm text-foreground-secondary">
            {budget.status === "unavailable" ? budget.reason : "No monthly budget is configured for this period."}
          </p>
          <SetBudgetDialog currency={budget.status === "unavailable" ? budget.currency : "INR"} onSaved={onRefresh} />
        </div>
      ) : (
        <div className="mt-2 grid gap-2">
          <p className="financial-value text-display-sm font-bold text-foreground">
            <CurrencyText currency={budget.currency} minorValue={budget.spentMinor} /> of{" "}
            <CurrencyText currency={budget.currency} minorValue={budget.budgetMinor} />
          </p>
          <p className="text-interface-xs text-foreground-secondary">
            {budget.status === "exceeded"
              ? `Exceeded by ${formatMetricValue({ status: "available", minorValue: budget.excessMinor }, budget.currency)} for ${budget.period.label}.`
              : `${formatMetricValue({ status: "available", minorValue: budget.remainingMinor }, budget.currency)} remaining · ${formatPercentage(budget.utilization)} used for ${budget.period.label}.`}
          </p>
        </div>
      )}
    </Card>
  );
}

export function DashboardView({ dashboard, disclosure, period }: DashboardViewProps) {
  const [status, setStatus] = useState<string | undefined>();
  const [refreshedDashboard, setRefreshedDashboard] = useState<DashboardDTO | undefined>();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | undefined>();
  const dashboardKey = `${dashboard.period.kind}:${dashboard.period.start}:${dashboard.period.end}`;
  const refreshedKey = refreshedDashboard
    ? `${refreshedDashboard.period.kind}:${refreshedDashboard.period.start}:${refreshedDashboard.period.end}`
    : undefined;
  const currentDashboard = refreshedKey === dashboardKey ? refreshedDashboard! : dashboard;
  const insightsHref = appPeriodHref("insights", period) ?? "/insights";

  const refreshDashboard = async (successMessage = "Dashboard refreshed.") => {
    setRefreshing(true);
    setRefreshError(undefined);
    setStatus("Refreshing dashboard.");
    try {
      const result = await getDashboardSnapshot(period);
      if (result.status === "success") {
        setRefreshedDashboard(result.data.dashboard);
        setStatus(successMessage);
      } else {
        setRefreshError(result.message);
        setStatus("Dashboard refresh failed. Last successful data is still available.");
      }
    } catch {
      setRefreshError("The dashboard could not be refreshed. Showing the last successful data.");
      setStatus("Dashboard refresh failed. Last successful data is still available.");
    } finally {
      setRefreshing(false);
    }
  };

  const submitTransaction = async (submission: TransactionSubmission) => {
    const result = await createTransaction(submission as CreateTransactionRequest);
    if (result.status === "success") {
      await refreshDashboard(`${result.message} Dashboard refreshed.`);
    }
    return result;
  };

  return (
    <div className="grid gap-8">
      <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-display-md font-semibold text-foreground">Dashboard</h1>
          <p className="mt-1 text-interface-sm text-foreground-secondary">Reporting period: {currentDashboard.period.label}</p>
          <p className="mt-1 text-interface-xs text-foreground-secondary">
            {currentDashboard.updatedAt ? <>Updated <DateText format="date-time" value={currentDashboard.updatedAt} /></> : "No transactions recorded for this period yet."}
          </p>
        </div>
        <div className="shrink-0"><AddNewRecord submitTransaction={submitTransaction} /></div>
      </header>
      <StatusRegion message={status} visible={Boolean(status)} />
      {refreshError ? (
        <Alert
          action={<Button icon={<RefreshCw size={18} />} label="Retry dashboard" loading={refreshing} onClick={() => void refreshDashboard()} />}
          description={refreshError}
          title="Dashboard refresh failed"
          tone="danger"
        />
      ) : null}

      <section aria-busy={refreshing || undefined} aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard currency={currentDashboard.currency} label="Balance" metric={currentDashboard.kpis.balance} />
        <KpiCard currency={currentDashboard.currency} label="Income" metric={currentDashboard.kpis.income} />
        <KpiCard currency={currentDashboard.currency} label="Spending" metric={currentDashboard.kpis.spending} />
        <BudgetCard budget={currentDashboard.kpis.budget} onRefresh={() => refreshDashboard("Budget saved. Dashboard refreshed.")} />
      </section>

      <div aria-busy={refreshing || undefined} aria-label="Dashboard reporting data" className="grid gap-8 lg:grid-cols-12">
        <div className="grid gap-8 lg:col-span-8">
          <ChartPanel addTransactionHref={appPeriodHref("records", period) ?? "/records?addTransaction=1"} model={currentDashboard.trend} visualization="line" />

          <Card as="section" aria-labelledby="recent-records-title" elevation="raised">
            <SectionHeader headingLevel={2} title="Recent records" action={<LinkButton href={appPeriodHref("records", period) ?? "/records"} icon={<ArrowUpRight size={18} />} intent="secondary" label="View all records" />} />
            <div className="mt-4">
              <DataTable
                caption="Recent records for the selected reporting period"
                columns={[
                  { id: "description", header: "Description", rowHeader: true, render: (row) => row.description },
                  { id: "category", header: "Category", render: (row) => row.categoryId },
                  { id: "date", header: "Date", render: (row) => <DateText value={row.occurredOn} /> },
                  { id: "amount", header: "Amount", align: "end", render: (row) => <CurrencyText currency={row.currency} minorValue={row.type === "expense" ? -row.amountMinor : row.amountMinor} /> },
                ]}
                emptyMessage="No records for this reporting period yet."
                rowKey={(row) => row.id}
                rows={currentDashboard.recentTransactions}
              />
            </div>
          </Card>
        </div>

        <div className="grid gap-8 lg:col-span-4">
          <AiHighlightList disclosure={disclosure} period={period} />
          <ChartPanel addTransactionHref={appPeriodHref("records", period) ?? "/records?addTransaction=1"} model={currentDashboard.categories} visualization="doughnut" />
        </div>
      </div>

      <Card as="section" aria-labelledby="insights-cta-title" className="flex flex-wrap items-center justify-between gap-4" elevation="raised">
        <div>
          <h2 className="text-display-sm font-semibold text-foreground" id="insights-cta-title">Want a deeper look?</h2>
          <p className="mt-1 text-interface-sm text-foreground-secondary">Ask questions about this reporting period in detailed Insights.</p>
        </div>
        <LinkButton href={insightsHref} icon={<Plus size={18} />} label="Open insights" />
      </Card>
    </div>
  );
}
