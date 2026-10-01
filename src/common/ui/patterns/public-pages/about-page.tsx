'use client';

import {
  Bot,
  DatabaseZap,
  Globe,
  Lock,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { AnimateInView } from './shared';

export function AboutPageContent() {
  return (
    <main className="min-h-screen bg-bg-base">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-white/[0.06]">
        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <AnimateInView>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-medium text-text-secondary">
              Our Mission
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Personal finance without friction or data compromises.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-xs sm:text-sm leading-relaxed text-text-secondary">
              Built as a focused, high-precision financial utility for people who value speed, full data ownership, and strict mathematical accuracy.
            </p>
          </AnimateInView>
        </div>
      </section>

      {/* Engineering Philosophy */}
      <section className="relative bg-bg-base py-14 sm:py-20 border-b border-white/[0.06]">
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
            <AnimateInView>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Why we built this
              </h2>
              <div className="mt-4 space-y-4 text-xs sm:text-sm leading-relaxed text-text-secondary">
                <p>
                  Most modern budgeting apps are cluttered with third-party loan ads, aggressive upsells, and invasive data-sharing policies.
                </p>
                <p>
                  We built this platform around a different philosophy: an uncompromisingly fast, keyboard-first ledger where your balances are always up to date and your transaction history stays strictly private.
                </p>
                <p>
                  Calculations like Safe-to-Spend runway and cadence budgets run deterministically. AI features are opt-in and summarize high-level categories rather than leaking raw merchant strings.
                </p>
              </div>
            </AnimateInView>

            <AnimateInView delay={0.1}>
              <div className="space-y-4">
                {[
                  {
                    step: '01',
                    title: 'Deterministic Math First',
                    desc: 'Authoritative budgets, runway balances, and recurring cron engines map directly to verifiable transactional numbers.',
                  },
                  {
                    step: '02',
                    title: 'Summary-Only Privacy',
                    desc: 'No third-party trackers, no ad networks, and zero transmission of raw transaction notes to external models.',
                  },
                  {
                    step: '03',
                    title: 'Speed & Ergonomics',
                    desc: 'Optimistic UI updates, keyboard command palette shortcuts (⌘K), and instant Redis caching.',
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 transition-colors hover:border-white/[0.14]"
                  >
                    <span className="font-mono text-xs font-semibold text-primary">{item.step}</span>
                    <h3 className="mt-1.5 text-sm font-semibold text-white">{item.title}</h3>
                    <p className="mt-1.5 text-xs text-text-secondary leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </AnimateInView>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="relative bg-bg-base py-14 sm:py-20 border-b border-white/[0.06]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <AnimateInView className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Product Principles
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-text-secondary">
              The fundamental engineering and design guardrails behind the product.
            </p>
          </AnimateInView>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: 'Data Ownership',
                desc: 'Export complete transaction datasets in CSV anytime. Instant account deletion when requested.',
                color: '#3B82F6',
              },
              {
                icon: Lock,
                title: 'No Advertising',
                desc: 'We never sell behavioral data, loan recommendations, or affiliate credit card links.',
                color: '#37C98C',
              },
              {
                icon: Zap,
                title: 'Fast Interaction',
                desc: 'Immediate keyboard hotkeys, tab navigation, and sub-100ms response targets.',
                color: '#F0B66A',
              },
              {
                icon: Bot,
                title: 'Assistive, Not Gimmicky',
                desc: 'AI handles tedious categorization and trend detection quietly without loud interruptions.',
                color: '#A855F7',
              },
              {
                icon: Globe,
                title: 'Global Locales',
                desc: 'Customizable decimal numbers, date boundaries, and multi-currency formatting.',
                color: '#F16F6F',
              },
              {
                icon: DatabaseZap,
                title: 'Strict Precision',
                desc: 'Decimals stored with 15,2 precision in PostgreSQL to eliminate floating point drift.',
                color: '#7585F8',
              },
            ].map((p, index) => (
              <AnimateInView key={p.title} delay={index * 0.04}>
                <div className="flex h-full flex-col rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 transition-colors hover:border-white/[0.14]">
                  <div className="flex size-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                    <p.icon size={18} style={{ color: p.color }} />
                  </div>
                  <h3 className="mt-3.5 text-sm font-semibold text-white">{p.title}</h3>
                  <p className="mt-1.5 flex-1 text-xs leading-relaxed text-text-secondary">{p.desc}</p>
                </div>
              </AnimateInView>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-bg-base py-14 sm:py-20 text-center">
        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <AnimateInView>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Ready to take control?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-xs sm:text-sm text-text-secondary leading-relaxed">
              Create an account in seconds and start managing your cash runway with clarity.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-xs font-semibold text-foreground-inverse transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.99]"
              >
                Get started free
                <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 text-xs font-medium text-white transition-colors hover:border-white/20 hover:bg-white/[0.06] active:scale-[0.99]"
              >
                Back to home
              </Link>
            </div>
          </AnimateInView>
        </div>
      </section>
    </main>
  );
}
