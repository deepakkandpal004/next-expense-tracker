'use client';

import { EyeOff, Lock, ShieldCheck, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { AnimateInView } from './shared';

export function PrivacyPageContent() {
  return (
    <main className="min-h-screen bg-bg-base">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-white/[0.06]">
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <AnimateInView>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-medium text-text-secondary">
              Data Privacy
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Your financial data stays yours.
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm text-text-secondary leading-relaxed">
              We collect strictly what is required to calculate your cash runway and ledgers. Nothing is sold or monetized.
            </p>
          </AnimateInView>
        </div>
      </section>

      {/* Principles */}
      <section className="relative bg-bg-base py-14 sm:py-20 border-b border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: ShieldCheck,
                title: 'Minimal Collection',
                desc: 'We store only your user credentials and authenticated transaction rows required to render the application.',
                color: '#7585F8',
              },
              {
                icon: Lock,
                title: 'Encrypted Storage',
                desc: 'All database records are protected with PostgreSQL column encryption and strict authentication tokens.',
                color: '#37C98C',
              },
              {
                icon: EyeOff,
                title: 'Zero Third-Party Trackers',
                desc: 'No affiliate ad scripts, behavioral profiling tools, or marketing trackers are loaded.',
                color: '#F0B66A',
              },
              {
                icon: Trash2,
                title: 'Immediate Deletion',
                desc: 'Requesting account deletion wipes all associated ledgers, recurring profiles, and settings permanently.',
                color: '#F16F6F',
              },
            ].map((item, index) => (
              <AnimateInView key={item.title} delay={index * 0.05}>
                <div className="flex h-full flex-col rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 transition-colors hover:border-white/[0.14]">
                  <div className="flex size-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                    <item.icon size={18} style={{ color: item.color }} />
                  </div>
                  <h3 className="mt-3.5 text-sm font-semibold text-white">{item.title}</h3>
                  <p className="mt-1.5 flex-1 text-xs leading-relaxed text-text-secondary">{item.desc}</p>
                </div>
              </AnimateInView>
            ))}
          </div>
        </div>
      </section>

      {/* What we store */}
      <section className="relative bg-bg-base py-14 sm:py-20 border-b border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <AnimateInView className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Data Retention Boundaries
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-text-secondary">
              A transparent breakdown of data elements stored in the system.
            </p>
          </AnimateInView>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DataCard label="Account" items={['Email address', 'Display name', 'Bcrypt password hash']} />
            <DataCard label="Transactions" items={['Amount & currency', 'Category & date', 'Merchant label']} />
            <DataCard label="Preferences" items={['Theme setting', 'Default currency', 'Budget targets']} />
            <DataCard label="AI Scopes" items={['Aggregated totals only', 'Zero raw merchant notes', 'Time-period scoped']} />
          </div>
        </div>
      </section>

      {/* Footer note */}
      <section className="relative bg-bg-base py-12 sm:py-16 text-center">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-text-secondary leading-relaxed">
            Questions regarding our privacy architecture? Contact us at{' '}
            <Link href="mailto:deepakkandpal.tech@gmail.com" className="font-medium text-primary hover:underline">
              deepakkandpal.tech@gmail.com
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function DataCard({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 transition-colors hover:border-white/[0.14]">
      <p className="text-[11px] font-mono font-semibold text-primary uppercase tracking-wider mb-3">{label}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-xs text-text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-white/20 shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
