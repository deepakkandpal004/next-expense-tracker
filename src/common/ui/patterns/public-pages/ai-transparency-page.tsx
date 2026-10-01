'use client';

import { Brain, Filter, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { AnimateInView } from './shared';

export function AiTransparencyPageContent() {
  return (
    <main className="min-h-screen bg-bg-base">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-white/[0.06]">
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <AnimateInView>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-medium text-text-secondary">
              AI Transparency
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              How AI uses your data.
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm text-text-secondary leading-relaxed">
              AI features are entirely optional. When activated, only high-level numeric aggregates are evaluated — never raw merchant descriptions.
            </p>
          </AnimateInView>
        </div>
      </section>

      {/* Key points */}
      <section className="relative bg-bg-base py-14 sm:py-20 border-b border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Brain,
                title: 'What AI Does',
                desc: 'Generates category spending summaries and trend overviews for the specific reporting period you request.',
                color: '#7585F8',
              },
              {
                icon: Filter,
                title: 'What We Send',
                desc: 'Period date ranges, default currency, transaction totals, and category rollups only.',
                color: '#37C98C',
              },
              {
                icon: ShieldCheck,
                title: 'What We Exclude',
                desc: 'Raw merchant names, individual transaction notes, timestamps, account IDs, and user identities.',
                color: '#F0B66A',
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

      {/* Disclosure table */}
      <section className="relative bg-bg-base py-14 sm:py-20 border-b border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <AnimateInView className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Data Payload Disclosure
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-text-secondary">
              Granular auditing of every field transmitted during an AI insight query.
            </p>
          </AnimateInView>

          <div className="mt-10 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
            <div className="grid grid-cols-2 border-b border-white/[0.06] bg-white/[0.03] px-5 sm:px-6 py-3.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-text-secondary">
              <div>Field Name</div>
              <div>Transmission Status</div>
            </div>
            <DisclosureRow field="Period date bounds (e.g. 2026-09-01 to 2026-09-30)" included />
            <DisclosureRow field="Currency ISO code (e.g. INR, USD)" included />
            <DisclosureRow field="Transaction count per category" included />
            <DisclosureRow field="Aggregated category totals (e.g. Dining: ₹4,500)" included />
            <DisclosureRow field="Total income & spending totals" included />
            <DisclosureRow field="Raw transaction description text" included={false} />
            <DisclosureRow field="Account IDs & user database keys" included={false} />
            <DisclosureRow field="Exact transaction timestamps" included={false} />
            <DisclosureRow field="Payment methods & bank identifiers" included={false} />
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="relative bg-bg-base py-12 sm:py-16 text-center">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-text-secondary leading-relaxed">
            AI-generated summaries are purely informational and do not constitute financial advice. Have questions? Reach out to{' '}
            <Link href="mailto:deepakkandpal.tech@gmail.com" className="font-medium text-primary hover:underline">
              deepakkandpal.tech@gmail.com
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function DisclosureRow({ field, included }: { field: string; included: boolean }) {
  return (
    <div className="grid grid-cols-2 border-b border-white/[0.04] px-5 sm:px-6 py-3.5 last:border-b-0">
      <div className="text-xs text-white flex items-center">{field}</div>
      <div>
        {included ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Included (Aggregate)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-medium text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            Excluded (Never Sent)
          </span>
        )}
      </div>
    </div>
  );
}
