import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { resolveValidReportingPeriod } from '@/lib/domain/reporting-period';
import { getAiFinancialInsights } from '@/app/actions/getAiFinancialInsights';
import { AiInsightsView } from '@/components/patterns/ai-insights-view';

export const metadata: Metadata = { title: 'AI Financial Insights – Expense AI' };

interface AiInsightsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function toSearchParams(query: Record<string, string | string[] | undefined>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string') params.set(key, value);
    else if (Array.isArray(value) && value.length > 0) params.set(key, value[0]);
  }
  return params;
}

export default async function AiInsightsPage({ searchParams }: AiInsightsPageProps) {
  const user = await getAuthUser();
  if (!user) redirect('/sign-in');

  const query = await searchParams;
  const { input: periodInput } = resolveValidReportingPeriod(toSearchParams(query));

  const result = await getAiFinancialInsights(periodInput);

  return (
    <AiInsightsView
      initialData={result.status === 'success' ? result.data : null}
      period={periodInput}
      error={result.status !== 'success' ? result.message : undefined}
    />
  );
}
