"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { BudgetOverviewCard } from "@/components/patterns/budget-overview-card";
import { CategoryBreakdownPanel } from "@/components/patterns/category-breakdown-panel";
import { HeroKpiCard } from "@/components/patterns/hero-kpi-card";
import { RecentTransactionsCard } from "@/components/patterns/recent-transactions-card";
import { SpendingOverviewPanel } from "@/components/patterns/spending-overview-panel";
import type { DashboardDTO } from "@/lib/domain/dashboard";
import { appPeriodHref } from "@/lib/domain/reporting-period";
import { MonthSwitcher } from "@/components/patterns/month-switcher";
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
  const router = useRouter();
  const currentDashboard = dashboard;
  const insightsHref = appPeriodHref("ai-insights", period) ?? "/ai-insights";

  const aiInsight = generateDashboardAIInsight(currentDashboard);

  return (
    <div className="grid gap-6">
      <header className="mb-6 flex min-w-0 items-center justify-between">
        <h1 className="text-display-2xl font-bold tracking-tight text-primary-fixed">Dashboard</h1>
        <MonthSwitcher period={currentDashboard.period} />
      </header>

      <motion.section
        animate="visible"
        aria-label="Financial overview"
        className="grid gap-5"
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

        <div
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
              onBudgetSaved={() => router.refresh()}
            />
            <CategoryBreakdownPanel
              breakdown={currentDashboard.categoryBreakdown}
              currency={currentDashboard.currency}
              period={currentDashboard.period.label}
              totalSpendingMinor={currentDashboard.insights.spending.currentMinor}
            />
          </div>
        </div>
      </motion.section>
    </div>
  );
}
