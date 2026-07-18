import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { getAiAnswerDisclosure, getAiInsightsDisclosure } from '@/lib/domain/ai';
import { resolveValidReportingPeriod } from '@/lib/domain/reporting-period';
import { AiHighlightList } from '@/components/patterns/ai-highlight-list';
import { ConversationPanel } from '@/components/patterns/conversation-panel';

export const metadata: Metadata = { title: 'Insights – Expense AI' };

interface InsightsPageProps {
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

export default async function InsightsPage({ searchParams }: InsightsPageProps) {
  const user = await getAuthUser();
  if (!user) redirect('/sign-in');

  const query = await searchParams;
  const { input: periodInput } = resolveValidReportingPeriod(toSearchParams(query));
  const answerDisclosure = getAiAnswerDisclosure();
  const insightsDisclosure = getAiInsightsDisclosure();

  return (
    <>
      <AiHighlightList disclosure={insightsDisclosure} period={periodInput} />
      <ConversationPanel disclosure={answerDisclosure} period={periodInput} />
    </>
  );
}
