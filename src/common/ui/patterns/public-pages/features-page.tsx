'use client';

import { useId, useState } from 'react';
import {
  BarChart3,
  Bot,
  ChevronDown,
  Download,
  Globe,
  RefreshCw,
  Search,
  ShieldCheck,
  Target,
  TrendingUp,
  Zap,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { AnimateInView } from './shared';

const coreFeatures = [
  {
    icon: BarChart3,
    title: 'Runway & Safe-to-Spend',
    description: 'Dynamic calculation of how much money you can spend today without compromising upcoming obligations or monthly savings targets.',
    color: '#7585F8',
    bgColor: 'rgba(117,133,248,0.1)',
    span: 'lg:col-span-2 lg:row-span-2',
    featured: true,
  },
  {
    icon: Bot,
    title: 'Smart Categorization',
    description: 'Rule-based and inferred categories for fast, consistent transaction logging.',
    color: '#A855F7',
    bgColor: 'rgba(168,85,247,0.1)',
    span: 'lg:col-span-1',
    featured: false,
  },
  {
    icon: Target,
    title: 'Cadence Budgeting',
    description: 'Set monthly limits with visual utilization gauges and threshold pacing alerts.',
    color: '#37C98C',
    bgColor: 'rgba(55,201,140,0.1)',
    span: 'lg:col-span-1',
    featured: false,
  },
  {
    icon: ShieldCheck,
    title: 'Privacy by Design',
    description: 'Only period-level summaries are ever processed. Raw merchant descriptions remain private.',
    color: '#3B82F6',
    bgColor: 'rgba(59,130,246,0.1)',
    span: 'lg:col-span-1',
    featured: false,
  },
  {
    icon: Zap,
    title: 'Optimistic Updates',
    description: 'Instant UI feedback with server-side mutation tokens and automated replay prevention.',
    color: '#F0B66A',
    bgColor: 'rgba(240,182,106,0.1)',
    span: 'lg:col-span-1',
    featured: false,
  },
  {
    icon: Globe,
    title: 'Multi-Currency Support',
    description: 'Configurable default currency preferences with strict tabular numeral formatting.',
    color: '#F16F6F',
    bgColor: 'rgba(241,111,111,0.1)',
    span: 'lg:col-span-2',
    featured: false,
  },
];

const detailedFeatures = [
  {
    icon: TrendingUp,
    title: 'Cash Flow Projection',
    description: 'Forward-looking cash flow forecast evaluating income intervals against scheduled bills.',
    color: '#7585F8',
    bgColor: 'rgba(117,133,248,0.1)',
  },
  {
    icon: RefreshCw,
    title: 'Recurring Transaction Engine',
    description: 'Schedule daily, weekly, monthly, or yearly items with automated cron processing.',
    color: '#37C98C',
    bgColor: 'rgba(55,201,140,0.1)',
  },
  {
    icon: Search,
    title: 'Command Palette & Filters',
    description: 'Keyboard navigation with ⌘K palette, cursor pagination, and instant full-text search.',
    color: '#A855F7',
    bgColor: 'rgba(168,85,247,0.1)',
  },
  {
    icon: Download,
    title: 'CSV Import & Export',
    description: 'Full data portability with column mapping previews and raw ledger exports.',
    color: '#3B82F6',
    bgColor: 'rgba(59,130,246,0.1)',
  },
  {
    icon: Target,
    title: 'Savings Milestones',
    description: 'Goal deadline countdowns with monthly contribution recommendations.',
    color: '#F0B66A',
    bgColor: 'rgba(240,182,106,0.1)',
  },
  {
    icon: ShieldCheck,
    title: 'Session & Audit Security',
    description: 'Server session hashing, bcrypt authentication, and secure HTTP cookies.',
    color: '#F16F6F',
    bgColor: 'rgba(241,111,111,0.1)',
  },
];

const faqs = [
  {
    question: 'How is the Safe-to-Spend runway calculated?',
    answer: 'It starts with your current balance, deducts remaining budget allocations, upcoming recurring bills, and goal contributions for the period, then divides the remainder across the remaining days.',
  },
  {
    question: 'What data is shared with AI features?',
    answer: 'Only anonymized, period-level numeric totals and category sums. Individual transaction notes, timestamps, and merchant names are never sent to external language models.',
  },
  {
    question: 'Can I import existing records from other apps?',
    answer: 'Yes. You can import standard CSV files directly from the Transactions page with an intuitive column mapping step.',
  },
  {
    question: 'Are my financial records private?',
    answer: 'Yes. All data is scoped strictly to your authenticated account ID, secured with hashed session tokens and encrypted at rest in PostgreSQL.',
  },
];

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-bg-base py-16 sm:py-24 border-b border-white/[0.06]">
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <AnimateInView>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-medium text-text-secondary">
            Product Capabilities
          </span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Built for accuracy, speed, and privacy.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-text-secondary leading-relaxed">
            A comprehensive suite of tools designed to give you verifiable financial clarity with zero unnecessary complexity.
          </p>
        </AnimateInView>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/sign-up"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-xs font-semibold text-color-text-inverse transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.99]"
          >
            Get started free
            <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-5 text-xs font-medium text-white transition-colors hover:border-white/20 hover:bg-white/[0.06] active:scale-[0.99]"
          >
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}

function CoreFeaturesSection() {
  return (
    <section className="relative overflow-hidden bg-bg-base py-16 sm:py-20 border-b border-white/[0.06]">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <AnimateInView className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Core Architecture
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-text-secondary">
            Everyday ledger utilities engineered for precision.
          </p>
        </AnimateInView>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(180px,auto)]">
          {coreFeatures.map((feature, index) => (
            <AnimateInView key={feature.title} delay={index * 0.05} className={feature.span}>
              <div className="group relative flex h-full flex-col rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 transition-colors hover:border-white/[0.14]">
                <div
                  className="flex size-10 items-center justify-center rounded-lg border border-white/[0.08]"
                  style={{ backgroundColor: feature.bgColor }}
                >
                  <feature.icon size={20} style={{ color: feature.color }} />
                </div>

                <h3 className="mt-4 text-base font-semibold text-white">{feature.title}</h3>
                <p className="mt-1.5 flex-1 text-xs leading-relaxed text-text-secondary">{feature.description}</p>

                {feature.featured && (
                  <div className="mt-5 rounded-lg border border-white/[0.06] bg-black/40 p-3.5">
                    <div className="flex items-center justify-between text-xs font-medium text-text-tertiary">
                      <span>Monthly Runway</span>
                      <span className="text-emerald-400 font-semibold font-mono">₹16,790 safe</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-text-tertiary">
                      <span>Pacing Allowance</span>
                      <span className="font-mono text-white">₹1,399 / day</span>
                    </div>
                  </div>
                )}
              </div>
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  );
}

function DetailedFeaturesSection() {
  return (
    <section className="relative overflow-hidden bg-bg-base py-16 sm:py-20 border-b border-white/[0.06]">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <AnimateInView className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Advanced Tooling
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-text-secondary">
            Deep analytics and workflow automations to stay ahead of your finances.
          </p>
        </AnimateInView>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {detailedFeatures.map((feature, index) => (
            <AnimateInView key={feature.title} delay={index * 0.05}>
              <div className="group rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 transition-colors hover:border-white/[0.14]">
                <div
                  className="flex size-10 items-center justify-center rounded-lg border border-white/[0.08]"
                  style={{ backgroundColor: feature.bgColor }}
                >
                  <feature.icon size={20} style={{ color: feature.color }} />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-white">{feature.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">{feature.description}</p>
              </div>
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  const baseId = useId();

  return (
    <section className="relative overflow-hidden bg-bg-base py-16 sm:py-20">
      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <AnimateInView className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Frequently Asked Questions
          </h2>
        </AnimateInView>

        <div className="mt-10 space-y-3">
          {faqs.map((faq, index) => {
            const id = `${baseId}-${index}`;
            const expanded = open === index;
            return (
              <AnimateInView key={faq.question} delay={index * 0.05}>
                <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] transition-colors hover:border-white/[0.14]">
                  <h3>
                    <button
                      aria-controls={id}
                      aria-expanded={expanded}
                      className="flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left text-xs sm:text-sm font-semibold text-white transition-colors"
                      onClick={() => setOpen(expanded ? null : index)}
                      type="button"
                    >
                      {faq.question}
                      <ChevronDown
                        size={16}
                        className={`shrink-0 text-text-tertiary transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </h3>
                  {expanded && (
                    <div id={id} className="border-t border-white/[0.04] px-5 py-3 bg-white/[0.01]">
                      <p className="text-xs leading-relaxed text-text-secondary">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              </AnimateInView>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function FeaturesPageContent() {
  return (
    <main className="min-h-screen bg-bg-base">
      <HeroSection />
      <CoreFeaturesSection />
      <DetailedFeaturesSection />
      <FaqSection />
    </main>
  );
}
