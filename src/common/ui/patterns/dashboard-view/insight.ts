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
