"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { BudgetOverviewCard } from "@/src/common/ui/patterns/budget-overview-card";
import { HeroKpiCard } from "@/src/common/ui/patterns/hero-kpi-card";
import { RecentTransactionsCard } from "@/src/common/ui/patterns/recent-transactions-card";
import { SafeToSpendCard } from "@/src/common/ui/patterns/safe-to-spend-card";
import { SmartAlertCard } from "@/src/common/ui/patterns/smart-alert-card";
import { appPeriodHref } from "@/src/common/domain/reporting-period";
import { MonthSwitcher } from "@/src/common/ui/patterns/month-switcher";
import { RedisHealthBadge } from "@/src/common/ui/patterns/redis-health-badge";
import { listContainerVariants, listItemVariants } from "@/src/common/ui/motion";
import { generateDashboardAIInsight } from "./insight";
import type { DashboardViewProps } from "./types";

export { type DashboardViewProps, type DashboardUser } from "./types";

const CashFlowForecastCard = dynamic(
  () => import("@/src/common/ui/patterns/cash-flow-forecast-card").then((mod) => ({ default: mod.CashFlowForecastCard })),
  { ssr: false }
);

const CategoryBreakdownPanel = dynamic(
  () => import("@/src/common/ui/patterns/category-breakdown-panel").then((mod) => ({ default: mod.CategoryBreakdownPanel })),
  { ssr: false }
);

const SpendingOverviewPanel = dynamic(
  () => import("@/src/common/ui/patterns/spending-overview-panel").then((mod) => ({ default: mod.SpendingOverviewPanel })),
  { ssr: false }
);

export function DashboardView({ dashboard, period, safeToSpend, cashFlow, smartPacing }: DashboardViewProps) {
  const router = useRouter();
  const currentDashboard = dashboard;
  const insightsHref = appPeriodHref("ai-insights", period) ?? "/ai-insights";

  const aiInsight = generateDashboardAIInsight(currentDashboard);

  return (
    <div className="grid gap-6">
      <header className="mb-6 flex min-w-0 items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-display-2xl font-bold tracking-tight text-primary-fixed">Dashboard</h1>
          <span className="lg:hidden">
            <RedisHealthBadge />
          </span>
        </div>
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
          <SafeToSpendCard
            period={period}
            initialBreakdown={safeToSpend}
          />
        </motion.div>

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
          <SmartAlertCard
            currency={currentDashboard.currency}
            period={period}
            report={smartPacing}
          />
        </motion.div>

        <motion.div variants={listItemVariants}>
          <CashFlowForecastCard projection={cashFlow} />
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
