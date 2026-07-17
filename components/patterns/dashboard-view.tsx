"use client";

import { motion } from "motion/react";
import { ArrowUpRight, RefreshCw } from "lucide-react";
import { useState } from "react";
import { createTransaction, type CreateTransactionRequest } from "@/app/actions/addExpenseRecord";
import { getDashboardSnapshot } from "@/app/actions/getDashboardSnapshot";
import AddNewRecord, { type TransactionSubmission } from "@/components/AddNewRecord";
import { AiHighlightList } from "@/components/patterns/ai-highlight-list";
import { BudgetOverviewCard } from "@/components/patterns/budget-overview-card";
import { CategoryBreakdownPanel } from "@/components/patterns/category-breakdown-panel";
import { KpiCard } from "@/components/patterns/kpi-card";
import { MonthlySnapshot } from "@/components/patterns/monthly-snapshot";
import { QuickActionsCard } from "@/components/patterns/quick-actions-card";
import { RecentTransactionsCard } from "@/components/patterns/recent-transactions-card";
import { SpendingOverviewPanel } from "@/components/patterns/spending-overview-panel";
import {
  Alert,
  Button,
  DateText,
  LinkButton,
  StatusRegion,
} from "@/components/ui";
import type { DashboardDTO } from "@/lib/domain/dashboard";
import { appPeriodHref } from "@/lib/domain/reporting-period";
import { listContainerVariants } from "@/lib/ui/motion";
import type { AiDataUseDisclosure, ReportingPeriod, TransactionType } from "@/lib/domain/types";

export interface DashboardViewProps {
  dashboard: DashboardDTO;
  disclosure: AiDataUseDisclosure;
  period: ReportingPeriod;
}

export function DashboardView({ dashboard, disclosure, period }: DashboardViewProps) {
  const [status, setStatus] = useState<string | undefined>();
  const [refreshedDashboard, setRefreshedDashboard] = useState<DashboardDTO | undefined>();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | undefined>();
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);
  const [addTransactionPreset, setAddTransactionPreset] = useState<TransactionType>("expense");
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

      {/* ── 1. Header: period label + last-updated + refresh ── */}
      <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-display-sm font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-interface-sm text-foreground-secondary">
            {currentDashboard.period.label}
            {currentDashboard.updatedAt ? (
              <>
                {" · "}Updated <DateText format="date-time" value={currentDashboard.updatedAt} />
              </>
            ) : null}
          </p>
        </div>
        <Button
          icon={<RefreshCw size={16} />}
          intent="secondary"
          label="Refresh"
          loading={refreshing}
          onClick={() => void refreshDashboard()}
        />
      </header>

      {/* Hidden add-transaction dialog (opened from Quick Actions) */}
      <AddNewRecord
        defaultType={addTransactionPreset}
        hideTrigger
        onOpenChange={setAddTransactionOpen}
        open={addTransactionOpen}
        submitTransaction={submitTransaction}
      />

      {/* Accessibility live region */}
      <StatusRegion message={status} visible={Boolean(status)} />

      {/* Refresh error banner */}
      {refreshError ? (
        <Alert
          action={
            <Button
              icon={<RefreshCw size={18} />}
              label="Retry dashboard"
              loading={refreshing}
              onClick={() => void refreshDashboard()}
            />
          }
          description={refreshError}
          title="Dashboard refresh failed"
          tone="danger"
        />
      ) : null}

      {/* ── 2. KPI summary row + Quick Actions ── */}
      <motion.section
        animate="visible"
        aria-busy={refreshing || undefined}
        aria-label="Key metrics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
        initial="hidden"
        variants={listContainerVariants}
      >
        <KpiCard
          currency={currentDashboard.currency}
          insight={currentDashboard.insights.balance}
          label="Total Balance"
          role="balance"
        />
        <KpiCard
          currency={currentDashboard.currency}
          insight={currentDashboard.insights.income}
          label="Total Income"
          role="income"
        />
        <KpiCard
          currency={currentDashboard.currency}
          insight={currentDashboard.insights.spending}
          label="Total Expenses"
          role="expense"
        />
        <KpiCard
          currency={currentDashboard.currency}
          insight={currentDashboard.insights.savings}
          label="Total Savings"
          role="savings"
        />
        <QuickActionsCard
          className="sm:col-span-2 xl:col-span-1"
          onAddExpense={() => {
            setAddTransactionPreset("expense");
            setAddTransactionOpen(true);
          }}
          onAddIncome={() => {
            setAddTransactionPreset("income");
            setAddTransactionOpen(true);
          }}
        />
      </motion.section>

      {/* ── 4 & 5. Main two-column grid ── */}
      <div
        aria-busy={refreshing || undefined}
        aria-label="Dashboard reporting data"
        className="grid gap-6 lg:grid-cols-12"
      >
        {/* Left column: chart → recent transactions */}
        <div className="grid gap-6 lg:col-span-7">
          <SpendingOverviewPanel
            currency={currentDashboard.currency}
            incomeInsight={currentDashboard.insights.income}
            period={currentDashboard.period.label}
            spendingInsight={currentDashboard.insights.spending}
            trendModel={currentDashboard.trend}
          />
          <RecentTransactionsCard
            allRecordsHref={appPeriodHref("records", period) ?? "/records"}
            currency={currentDashboard.currency}
            transactions={currentDashboard.recentTransactions}
          />
        </div>

        {/* Right column: budget (goal/status) → category breakdown (detail) */}
        <div className="grid gap-6 lg:col-span-5">
          <BudgetOverviewCard
            budget={currentDashboard.kpis.budget}
            categoryBreakdown={currentDashboard.categoryBreakdown}
            currency={currentDashboard.currency}
            onBudgetSaved={() => refreshDashboard("Budget saved. Dashboard refreshed.")}
          />
          <CategoryBreakdownPanel
            breakdown={currentDashboard.categoryBreakdown}
            currency={currentDashboard.currency}
            period={currentDashboard.period.label}
            totalSpendingMinor={currentDashboard.insights.spending.currentMinor}
          />
        </div>
      </div>

      {/* ── 6. Monthly Snapshot row ── */}
      <MonthlySnapshot
        currency={currentDashboard.currency}
        snapshot={currentDashboard.snapshot}
      />

      {/* ── 7. AI highlights section ── */}
      <AiHighlightList disclosure={disclosure} period={period} />

      {/* ── 8. Insights deep-dive CTA ── */}
      <section
        aria-labelledby="insights-cta-title"
        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent/30 bg-accent-surface px-6 py-5"
      >
        <div>
          <h2
            className="text-interface-md font-semibold text-accent-foreground"
            id="insights-cta-title"
          >
            Want a deeper look?
          </h2>
          <p className="mt-1 text-interface-sm text-foreground-secondary">
            Ask questions about this reporting period in detailed Insights.
          </p>
        </div>
        <LinkButton
          href={insightsHref}
          icon={<ArrowUpRight size={18} />}
          label="Open insights"
        />
      </section>
    </div>
  );
}
