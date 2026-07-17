'use client';

import { Button, LinkButton } from '@/components/ui/actions';
import { Alert } from '@/components/ui/feedback';

type SafeDestination = {
  href: string;
  label: string;
};

interface RouteErrorBoundaryProps {
  destination: SafeDestination;
  reset: () => void;
}

function BoundaryActions({ destination, reset }: RouteErrorBoundaryProps) {
  return (
    <div className='flex flex-wrap gap-3'>
      <Button intent='primary' label='Retry page' onClick={reset} />
      <LinkButton href={destination.href} intent='secondary' label={destination.label} />
      <LinkButton href='/contact' intent='ghost' label='Open support' />
    </div>
  );
}

export function RouteErrorBoundary({ destination, reset }: RouteErrorBoundaryProps) {
  return (
    <section aria-labelledby='route-error-heading' className='content-frame flex min-h-[28rem] items-center py-8'>
      <div className='w-full max-w-2xl'>
        <h1 id='route-error-heading' className='font-display text-heading-md font-bold text-foreground'>
          We couldn’t load this page
        </h1>
        <p className='mt-3 max-w-prose text-interface-md text-foreground-secondary'>
          Please try again. If this keeps happening, our support team can help.
        </p>
        <Alert
          action={<BoundaryActions destination={destination} reset={reset} />}
          className='mt-6'
          description='Your information is still protected. Use one of these safe destinations to continue.'
          title='Page unavailable'
          tone='danger'
        />
      </div>
    </section>
  );
}

export function RouteNotFoundBoundary({ destination }: { destination: SafeDestination }) {
  return (
    <section aria-labelledby='not-found-heading' className='content-frame flex min-h-[28rem] items-center py-8'>
      <div className='max-w-2xl'>
        <h1 id='not-found-heading' className='font-display text-heading-md font-bold text-foreground'>
          We couldn’t find that page
        </h1>
        <p className='mt-3 max-w-prose text-interface-md text-foreground-secondary'>
          The address may be outdated or the page may have moved.
        </p>
        <div className='mt-6 flex flex-wrap gap-3'>
          <LinkButton href={destination.href} intent='primary' label={destination.label} />
          <LinkButton href='/contact' intent='secondary' label='Open support' />
        </div>
      </div>
    </section>
  );
}
