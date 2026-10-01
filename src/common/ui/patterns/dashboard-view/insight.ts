import type { HeroKpiCardProps } from "@/src/common/ui/patterns/hero-kpi-card";
import type { DashboardDTO } from "@/src/common/domain/dashboard";
import { formatCurrency, formatPercentage } from "@/src/common/formatters/locale";

export function generateDashboardAIInsight(
  dashboard: DashboardDTO,
): NonNullable<HeroKpiCardProps["aiInsight"]> | undefined {
  const { insights, snapshot, kpis, categoryBreakdown } = dashboard;
  const savingsRate = snapshot.savingsRate * 100;
  const expenseTrend = insights.spending.trend;

  if (expenseTrend && expenseTrend.direction === "up" && expenseTrend.changePercent > 0.2) {
    return {
      title: "Spending went up",
      description: `Your spending is up ${(expenseTrend.changePercent * 100).toFixed(0)}% from last month. See which categories grew.`,
      type: "warning",
      actionLabel: "Analyze categories",
      actionHref: "/ai-insights?focus=categories",
    };
  }

  if (savingsRate >= 25) {
    return {
      title: "Saving well",
      description: `You're saving ${savingsRate.toFixed(0)}% of your income — well above the usual 20% target.`,
      type: "celebration",
      actionLabel: "Explore investments",
      actionHref: "/goals",
    };
  }

  if (savingsRate > 0 && savingsRate < 10) {
    return {
      title: "Savings are low",
      description: `You're saving only ${savingsRate.toFixed(0)}% of your income. Try to reach 20% if you can.`,
      type: "info",
      actionLabel: "Set savings goal",
      actionHref: "/goals",
    };
  }

  if (kpis.budget.status === "exceeded") {
    return {
      title: "Over budget",
      description: `You're over budget by ${formatCurrency({ minorValue: kpis.budget.excessMinor, currency: dashboard.currency })}.`,
      type: "warning",
      actionLabel: "Review budget",
      actionHref: "/budgets",
    };
  }

  if (kpis.budget.status === "approaching") {
    const used = (kpis.budget.budgetMinor - kpis.budget.remainingMinor) / kpis.budget.budgetMinor;
    return {
      title: "Budget almost used",
      description: `You've used ${formatPercentage(used)} of your monthly budget. ${formatCurrency({ minorValue: kpis.budget.remainingMinor, currency: dashboard.currency })} remaining.`,
      type: "info",
    };
  }

  if (categoryBreakdown.length > 0) {
    const topCategory = categoryBreakdown[0];
    if (topCategory.percentage > 0.4) {
      return {
        title: `Top category: ${topCategory.label}`,
        description: `${topCategory.label} is ${formatPercentage(topCategory.percentage)} of your spending this period.`,
        type: "info",
        actionLabel: "Set category budget",
        actionHref: "/budgets",
      };
    }
  }

  if (snapshot.transactionCount === 0) {
    return {
      title: "Add your first transaction",
      description: "Add your first transaction to start seeing insights.",
      type: "info",
      actionLabel: "Add transaction",
      actionHref: "/records?addTransaction=1",
    };
  }

  return {
    title: "Looking good",
    description: "Your spending looks healthy this period.",
    type: "positive",
  };
}
