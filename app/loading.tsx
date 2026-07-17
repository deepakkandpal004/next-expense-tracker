import { Skeleton } from '@/components/ui/feedback';

export default function Loading() {
  return (
    <section aria-label='Loading page' className='content-frame py-8'>
      <Skeleton
        label='Loading page content'
        lines={6}
        minimumHeight='36rem'
      />
    </section>
  );
}
