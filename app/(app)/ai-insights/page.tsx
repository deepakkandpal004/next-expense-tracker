import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/src/modules/auth';
import { resolveValidReportingPeriod } from '@/src/common/domain/reporting-period';
import { toSearchParams } from '@/src/common/domain/search-params';
import { getAiFinancialInsights } from '@/src/modules/ai/application/insights.service';
import { AiInsightsView } from '@/src/common/ui/patterns/ai-insights-view';

export const metadata: Metadata = { title: 'AI Financial Insights – Expense Tracker AI' };

interface AiInsightsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AiInsightsPage({ searchParams }: AiInsightsPageProps) {
  const user = await getAuthUser();
  if (!user) redirect('/sign-in');

  const query = await searchParams;
  const { input: periodInput, period: resolvedPeriod } = resolveValidReportingPeriod(toSearchParams(query));

  const result = await getAiFinancialInsights(periodInput, { generateAi: false });

  return (
    <AiInsightsView
      initialData={result.status === 'success' ? result.data : null}
      period={periodInput}
      resolvedPeriod={resolvedPeriod}
      currency={user.currency ?? 'INR'}
      error={result.status !== 'success' ? result.message : undefined}
    />
  );
}
