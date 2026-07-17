import Link from 'next/link';
import { PUBLIC_DISCLOSURE_NAVIGATION, PUBLIC_NAVIGATION, SUPPORT_EMAIL, SUPPORT_HOURS, SUPPORT_PHONE, SUPPORT_PHONE_LABEL } from './public-navigation';

const linkClassName = 'block rounded-control py-1 text-interface-sm text-foreground-secondary underline-offset-4 hover:text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

export function PublicFooter() {
  return (
    <footer className='border-t border-border bg-surface-subtle py-12 pb-[calc(3rem+env(safe-area-inset-bottom))]'>
      <div className='content-frame grid gap-8 sm:grid-cols-2 lg:grid-cols-4'>
        <section aria-labelledby='footer-product'>
          <h2 className='product-mark text-display-sm font-semibold text-foreground' id='footer-product'>Expense AI</h2>
          <p className='mt-3 max-w-xs text-interface-sm text-foreground-secondary'>Expense tracking with recorded financial data and optional AI-assisted insights.</p>
        </section>
        <nav aria-labelledby='footer-navigation'>
          <h2 className='text-interface-sm font-semibold text-foreground' id='footer-navigation'>Explore</h2>
          <ul className='mt-3 space-y-1'>{PUBLIC_NAVIGATION.map((item) => <li key={item.id}><Link className={linkClassName} href={item.href}>{item.label}</Link></li>)}</ul>
        </nav>
        <section aria-labelledby='footer-support'>
          <h2 className='text-interface-sm font-semibold text-foreground' id='footer-support'>Contact support</h2>
          <address className='mt-3 space-y-2 not-italic'>
            <a className={linkClassName} href={`mailto:${SUPPORT_EMAIL}`}>Email support: {SUPPORT_EMAIL}</a>
            <a className={linkClassName} href={`tel:${SUPPORT_PHONE}`}>Call support: {SUPPORT_PHONE_LABEL}</a>
            <p className='text-interface-sm text-foreground-secondary'>Support hours: {SUPPORT_HOURS}</p>
          </address>
        </section>
        <nav aria-labelledby='footer-disclosures'>
          <h2 className='text-interface-sm font-semibold text-foreground' id='footer-disclosures'>Disclosures</h2>
          <ul className='mt-3 space-y-1'>{PUBLIC_DISCLOSURE_NAVIGATION.map((item) => <li key={item.id}><Link className={linkClassName} href={item.href}>{item.label}</Link></li>)}</ul>
        </nav>
      </div>
      <div className='content-frame mt-8 border-t border-border pt-6 text-interface-sm text-foreground-secondary'>© {new Date().getFullYear()} Expense AI. All rights reserved.</div>
    </footer>
  );
}
