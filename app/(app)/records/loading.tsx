import { RecordsPageSkeleton } from '@/src/common/ui/skeletons';

export default function RecordsLoading() {
  return (
    <section aria-label="Loading transactions" className="py-4">
      <RecordsPageSkeleton />
    </section>
  );
}
