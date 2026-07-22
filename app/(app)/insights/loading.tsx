import { InsightsPageSkeleton } from '@/components/ui/skeletons';

export default function InsightsLoading() {
  return (
    <section aria-label="Loading insights" className="py-4">
      <InsightsPageSkeleton />
    </section>
  );
}
