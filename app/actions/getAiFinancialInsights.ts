'use server';

import { getAuthUser } from '@/lib/auth';
import { getDashboardData } from '@/lib/data/dashboard';
import { normalizeReportingPeriod } from '@/lib/domain/reporting-period';
import type { ActionResult, ReportingPeriod } from '@/lib/domain/types';
import { formatCurrency } from '@/lib/formatters/locale';

export interface AiInsightCard {
  id: string;
  type: 'spending-trend' | 'savings-opportunity' | 'unusual-activity' | 'budget-alert' | 'positive';
  title: string;
  description: string;
  metric?: string;
  actionLabel?: string;
  actionHref?: string;
}

export interface AiFinancialInsightsData {
  greeting: string;
  userName: string;
  summaryMetrics: {
    totalSpending: { value: string; changePercent: number; trend: 'up' | 'down' };
    potentialSavings: { value: string; changePercent: number; trend: 'up' | 'down' };
    topCategory: { name: string; amount: string; percentage: string };
    financialHealth: { score: number; changePoints: number };
  };
  insights: AiInsightCard[];
  analysisSummary: {
    transactions: number;
    daysAnalyzed: number;
    merchants: number;
    categories: number;
  };
  confidence: {
    score: number;
    label: string;
    transactionCount: number;
    daysAnalyzed: number;
  };
  dataSources: { label: string; available: boolean }[];
  recentActivity: { icon: string; label: string; timestamp: string; type: 'ai' | 'import' | 'budget' }[];
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function calculateFinancialHealth(score: {
  savingsRate: number;
  budgetUtilization: number;
  transactionCount: number;
  daysInPeriod: number;
}): number {
  let health = 50;
  if (score.savingsRate >= 0.2) health += 25;
  else if (score.savingsRate >= 0.1) health += 15;
  else if (score.savingsRate > 0) health += 5;

  if (score.budgetUtilization <= 0.8) health += 15;
  else if (score.budgetUtilization <= 1) health += 5;
  else health -= 10;

  if (score.transactionCount > 0 && score.daysInPeriod > 0) {
    const trackingConsistency = Math.min(score.transactionCount / score.daysInPeriod, 1);
    health += Math.round(trackingConsistency * 10);
  }

  return Math.min(100, Math.max(0, health));
}

export async function getAiFinancialInsights(
  period: ReportingPeriod,
): Promise<ActionResult<AiFinancialInsightsData, 'period'>> {
  const user = await getAuthUser();
  if (!user) {
    return { status: 'error', message: 'Sign in to continue.', retryable: false };
  }

  const normalized = normalizeReportingPeriod(period);
  if (!normalized.valid) {
    return {
      status: 'validation-error',
      fieldErrors: { period: ['Choose a valid reporting period.'] },
      message: 'Choose a valid reporting period.',
    };
  }

  try {
    const dashboard = await getDashboardData(user.id, normalized.period);

    const spendingTrend = dashboard.insights.spending.trend;
    const incomeTrend = dashboard.insights.income.trend;
    const savingsRate = dashboard.snapshot.savingsRate;
    const topCategory = dashboard.categoryBreakdown[0];
    const budget = dashboard.kpis.budget;
    const uniqueMerchants = new Set(dashboard.recentTransactions.map(t => t.description)).size;

    const healthScore = calculateFinancialHealth({
      savingsRate,
      budgetUtilization: budget.status === 'exceeded' ? 1.1 : budget.status === 'approaching' ? 0.85 : budget.status === 'on-track' ? 0.5 : 0.5,
      transactionCount: dashboard.snapshot.transactionCount,
      daysInPeriod: dashboard.snapshot.daysInPeriod,
    });

    const previousSpending = spendingTrend?.previousMinor ?? dashboard.insights.spending.currentMinor;
    const spendingChangePercent = previousSpending > 0
      ? Math.round(((dashboard.insights.spending.currentMinor - previousSpending) / previousSpending) * 100)
      : 0;

    const potentialSavings = Math.round(dashboard.insights.spending.currentMinor * 0.05);
    const previousSavings = incomeTrend?.previousMinor ?? dashboard.insights.income.currentMinor;
    const savingsChangePercent = previousSavings > 0
      ? Math.round(((dashboard.insights.income.currentMinor - potentialSavings - previousSavings) / previousSavings) * 100)
      : 0;

    const insights: AiInsightCard[] = [];

    if (spendingChangePercent > 10) {
      insights.push({
        id: 'spending-increased',
        type: 'spending-trend',
        title: 'Spending increased',
        description: `You spent ${spendingChangePercent}% more than last period. Mainly driven by ${topCategory?.label ?? 'various categories'}.`,
        metric: `${spendingChangePercent}%`,
        actionLabel: 'View details',
        actionHref: '/records',
      });
    } else if (spendingChangePercent < -10) {
      insights.push({
        id: 'spending-decreased',
        type: 'positive',
        title: 'Spending decreased',
        description: `Great job! You spent ${Math.abs(spendingChangePercent)}% less than last period. Your discipline is paying off.`,
        metric: `${spendingChangePercent}%`,
        actionLabel: 'View details',
        actionHref: '/records',
      });
    }

    if (savingsRate < 0.15 && dashboard.insights.income.currentMinor > 0) {
      insights.push({
        id: 'savings-opportunity',
        type: 'savings-opportunity',
        title: 'You can save more',
        description: `Reducing subscription expenses and late night orders can help boost your savings rate from ${Math.round(savingsRate * 100)}% to the recommended 20%.`,
        metric: formatCurrency({ minorValue: potentialSavings, currency: dashboard.currency }),
        actionLabel: 'View details',
        actionHref: '/goals',
      });
    }

    if (topCategory && topCategory.percentage > 0.3) {
      insights.push({
        id: 'unusual-category',
        type: 'unusual-activity',
        title: `High ${topCategory.label} spending`,
        description: `Your ${topCategory.label.toLowerCase()} spending accounts for ${Math.round(topCategory.percentage * 100)}% of total expenses. Consider setting a budget for this category.`,
        metric: formatCurrency({ minorValue: topCategory.amountMinor, currency: dashboard.currency }),
        actionLabel: 'View details',
        actionHref: '/budgets',
      });
    }

    if (insights.length === 0) {
      insights.push({
        id: 'all-good',
        type: 'positive',
        title: 'All looks good',
        description: 'Your spending patterns are within normal ranges. No immediate actions needed — keep up the good habits!',
        actionLabel: 'View details',
        actionHref: '/dashboard',
      });
    }

    const daysInPeriod = dashboard.snapshot.daysInPeriod;

    const recentActivity = [
      {
        icon: 'sparkles',
        label: 'AI insights generated',
        timestamp: 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        type: 'ai' as const,
      },
      ...(dashboard.snapshot.transactionCount > 0 ? [{
        icon: 'upload',
        label: 'Transactions imported',
        timestamp: 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        type: 'import' as const,
      }] : []),
      ...(budget.status !== 'not-configured' ? [{
        icon: 'file',
        label: 'Budget updated',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        type: 'budget' as const,
      }] : []),
    ];

    const result: AiFinancialInsightsData = {
      greeting: getGreeting(),
      userName: user.name?.split(' ')[0] || 'there',
      summaryMetrics: {
        totalSpending: {
          value: formatCurrency({ minorValue: dashboard.insights.spending.currentMinor, currency: dashboard.currency }),
          changePercent: spendingChangePercent,
          trend: spendingChangePercent >= 0 ? 'up' : 'down',
        },
        potentialSavings: {
          value: formatCurrency({ minorValue: potentialSavings, currency: dashboard.currency }),
          changePercent: savingsChangePercent,
          trend: 'down',
        },
        topCategory: topCategory
          ? {
              name: topCategory.label,
              amount: formatCurrency({ minorValue: topCategory.amountMinor, currency: dashboard.currency }),
              percentage: `${Math.round(topCategory.percentage * 100)}%`,
            }
          : { name: 'N/A', amount: formatCurrency({ minorValue: 0, currency: dashboard.currency }), percentage: '0%' },
        financialHealth: {
          score: healthScore,
          changePoints: spendingChangePercent < 0 ? 6 : spendingChangePercent > 20 ? -4 : 2,
        },
      },
      insights: insights.slice(0, 3),
      analysisSummary: {
        transactions: dashboard.snapshot.transactionCount,
        daysAnalyzed: daysInPeriod,
        merchants: uniqueMerchants,
        categories: dashboard.categoryBreakdown.length,
      },
      confidence: {
        score: Math.min(95, 70 + Math.round(dashboard.snapshot.transactionCount / 10)),
        label: dashboard.snapshot.transactionCount > 100 ? 'High confidence' : 'Moderate confidence',
        transactionCount: dashboard.snapshot.transactionCount,
        daysAnalyzed: daysInPeriod,
      },
      dataSources: [
        { label: 'Transactions', available: dashboard.snapshot.transactionCount > 0 },
        { label: 'Categories', available: dashboard.categoryBreakdown.length > 0 },
        { label: 'Merchant names', available: dashboard.snapshot.transactionCount > 0 },
        { label: 'Budget & goals', available: budget.status !== 'not-configured' },
        { label: 'Income information', available: dashboard.insights.income.currentMinor > 0 },
      ],
      recentActivity,
    };

    return { status: 'success', data: result, message: 'AI insights generated.' };
  } catch (error) {
    console.error('AI insights generation failed', error);
    return {
      status: 'error',
      message: 'Failed to generate AI insights. Please try again.',
      retryable: true,
    };
  }
}
