import { AiInsightsSkeleton } from '@/components/ui/skeletons';

export default function AiInsightsLoading() {
  return (
    <section aria-label="Loading AI insights" className="py-4">
      <AiInsightsSkeleton />
    </section>
  );
}
