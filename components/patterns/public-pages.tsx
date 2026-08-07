'use client';

import { useId, useState } from 'react';
import { motion } from 'motion/react';
import {
  BarChart3,
  Brain,
  Target,
  Shield,
  Zap,
  Globe,
  TrendingUp,
  Bell,
  Search,
  Download,
  RefreshCw,
  ChevronDown,
  ArrowRight,
  Mail,
  Clock,
  HelpCircle,
  Lock,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { LinkButton, SectionHeader } from '@/components/ui';

/* ────────────────────────────────────────────────────────────
   ANIMATION WRAPPER
   ──────────────────────────────────────────────────────────── */

function AnimateInView({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   FEATURE DATA
   ──────────────────────────────────────────────────────────── */

const coreFeatures = [
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    description: 'Beautiful charts and insights that help you understand where your money goes.',
    color: '#36ADA3',
    bgColor: 'rgba(54,173,163,0.08)',
    span: 'lg:col-span-2 lg:row-span-2',
    featured: true,
  },
  {
    icon: Brain,
    title: 'AI Categorization',
    description: 'Automatically categorize transactions with AI-powered suggestions.',
    color: '#2F578A',
    bgColor: 'rgba(47,87,138,0.08)',
    span: 'lg:col-span-1',
    featured: false,
  },
  {
    icon: Target,
    title: 'Budget Tracking',
    description: 'Set budgets and track progress with real-time alerts.',
    color: '#22C55E',
    bgColor: 'rgba(34,197,94,0.08)',
    span: 'lg:col-span-1',
    featured: false,
  },
  {
    icon: Shield,
    title: 'Bank-Grade Security',
    description: 'Your data is encrypted and secure. We never sell your information.',
    color: '#6E9BE3',
    bgColor: 'rgba(110,155,227,0.08)',
    span: 'lg:col-span-1',
    featured: false,
  },
  {
    icon: Zap,
    title: 'Instant Sync',
    description: 'Real-time updates across all your devices. Always up to date.',
    color: '#F5A623',
    bgColor: 'rgba(245,166,35,0.08)',
    span: 'lg:col-span-1',
    featured: false,
  },
  {
    icon: Globe,
    title: 'Multi-Currency',
    description: 'Track expenses in multiple currencies with automatic conversion.',
    color: '#F04438',
    bgColor: 'rgba(240,68,56,0.08)',
    span: 'lg:col-span-2',
    featured: false,
  },
];

const detailedFeatures = [
  {
    icon: TrendingUp,
    title: 'Spending Forecasts',
    description: 'AI predicts your monthly spending based on historical patterns, helping you plan ahead.',
    color: '#36ADA3',
    bgColor: 'rgba(54,173,163,0.08)',
  },
  {
    icon: Bell,
    title: 'Anomaly Detection',
    description: 'Get alerted to unusual spending patterns before they become problems.',
    color: '#2F578A',
    bgColor: 'rgba(47,87,138,0.08)',
  },
  {
    icon: Search,
    title: 'Smart Search',
    description: 'Find any transaction instantly with powerful filters and search.',
    color: '#22C55E',
    bgColor: 'rgba(34,197,94,0.08)',
  },
  {
    icon: Download,
    title: 'CSV Export',
    description: 'Export your data anytime for accounting or personal records.',
    color: '#2F578A',
    bgColor: 'rgba(110,155,227,0.08)',
  },
  {
    icon: RefreshCw,
    title: 'Recurring Transactions',
    description: 'Automate regular income and expense tracking with recurring entries.',
    color: '#F5A623',
    bgColor: 'rgba(245,166,35,0.08)',
  },
  {
    icon: Target,
    title: 'Savings Goals',
    description: 'Set financial goals and track your progress with visual indicators.',
    color: '#F04438',
    bgColor: 'rgba(240,68,56,0.08)',
  },
];

const stats = [
  { value: '10K+', label: 'Transactions tracked' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9/5', label: 'User rating' },
  { value: '100%', label: 'Free to use' },
];

const faqs = [
  {
    question: 'How does AI categorization work?',
    answer: 'Our AI analyzes your transaction descriptions and automatically suggests the most relevant category. You can accept, modify, or override any suggestion.',
  },
  {
    question: 'Is my financial data secure?',
    answer: 'Yes. We use bank-grade encryption and never share your data with third parties. Your information is stored securely and only accessible by you.',
  },
  {
    question: 'Can I track multiple currencies?',
    answer: 'Absolutely. Expense AI supports 10+ currencies with automatic conversion based on real-time exchange rates.',
  },
  {
    question: 'How does spending forecasting work?',
    answer: 'Our AI analyzes your historical spending patterns and uses weighted moving averages to predict future expenses, helping you plan your budget.',
  },
  {
    question: 'What happens if I exceed my budget?',
    answer: 'You\'ll receive real-time alerts when you\'re approaching or exceeding your budget limits, giving you time to adjust your spending.',
  },
];

/* ────────────────────────────────────────────────────────────
   HERO SECTION
   ──────────────────────────────────────────────────────────── */

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#121358] py-24 sm:py-32">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#36ADA3]/[0.03] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <AnimateInView className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#36ADA3]/20 bg-[#36ADA3]/[0.08] px-4 py-1.5 text-xs font-semibold text-[#36ADA3]">
            Features
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Everything you need to
            <br />
            <span className="bg-gradient-to-r from-[#36ADA3] via-[#2F578A] to-[#22C55E] bg-clip-text text-transparent">
              master your finances
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[#A9B4CF]">
            Powerful tools designed to give you clarity and control over your money.
            Track smarter, spend wiser.
          </p>
        </AnimateInView>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/sign-up"
            className="group flex items-center gap-2.5 rounded-xl bg-[#36ADA3] px-7 py-3.5 text-sm font-semibold text-[#121358] transition-all duration-300 hover:shadow-[0_0_30px_rgba(54,173,163,0.4)] hover:scale-[1.03] active:scale-[0.97]"
          >
            Get started free
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/"
            className="group flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 active:scale-[0.97]"
          >
            Back to home
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   CORE FEATURES GRID
   ──────────────────────────────────────────────────────────── */

function CoreFeaturesSection() {
  return (
    <section className="relative overflow-hidden bg-[#121358] py-24 sm:py-32">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <AnimateInView className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#2F578A]/20 bg-[#2F578A]/[0.08] px-4 py-1.5 text-xs font-semibold text-[#2F578A]">
            Core Features
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Built for what matters
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#A9B4CF]">
            Essential tools for tracking, analyzing, and understanding your finances.
          </p>
        </AnimateInView>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(180px,auto)]">
          {coreFeatures.map((feature, index) => (
            <AnimateInView key={feature.title} delay={index * 0.08} className={feature.span}>
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="group relative h-full overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.04] hover:shadow-[0_0_40px_rgba(54,173,163,0.06)]"
              >
                <div
                  className="pointer-events-none absolute -inset-1 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
                  style={{ backgroundColor: feature.bgColor }}
                />

                <div className="relative z-10 flex h-full flex-col">
                  <div
                    className="flex size-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: feature.bgColor }}
                  >
                    <feature.icon size={24} style={{ color: feature.color }} />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#A9B4CF]">{feature.description}</p>

                  {feature.featured && (
                    <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <div className="flex items-center justify-between text-xs text-[#A9B4CF]/60">
                        <span>This month</span>
                        <span className="text-[#36ADA3]">+24% savings</span>
                      </div>
                      <div className="mt-3 flex items-end gap-1 h-12">
                        {[30, 45, 35, 60, 50, 70, 85, 65, 75, 90, 55, 95].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t-sm bg-gradient-to-t from-[#36ADA3]/20 to-[#36ADA3]/60"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   DETAILED FEATURES
   ──────────────────────────────────────────────────────────── */

function DetailedFeaturesSection() {
  return (
    <section className="relative overflow-hidden border-y border-white/[0.06] bg-[#0D1145] py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-[#2F578A]/[0.03] blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <AnimateInView className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#22C55E]/20 bg-[#22C55E]/[0.08] px-4 py-1.5 text-xs font-semibold text-[#22C55E]">
            Advanced Tools
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Go beyond basic tracking
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#A9B4CF]">
            Advanced features that help you understand, predict, and optimize your finances.
          </p>
        </AnimateInView>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {detailedFeatures.map((feature, index) => (
            <AnimateInView key={feature.title} delay={index * 0.08}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]"
              >
                <div
                  className="flex size-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: feature.bgColor }}
                >
                  <feature.icon size={24} style={{ color: feature.color }} />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#A9B4CF]">{feature.description}</p>
              </motion.div>
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   STATS SECTION
   ──────────────────────────────────────────────────────────── */

function StatsSection() {
  return (
    <section className="relative overflow-hidden bg-[#121358] py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <AnimateInView key={stat.label} delay={index * 0.1}>
              <div className="text-center">
                <p className="text-4xl font-bold text-white">{stat.value}</p>
                <p className="mt-2 text-sm text-[#A9B4CF]">{stat.label}</p>
              </div>
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   FAQ SECTION
   ──────────────────────────────────────────────────────────── */

function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  const baseId = useId();

  return (
    <section className="relative overflow-hidden bg-[#121358] py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 bottom-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-[#36ADA3]/[0.02] blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <AnimateInView className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 text-xs font-semibold text-[#A9B4CF]">
            FAQ
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Frequently asked questions
          </h2>
        </AnimateInView>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, index) => {
            const id = `${baseId}-${index}`;
            const expanded = open === index;
            return (
              <AnimateInView key={faq.question} delay={index * 0.05}>
                <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] transition-all duration-300 hover:border-white/[0.12]">
                  <h3>
                    <button
                      aria-controls={id}
                      aria-expanded={expanded}
                      className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left text-sm font-semibold text-white transition-colors hover:bg-white/[0.02]"
                      onClick={() => setOpen(expanded ? null : index)}
                      type="button"
                    >
                      {faq.question}
                      <ChevronDown
                        size={18}
                        className={`shrink-0 text-[#A9B4CF] transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </h3>
                  <div
                    id={id}
                    role="region"
                    aria-labelledby={`faq-${index}`}
                    className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-40' : 'max-h-0'}`}
                  >
                    <p className="px-6 pb-4 text-sm leading-relaxed text-[#A9B4CF]">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </AnimateInView>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   CTA SECTION
   ──────────────────────────────────────────────────────────── */

function CtaSection() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.06] bg-[#0D1145] py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#36ADA3]/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <AnimateInView>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Start tracking smarter today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#A9B4CF]">
            Join thousands of users who understand their finances better with Expense AI.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/sign-up"
              className="group flex items-center gap-2.5 rounded-xl bg-[#36ADA3] px-8 py-4 text-sm font-semibold text-[#121358] transition-all duration-300 hover:shadow-[0_0_30px_rgba(54,173,163,0.4)] hover:scale-[1.03] active:scale-[0.97]"
            >
              Get started free
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/"
              className="group flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 active:scale-[0.97]"
            >
              Back to home
            </Link>
          </div>
          <p className="mt-6 text-xs text-[#A9B4CF]/60">No credit card required. Free forever.</p>
        </AnimateInView>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   MAIN PAGE
   ──────────────────────────────────────────────────────────── */

export function FeaturesPageContent() {
  return (
    <main className="min-h-screen bg-[#121358]">
      <HeroSection />
      <CoreFeaturesSection />
      <DetailedFeaturesSection />
      <StatsSection />
      <FaqSection />
      <CtaSection />
    </main>
  );
}

/* ────────────────────────────────────────────────────────────
   OTHER PAGES - SHARED HELPERS
   ──────────────────────────────────────────────────────────── */

const pageClass = 'content-frame py-12 sm:py-16 lg:py-20';

function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <header className="max-w-3xl">
      <p className="text-interface-sm font-semibold text-primary">{eyebrow}</p>
      <h1 className="mt-3 text-display-lg font-semibold text-foreground">{title}</h1>
      <div className="mt-4 text-interface-md text-foreground-secondary">{children}</div>
    </header>
  );
}

function Actions({ primary = 'Create an account' }: { primary?: string }) {
  return (
    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
      <LinkButton href="/sign-up" label={primary} />
      <LinkButton href="/features" intent="secondary" label="Explore features" />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   OTHER PAGES
   ──────────────────────────────────────────────────────────── */

export function LandingPageContent() {
  return (
    <main>
      <section className="public-hero border-b border-border">
        <div className={pageClass}>
          <PageIntro eyebrow="Expense AI" title="Understand the financial records you create.">
            <p>Record transactions, review reporting periods, and use optional AI assistance to explore patterns in your recorded data.</p>
          </PageIntro>
          <Actions />
        </div>
      </section>
      <section aria-labelledby="product-evidence">
        <div className={pageClass}>
          <SectionHeader title="Product evidence" description="The interface below is an illustrative product example, not live account data." />
          <div className="rounded-xl bg-card p-4 text-sm ring-1 ring-foreground/10 mt-8 bg-surface-subtle">
            <div className="grid gap-4 sm:grid-cols-3">
              {['Recorded spending', 'Category distribution', 'AI insight label'].map((label) => (
                <div className="rounded-control border border-border bg-surface p-4" key={label}>
                  <p className="text-interface-xs text-foreground-secondary">Illustrative interface</p>
                  <p className="mt-2 font-semibold">{label}</p>
                </div>
              ))}
            </div>
            <figcaption className="mt-4 text-interface-sm text-foreground-secondary">
              Example dashboard elements reflect the available transaction, chart, and optional AI features.
            </figcaption>
          </div>
        </div>
      </section>
    </main>
  );
}

export function AboutPageContent() {
  return (
    <main className="min-h-screen bg-[#121358]">
      {/* Hero — editorial style, minimal */}
      <section className="relative overflow-hidden py-32 sm:py-40">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#36ADA3]/[0.03] blur-[150px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <AnimateInView>
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
              We believe finance
              <br />
              should be{' '}
              <span className="bg-gradient-to-r from-[#36ADA3] to-[#2F578A] bg-clip-text text-transparent">
                clear
              </span>
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-[#A9B4CF]">
              Expense AI exists to make financial tracking simple, private, and accessible.
              No complexity. No hidden agendas. Just clarity.
            </p>
          </AnimateInView>
        </div>
      </section>

      {/* Stats — large, minimal */}
      <section className="relative border-y border-white/[0.06] bg-[#0D1145] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {[
              { value: '10K+', label: 'Transactions' },
              { value: '99.9%', label: 'Uptime' },
              { value: '100%', label: 'Free forever' },
              { value: '0', label: 'Data sold' },
            ].map((stat, index) => (
              <AnimateInView key={stat.label} delay={index * 0.1}>
                <div className="text-center">
                  <p className="text-5xl font-bold tracking-tight text-white sm:text-6xl">{stat.value}</p>
                  <p className="mt-3 text-sm font-medium uppercase tracking-wider text-[#A9B4CF]/60">{stat.label}</p>
                </div>
              </AnimateInView>
            ))}
          </div>
        </div>
      </section>

      {/* Story — split layout, editorial */}
      <section className="relative overflow-hidden bg-[#121358] py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[#2F578A]/[0.03] blur-[120px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-16 lg:grid-cols-2">
            <AnimateInView>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#2F578A]">Our Story</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Why we built this
              </h2>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-[#A9B4CF]">
                <p>
                  Most expense trackers are either too simple or too complicated.
                  We wanted something in between — powerful enough for real financial
                  insight, but simple enough to use every day.
                </p>
                <p>
                  So we built Expense AI. A clean workspace where you record transactions,
                  and our AI handles the rest — categorizing, forecasting, and flagging
                  unusual patterns before they become problems.
                </p>
                <p>
                  Optional AI features are clearly labeled. Your data stays yours.
                  And the core product is free, because understanding your money
                  shouldn&apos;t cost money.
                </p>
              </div>
            </AnimateInView>

            <AnimateInView delay={0.15}>
              <div className="space-y-4">
                {[
                  {
                    step: '01',
                    title: 'Record',
                    desc: 'Add income and expenses with dates, amounts, and categories.',
                  },
                  {
                    step: '02',
                    title: 'Analyze',
                    desc: 'AI categorizes transactions and reveals spending patterns.',
                  },
                  {
                    step: '03',
                    title: 'Predict',
                    desc: 'Forecasts and anomaly detection help you stay ahead.',
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]"
                  >
                    <span className="text-xs font-semibold text-[#36ADA3]/60">{item.step}</span>
                    <h3 className="mt-2 text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-1 text-sm text-[#A9B4CF]">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </AnimateInView>
          </div>
        </div>
      </section>

      {/* Principles — minimal grid */}
      <section className="relative border-y border-white/[0.06] bg-[#0D1145] py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <AnimateInView className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#36ADA3]/60">Principles</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              What guides us
            </h2>
          </AnimateInView>

          <div className="mt-16 grid gap-px sm:grid-cols-2 lg:grid-cols-3 bg-white/[0.04] rounded-2xl overflow-hidden">
            {[
              {
                icon: Shield,
                title: 'Privacy',
                desc: 'Your data stays yours. Always.',
                color: '#2F578A',
              },
              {
                icon: Brain,
                title: 'Transparency',
                desc: 'AI is optional and clearly explained.',
                color: '#2F578A',
              },
              {
                icon: Target,
                title: 'Simplicity',
                desc: 'Complex ideas, simple execution.',
                color: '#22C55E',
              },
              {
                icon: Zap,
                title: 'Speed',
                desc: 'Instant sync across all devices.',
                color: '#F5A623',
              },
              {
                icon: Globe,
                title: 'Accessibility',
                desc: 'Free for everyone. No exceptions.',
                color: '#F04438',
              },
              {
                icon: BarChart3,
                title: 'Clarity',
                desc: 'Beautiful visuals, actionable data.',
                color: '#36ADA3',
              },
            ].map((p, index) => (
              <AnimateInView key={p.title} delay={index * 0.06}>
                <div className="group bg-[#121358] p-8 transition-colors duration-300 hover:bg-white/[0.02]">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-white/[0.04]">
                    <p.icon size={20} style={{ color: p.color }} />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-white">{p.title}</h3>
                  <p className="mt-1 text-sm text-[#A9B4CF]">{p.desc}</p>
                </div>
              </AnimateInView>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-[#121358] py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#36ADA3]/[0.04] blur-[120px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <AnimateInView>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Start with clarity
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[#A9B4CF]">
              Join thousands who track smarter with Expense AI.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className="group flex items-center gap-2.5 rounded-xl bg-[#36ADA3] px-8 py-4 text-sm font-semibold text-[#121358] transition-all duration-300 hover:shadow-[0_0_30px_rgba(54,173,163,0.4)] hover:scale-[1.03] active:scale-[0.97]"
              >
                Get started free
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/"
                className="group flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 active:scale-[0.97]"
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

export function ContactPageContent() {
  return (
    <main className="min-h-screen bg-[#121358]">
      {/* Hero */}
      <section className="relative overflow-hidden py-32 sm:py-40">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#36ADA3]/[0.03] blur-[150px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <AnimateInView>
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
              Get in touch
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-[#A9B4CF]">
              Have a question, need support, or want to share feedback?
              We&apos;d love to hear from you.
            </p>
          </AnimateInView>
        </div>
      </section>

      {/* Contact Options */}
      <section className="relative border-y border-white/[0.06] bg-[#0D1145] py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Mail,
                title: 'Email',
                description: 'For account, product, or accessibility questions',
                action: 'deepakkandpal.tech@gmail.com',
                href: 'mailto:deepakkandpal.tech@gmail.com',
                color: '#36ADA3',
                bgColor: 'rgba(54,173,163,0.08)',
              },
              {
                icon: Mail,
                title: 'Email',
                description: 'For partnerships or business inquiries',
                action: 'deepakkandpal.work@gmail.com',
                href: 'mailto:deepakkandpal.work@gmail.com',
                color: '#2F578A',
                bgColor: 'rgba(47,87,138,0.08)',
              },
              {
                icon: Clock,
                title: 'Support Hours',
                description: 'When our team is available',
                action: 'Mon–Fri, 9AM–6PM PST',
                href: '#',
                color: '#22C55E',
                bgColor: 'rgba(34,197,94,0.08)',
              },
            ].map((item, index) => (
              <AnimateInView key={item.title} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]"
                >
                  <div
                    className="pointer-events-none absolute -inset-1 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
                    style={{ backgroundColor: item.bgColor }}
                  />
                  <div className="relative z-10">
                    <div
                      className="flex size-12 items-center justify-center rounded-xl"
                      style={{ backgroundColor: item.bgColor }}
                    >
                      <item.icon size={24} style={{ color: item.color }} />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm text-[#A9B4CF]">{item.description}</p>
                    <a
                      href={item.href}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200 hover:opacity-80"
                      style={{ color: item.color }}
                    >
                      {item.action}
                      <ArrowRight size={14} />
                    </a>
                  </div>
                </motion.div>
              </AnimateInView>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="relative overflow-hidden bg-[#121358] py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-[#2F578A]/[0.03] blur-[100px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <AnimateInView className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#2F578A]/60">Resources</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Find answers fast
            </h2>
          </AnimateInView>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: HelpCircle,
                title: 'FAQ',
                description: 'Answers to common questions about Expense AI.',
                href: '/features',
                color: '#36ADA3',
              },
              {
                icon: Shield,
                title: 'AI Transparency',
                description: 'Learn how our AI features use your data.',
                href: '/ai-transparency',
                color: '#2F578A',
              },
              {
                icon: Lock,
                title: 'Privacy Policy',
                description: 'How we protect and handle your information.',
                href: '/privacy',
                color: '#22C55E',
              },
              {
                icon: FileText,
                title: 'Features',
                description: 'Explore everything Expense AI can do.',
                href: '/features',
                color: '#F5A623',
              },
            ].map((item, index) => (
              <AnimateInView key={item.title} delay={index * 0.08}>
                <Link
                  href={item.href}
                  className="group flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]"
                >
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <item.icon size={20} style={{ color: item.color }} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white group-hover:text-[#36ADA3] transition-colors duration-200">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#A9B4CF]">{item.description}</p>
                  </div>
                </Link>
              </AnimateInView>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-white/[0.06] bg-[#0D1145] py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#36ADA3]/[0.04] blur-[120px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <AnimateInView>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[#A9B4CF]">
              Join thousands who track smarter with Expense AI.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className="group flex items-center gap-2.5 rounded-xl bg-[#36ADA3] px-8 py-4 text-sm font-semibold text-[#121358] transition-all duration-300 hover:shadow-[0_0_30px_rgba(54,173,163,0.4)] hover:scale-[1.03] active:scale-[0.97]"
              >
                Get started free
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/"
                className="group flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 active:scale-[0.97]"
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

export function PrivacyPageContent() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#36ADA3]/[0.04] blur-[120px]" />
        </div>
        <div className="content-frame relative py-16 sm:py-24 lg:py-32">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#36ADA3]/20 bg-[#36ADA3]/[0.08] px-3 py-1 text-[11px] font-semibold text-[#36ADA3] uppercase tracking-wider">
              Privacy
            </span>
            <h1 className="mt-6 text-[clamp(2rem,5vw,3.5rem)] font-bold text-white tracking-tight leading-[1.1]">
              Your data stays yours.
            </h1>
            <p className="mt-5 text-lg text-[#A9B4CF] max-w-lg mx-auto leading-relaxed">
              We collect only what&apos;s needed to power your expense tracking. Nothing more.
            </p>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="content-frame py-16 sm:py-20">
        <div className="max-w-2xl mx-auto space-y-10">
          <PrivacyItem
            icon={<ShieldIcon />}
            title="Minimal collection"
            description="We store only your account credentials and transaction records required to run the app."
          />
          <PrivacyItem
            icon={<LockIcon />}
            title="Encrypted at rest"
            description="All data is encrypted in our database. Authentication is handled by a trusted third-party provider."
          />
          <PrivacyItem
            icon={<EyeOffIcon />}
            title="No third-party sharing"
            description="Your financial data is never shared, sold, or used for advertising."
          />
          <PrivacyItem
            icon={<TrashIcon />}
            title="Delete anytime"
            description="Remove your account and all data is permanently deleted. No hidden retention."
          />
        </div>
      </section>

      {/* What we store */}
      <section className="content-frame border-t border-white/5 py-16 sm:py-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-8 text-center">What we store</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <DataCard label="Account" items={["Email address", "Display name", "Password hash"]} />
            <DataCard label="Transactions" items={["Amount & currency", "Category & date", "Description"]} />
            <DataCard label="Preferences" items={["Theme setting", "Currency preference", "Budget limits"]} />
            <DataCard label="AI requests" items={["Aggregated totals only", "No raw descriptions", "Period-scoped"]} />
          </div>
        </div>
      </section>

      {/* Footer note */}
      <section className="content-frame border-t border-white/5 py-12 sm:py-16">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-[#A9B4CF]">
            Questions? Contact us at{' '}
            <span className="text-[#36ADA3]">privacy@expenseai.app</span>
          </p>
        </div>
      </section>
    </main>
  );
}

function PrivacyItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-[#36ADA3] border border-white/[0.06]">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-[#A9B4CF] leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function DataCard({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <p className="text-[11px] font-semibold text-[#36ADA3] uppercase tracking-wider mb-3">{label}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-[#A9B4CF]">
            <span className="h-1 w-1 rounded-full bg-[#A9B4CF]/40" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

export function AiTransparencyPageContent() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#2F578A]/[0.04] blur-[120px]" />
        </div>
        <div className="content-frame relative py-16 sm:py-24 lg:py-32">
          <div className="max-w-2xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#2F578A]/20 bg-[#2F578A]/[0.08] px-3 py-1 text-[11px] font-semibold text-[#2F578A] uppercase tracking-wider">
              AI Transparency
            </span>
            <h1 className="mt-6 text-[clamp(2rem,5vw,3.5rem)] font-bold text-white tracking-tight leading-[1.1]">
              How AI uses your data.
            </h1>
            <p className="mt-5 text-lg text-[#A9B4CF] max-w-lg mx-auto leading-relaxed">
              AI features are optional. When enabled, we send only aggregated totals — never raw descriptions or IDs.
            </p>
          </div>
        </div>
      </section>

      {/* Key points */}
      <section className="content-frame py-16 sm:py-20">
        <div className="max-w-2xl mx-auto space-y-10">
          <AiItem
            icon={<BrainIcon />}
            title="What AI does"
            description="Generates category suggestions and spending interpretations for the reporting period you select."
          />
          <AiItem
            icon={<FilterIcon />}
            title="What we send"
            description="Period dates, currency, transaction count, income, spending, balance, and category totals."
          />
          <AiItem
            icon={<ShieldIcon />}
            title="What we never send"
            description="Raw transaction descriptions, account IDs, timestamps, or any personally identifiable information."
          />
        </div>
      </section>

      {/* Disclosure table */}
      <section className="content-frame border-t border-white/5 py-16 sm:py-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-8 text-center">Data disclosure</h2>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <div className="grid grid-cols-2 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="px-5 py-3 text-[11px] font-semibold text-[#A9B4CF] uppercase tracking-wider">Field</div>
              <div className="px-5 py-3 text-[11px] font-semibold text-[#A9B4CF] uppercase tracking-wider">Status</div>
            </div>
            <DisclosureRow field="Period dates" included />
            <DisclosureRow field="Currency" included />
            <DisclosureRow field="Transaction count" included />
            <DisclosureRow field="Income & spending totals" included />
            <DisclosureRow field="Category breakdown" included />
            <DisclosureRow field="Transaction descriptions" included={false} />
            <DisclosureRow field="Account IDs" included={false} />
            <DisclosureRow field="Timestamps" included={false} />
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="content-frame border-t border-white/5 py-12 sm:py-16">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-[#A9B4CF] leading-relaxed">
            AI-generated insights are informational only and are not professional financial advice. Provider retention behavior has not been verified.
          </p>
        </div>
      </section>
    </main>
  );
}

function AiItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-[#2F578A] border border-white/[0.06]">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-[#A9B4CF] leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function DisclosureRow({ field, included }: { field: string; included: boolean }) {
  return (
    <div className="grid grid-cols-2 border-b border-white/[0.06] last:border-b-0">
      <div className="px-5 py-3.5 text-sm text-white">{field}</div>
      <div className="px-5 py-3.5">
        {included ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#22C55E]/10 px-2.5 py-1 text-[11px] font-medium text-[#22C55E]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
            Included
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F04438]/10 px-2.5 py-1 text-[11px] font-medium text-[#F04438]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F04438]" />
            Excluded
          </span>
        )}
      </div>
    </div>
  );
}

function BrainIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A5.5 5.5 0 004 7.5c0 1.58.67 3 1.74 4.01L4 14l3-1c.78.82 1.87 1.34 3.07 1.37A5.5 5.5 0 0018 9.5 5.5 5.5 0 0012.5 4c-.52 0-1.02.08-1.5.23" />
      <path d="M12 2v20" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}
