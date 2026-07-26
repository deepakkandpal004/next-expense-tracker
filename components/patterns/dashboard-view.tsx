"use client";

import { motion } from "motion/react";
import { ArrowUpRight, RefreshCw } from "lucide-react";
import { useState } from "react";
import { getDashboardSnapshot } from "@/app/actions/getDashboardSnapshot";
import { BudgetOverviewCard } from "@/components/patterns/budget-overview-card";
import { CategoryBreakdownPanel } from "@/components/patterns/category-breakdown-panel";
import { ForecastCard } from "@/components/patterns/forecast-card";
import { HeroKpiCard } from "@/components/patterns/hero-kpi-card";
import { QuickActionsCard } from "@/components/patterns/quick-actions-card";
import { RecentTransactionsCard } from "@/components/patterns/recent-transactions-card";
import { SpendingOverviewPanel } from "@/components/patterns/spending-overview-panel";
import { AIFinancialCoach, generateAICoachInsight } from "@/components/patterns/ai-financial-coach";
import { MonthlySnapshot } from "@/components/patterns/monthly-snapshot";
import {
  Alert,
  Button,
  DateText,
  LinkButton,
  StatusRegion,
} from "@/components/ui";
import type { DashboardDTO } from "@/lib/domain/dashboard";
import { appPeriodHref } from "@/lib/domain/reporting-period";
import { listContainerVariants, listItemVariants } from "@/lib/ui/motion";
import type { ReportingPeriod } from "@/lib/domain/types";
import { formatCurrency, formatPercentage } from "@/lib/formatters/locale";

export interface DashboardUser {
  name: string | null;
}

export interface DashboardViewProps {
  dashboard: DashboardDTO;
  period: ReportingPeriod;
  user?: DashboardUser;
}

function generateDashboardAIInsight(dashboard: DashboardDTO): NonNullable<Parameters<typeof HeroKpiCard>[0]["aiInsight"]> | undefined {
  const { insights, snapshot, kpis, categoryBreakdown } = dashboard;
  const savingsRate = snapshot.savingsRate * 100;
  const expenseTrend = insights.spending.trend;

  if (expenseTrend && expenseTrend.direction === "up" && expenseTrend.changePercent > 0.2) {
    return {
      title: "Spending Spike Detected",
      description: `Your expenses increased ${(expenseTrend.changePercent * 100).toFixed(0)}% vs last period. Review your top categories to identify the cause.`,
      type: "warning",
      actionLabel: "Analyze Categories",
      actionHref: "/ai-insights?focus=categories",
    };
  }

  if (savingsRate >= 25) {
    return {
      title: "Exceptional Savings Discipline",
      description: `You're saving ${savingsRate.toFixed(0)}% of your income — well above the 20% benchmark. Consider investing the surplus for long-term growth.`,
      type: "celebration",
      actionLabel: "Explore Investments",
      actionHref: "/goals",
    };
  }

  if (savingsRate > 0 && savingsRate < 10) {
    return {
      title: "Savings Rate Below Target",
      description: `You're saving only ${savingsRate.toFixed(0)}% of income. The 50/30/20 rule suggests 20% for savings. Small adjustments can make a big difference.`,
      type: "info",
      actionLabel: "Set Savings Goal",
      actionHref: "/goals",
    };
  }

  if (kpis.budget.status === "exceeded") {
    return {
      title: "Budget Exceeded",
      description: `You're over budget by ${formatCurrency({ minorValue: kpis.budget.excessMinor, currency: dashboard.currency })}. Consider adjusting spending or increasing your budget limit.`,
      type: "warning",
      actionLabel: "Review Budget",
      actionHref: "/budgets",
    };
  }

  if (kpis.budget.status === "approaching") {
    const used = (kpis.budget.budgetMinor - kpis.budget.remainingMinor) / kpis.budget.budgetMinor;
    return {
      title: "Approaching Budget Limit",
      description: `You've used ${formatPercentage(used)} of your monthly budget. ${formatCurrency({ minorValue: kpis.budget.remainingMinor, currency: dashboard.currency })} remaining.`,
      type: "info",
    };
  }

  if (categoryBreakdown.length > 0) {
    const topCategory = categoryBreakdown[0];
    if (topCategory.percentage > 0.4) {
      return {
        title: `High ${topCategory.label} Concentration`,
        description: `${topCategory.label} accounts for ${formatPercentage(topCategory.percentage)} of your spending. Diversifying categories can improve financial resilience.`,
        type: "info",
        actionLabel: "Set Category Budget",
        actionHref: "/budgets",
      };
    }
  }

  if (snapshot.transactionCount === 0) {
    return {
      title: "Start Tracking to Unlock Insights",
      description: "Add your first transaction to see personalized AI insights and build your financial health score.",
      type: "info",
      actionLabel: "Add Transaction",
      actionHref: "/records?addTransaction=1",
    };
  }

  return {
    title: "Financial Health Looks Good",
    description: "Your spending patterns are within healthy ranges. Keep tracking consistently to maintain this momentum.",
    type: "positive",
  };
}

export function DashboardView({ dashboard, period }: DashboardViewProps) {
  const [status, setStatus] = useState<string | undefined>();
  const [refreshedDashboard, setRefreshedDashboard] = useState<DashboardDTO | undefined>();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | undefined>();
  const dashboardKey = `${dashboard.period.kind}:${dashboard.period.start}:${dashboard.period.end}`;
  const refreshedKey = refreshedDashboard
    ? `${refreshedDashboard.period.kind}:${refreshedDashboard.period.start}:${refreshedDashboard.period.end}`
    : undefined;
  const currentDashboard = refreshedKey === dashboardKey ? refreshedDashboard! : dashboard;
  const insightsHref = appPeriodHref("ai-insights", period) ?? "/ai-insights";

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

  const aiInsight = generateDashboardAIInsight(currentDashboard);

  const coachInsight = generateAICoachInsight(currentDashboard);

  return (
    <div className="grid gap-6">
      <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-display-xl font-bold text-primary-fixed drop-shadow-[0_0_10px_rgba(0,220,229,0.3)]">Dashboard</h1>
          <p className="mt-1 text-sm text-on-surface-variant/60">
            {currentDashboard.period.label}
            {currentDashboard.updatedAt ? (
              <>
                {" · "}Updated <DateText format="date-time" value={currentDashboard.updatedAt} />
              </>
            ) : null}
          </p>
        </div>
        <Button
          icon={<RefreshCw size={14} />}
          intent="secondary"
          label="Refresh"
          loading={refreshing}
          onClick={() => void refreshDashboard()}
        />
      </header>

      <StatusRegion message={status} visible={Boolean(status)} />

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

      <motion.section
        animate="visible"
        aria-busy={refreshing || undefined}
        aria-label="Financial overview"
        className="grid gap-4"
        initial="hidden"
        variants={listContainerVariants}
      >
        <motion.div variants={listItemVariants}>
          <HeroKpiCard
            currency={currentDashboard.currency}
            balance={currentDashboard.insights.balance}
            income={currentDashboard.insights.income}
            expense={currentDashboard.insights.spending}
            savings={currentDashboard.insights.savings}
            savingsRate={currentDashboard.snapshot.savingsRate * 100}
            snapshot={{
              daysInPeriod: currentDashboard.snapshot.daysInPeriod,
            }}
            aiInsight={aiInsight ? {
              ...aiInsight,
              secondaryActionLabel: "View Full Report",
              secondaryActionHref: insightsHref,
            } : undefined}
          />
        </motion.div>

        <motion.div variants={listItemVariants}>
          <QuickActionsCard
            onAddExpense={() => {
              window.dispatchEvent(new CustomEvent("open-add-transaction", { detail: { type: "expense" } }));
            }}
            onAddIncome={() => {
              window.dispatchEvent(new CustomEvent("open-add-transaction", { detail: { type: "income" } }));
            }}
          />
        </motion.div>
      </motion.section>

      <motion.section
        aria-busy={refreshing || undefined}
        aria-label="AI Financial Coach"
        variants={listContainerVariants}
      >
        <AIFinancialCoach
          insight={coachInsight}
          currency={currentDashboard.currency}
        />
      </motion.section>

      <ForecastCard
        period={currentDashboard.period}
        currency={currentDashboard.currency}
      />

      <div
        aria-busy={refreshing || undefined}
        aria-label="Dashboard reporting data"
        className="grid gap-5 lg:grid-cols-12"
      >
        <div className="grid gap-5 lg:col-span-7">
          <SpendingOverviewPanel
            currency={currentDashboard.currency}
            period={currentDashboard.period.label}
            incomeInsight={currentDashboard.insights.income}
            spendingInsight={currentDashboard.insights.spending}
            trendModel={currentDashboard.trend}
          />
          <RecentTransactionsCard
            allRecordsHref={appPeriodHref("records", period) ?? "/records"}
            currency={currentDashboard.currency}
            transactions={currentDashboard.recentTransactions}
          />
        </div>

        <div className="grid gap-5 lg:col-span-5">
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

      <MonthlySnapshot
        currency={currentDashboard.currency}
        snapshot={currentDashboard.snapshot}
      />

      <section
        aria-labelledby="insights-cta-title"
        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/50 bg-surface px-5 py-4"
      >
        <div>
          <h2
            className="text-interface-sm font-semibold text-foreground"
            id="insights-cta-title"
          >
            Want AI-powered insights?
          </h2>
          <p className="mt-0.5 text-interface-xs text-foreground-secondary">
            Get personalized financial insights powered by AI.
          </p>
        </div>
        <LinkButton
          href={insightsHref}
          icon={<ArrowUpRight size={16} />}
          label="Open AI insights"
        />
      </section>
    </div>
  );
}