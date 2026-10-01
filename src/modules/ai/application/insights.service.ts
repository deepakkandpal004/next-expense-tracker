'use server';

import { getAuthUser } from '@/src/modules/auth';
import { db } from '@/src/database/client';
import { getCache, setCache, CacheKey } from '@/src/common/cache';
import { getCachedDashboardData } from '@/src/modules/dashboard';
import { getCachedMoneyLeakReport } from '@/src/modules/reports/infrastructure/money-leaks.repository';
import type { Prisma } from '@prisma/client';
import { normalizeReportingPeriod } from '@/src/common/domain/reporting-period';
import type { ActionResult, ReportingPeriod } from '@/src/common/domain/types';
import type { MoneyLeakReport } from '@/src/common/domain/money-leaks';
import { formatCurrency } from '@/src/common/formatters/locale';
import { generateExpenseInsights, type AIInsight } from '@/src/integrations/openai';
import type { AiProviderPayload } from '@/src/common/domain/ai';
import { rateLimitAiUser } from '@/src/common/rate-limit';

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
  summaryMetrics: {
    totalSpending: { value: string; changePercent: number; trend: 'up' | 'down' };
    potentialSavings: { value: string; changePercent: number; trend: 'up' | 'down' };
    topCategory: { name: string; amount: string; percentage: string };
    financialHealth: { score: number; changePoints: number };
  };
  insights: AiInsightCard[];
  aiInsights: AIInsight[];
  moneyLeaks: MoneyLeakReport;
  confidence: {
    score: number;
    label: string;
    transactionCount: number;
    daysAnalyzed: number;
  };
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
  options: { generateAi?: boolean; refreshCache?: boolean } = {},
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
    const cacheKey = {
      userId: user.id,
      periodStart: normalized.period.start,
      periodEnd: normalized.period.end,
    };
    // L1 Redis in front of the aiInsightCache table: the DB is in a far
    // region, so even the cache-table lookup costs ~2s without this.
    const aiCacheRedisKey = CacheKey.aiInsight(user.id, `${normalized.period.start}`, `${normalized.period.end}`);
    const [dashboard, moneyLeaks, cachedAiInsights] = await Promise.all([
      getCachedDashboardData(user.id, normalized.period, user.currency),
      getCachedMoneyLeakReport(user.id, normalized.period),
      (async (): Promise<AIInsight[]> => {
        const fromRedis = await getCache<AIInsight[]>(aiCacheRedisKey);
        if (fromRedis) return fromRedis;
        const fromDb = await db.aiInsightCache.findUnique({
          where: { userId_periodStart_periodEnd: cacheKey },
        });
        const insights: AIInsight[] =
          fromDb && Array.isArray(fromDb.data) ? (fromDb.data as unknown as AIInsight[]) : [];
        // Cache even the empty result: this lookup runs on every page load
        // and the DB is in a far region. Regenerating overwrites this key.
        await setCache(aiCacheRedisKey, insights, 3600);
        return insights;
      })(),
    ]);
    const computedLeakSavings = moneyLeaks.totalMonthlySavingsMinor;

    const spendingTrend = dashboard.insights.spending.trend;
    const incomeTrend = dashboard.insights.income.trend;
    const savingsRate = dashboard.snapshot.savingsRate;
    const topCategory = dashboard.categoryBreakdown[0];
    const budget = dashboard.kpis.budget;

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

    const potentialSavings = computedLeakSavings;
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
        description: `You spent ${Math.abs(spendingChangePercent)}% less than last period.`,
        metric: `${spendingChangePercent}%`,
        actionLabel: 'View details',
        actionHref: '/records',
      });
    } else {
      insights.push({
        id: 'spending-stable',
        type: 'positive',
        title: 'Spending is stable',
        description: `Your spending is in line with last period.${topCategory ? ` Top category: ${topCategory.label}.` : ''}`,
        metric: `${spendingChangePercent}%`,
        actionLabel: 'View records',
        actionHref: '/records',
      });
    }

    if (savingsRate < 0.15 && dashboard.insights.income.currentMinor > 0) {
      insights.push({
        id: 'savings-opportunity',
        type: 'savings-opportunity',
        title: 'You can save more',
        description: `Trimming subscriptions and discretionary spending could lift your savings rate from ${Math.round(savingsRate * 100)}% toward the 20% target.`,
        metric: formatCurrency({ minorValue: potentialSavings, currency: dashboard.currency }),
        actionLabel: 'View details',
        actionHref: '/goals',
      });
    } else if (savingsRate >= 0.25) {
      insights.push({
        id: 'savings-excellent',
        type: 'positive',
        title: 'Excellent savings rate',
        description: `You're saving ${Math.round(savingsRate * 100)}% of your income — above the 20% benchmark.`,
        metric: `${Math.round(savingsRate * 100)}%`,
        actionLabel: 'Set goals',
        actionHref: '/goals',
      });
    } else {
      insights.push({
        id: 'savings-on-track',
        type: 'positive',
        title: 'Savings on track',
        description: `Your savings rate is ${Math.round(savingsRate * 100)}% — ${savingsRate >= 0.20 ? 'above' : 'below'} the 20% target.`,
        metric: `${Math.round(savingsRate * 100)}%`,
        actionLabel: 'View goals',
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
        actionLabel: 'Set budget',
        actionHref: '/budgets',
      });
    } else if (topCategory) {
      insights.push({
        id: 'top-category',
        type: 'spending-trend',
        title: `Top category: ${topCategory.label}`,
        description: `${topCategory.label} is your highest spending category at ${Math.round(topCategory.percentage * 100)}% of total expenses.`,
        metric: formatCurrency({ minorValue: topCategory.amountMinor, currency: dashboard.currency }),
        actionLabel: 'View budgets',
        actionHref: '/budgets',
      });
    } else {
      insights.push({
        id: 'start-tracking',
        type: 'positive',
        title: 'Add more transactions',
        description: 'Add more transactions to see where your money goes.',
        actionLabel: 'Add transaction',
        actionHref: '/records?addTransaction=1',
      });
    }

    const daysInPeriod = dashboard.snapshot.daysInPeriod;

    let aiInsights: AIInsight[] = cachedAiInsights ?? [];

    if (options.generateAi !== false && (options.refreshCache === true || aiInsights.length === 0)) {
        const limit = await rateLimitAiUser(user.id);
        if (limit.allowed) {
      try {

        const providerPayload: AiProviderPayload = {
          period: {
            start: normalized.period.start,
            end: normalized.period.end,
            label: normalized.period.label,
          },
          currency: dashboard.currency,
          transactionCount: dashboard.snapshot.transactionCount,
          incomeMinor: dashboard.insights.income.currentMinor,
          spendingMinor: dashboard.insights.spending.currentMinor,
          balanceMinor: dashboard.insights.balance.currentMinor,
          categorySpending: dashboard.categoryBreakdown.map((cat: { label: string; amountMinor: number }) => ({
            categoryId: cat.label,
            amountMinor: cat.amountMinor,
          })),
        };
        const generated = await generateExpenseInsights(providerPayload);
        if (generated.length > 0) {
          aiInsights = generated;
          await db.aiInsightCache.upsert({
            where: { userId_periodStart_periodEnd: cacheKey },
            create: { ...cacheKey, data: aiInsights as unknown as Prisma.InputJsonValue },
            update: { data: aiInsights as unknown as Prisma.InputJsonValue },
          });
          await setCache(aiCacheRedisKey, aiInsights, 3600);
        }
      } catch (aiError) {
        console.error('OpenAI insights generation failed, using fallback:', aiError);
      }
      }
    }

    const result: AiFinancialInsightsData = {
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
      aiInsights,
      moneyLeaks,
      confidence: {
        score: Math.min(95, 70 + Math.round(dashboard.snapshot.transactionCount / 10)),
        label: dashboard.snapshot.transactionCount > 100 ? 'High confidence' : 'Moderate confidence',
        transactionCount: dashboard.snapshot.transactionCount,
        daysAnalyzed: daysInPeriod,
      },
    };

    return { status: 'success', data: result, message: 'Insights generated.' };
  } catch (error) {
    console.error('AI insights generation failed', error);
    return {
      status: 'error',
      message: 'Failed to generate AI insights. Please try again.',
      retryable: true,
    };
  }
}
