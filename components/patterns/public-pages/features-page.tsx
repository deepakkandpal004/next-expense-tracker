'use client';

import { useId, useState } from 'react';
import { motion } from 'motion/react';
import {
  BarChart3,
  Bell,
  Brain,
  ChevronDown,
  Download,
  Globe,
  RefreshCw,
  Search,
  Shield,
  Target,
  TrendingUp,
  Zap,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { AnimateInView } from './shared';

/* ────────────────────────────────────────────────────────────
   FEATURE DATA
   ──────────────────────────────────────────────────────────── */

const coreFeatures = [
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    description: 'Beautiful charts and insights that help you understand where your money goes.',
    color: '#00DCE5',
    bgColor: 'rgba(0,220,229,0.08)',
    span: 'lg:col-span-2 lg:row-span-2',
    featured: true,
  },
  {
    icon: Brain,
    title: 'AI Categorization',
    description: 'Automatically categorize transactions with AI-powered suggestions.',
    color: '#A855F7',
    bgColor: 'rgba(168,85,247,0.08)',
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
    color: '#3B82F6',
    bgColor: 'rgba(59,130,246,0.08)',
    span: 'lg:col-span-1',
    featured: false,
  },
  {
    icon: Zap,
    title: 'Instant Sync',
    description: 'Real-time updates across all your devices. Always up to date.',
    color: '#FBBF24',
    bgColor: 'rgba(251,191,36,0.08)',
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
    color: '#00DCE5',
    bgColor: 'rgba(0,220,229,0.08)',
  },
  {
    icon: Bell,
    title: 'Anomaly Detection',
    description: 'Get alerted to unusual spending patterns before they become problems.',
    color: '#A855F7',
    bgColor: 'rgba(168,85,247,0.08)',
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
    color: '#3B82F6',
    bgColor: 'rgba(59,130,246,0.08)',
  },
  {
    icon: RefreshCw,
    title: 'Recurring Transactions',
    description: 'Automate regular income and expense tracking with recurring entries.',
    color: '#FBBF24',
    bgColor: 'rgba(251,191,36,0.08)',
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
    answer: 'Absolutely. Expense Tracker AI supports 10+ currencies with automatic conversion based on real-time exchange rates.',
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
    <section className="relative overflow-hidden bg-[#0B0F14] py-24 sm:py-32">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#00DCE5]/[0.03] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <AnimateInView className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#00DCE5]/20 bg-[#00DCE5]/[0.08] px-4 py-1.5 font-medium text-xs tracking-wider text-[#00DCE5]">
            Features
          </span>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white sm:text-6xl md:text-7xl">
            Everything you need to
            <br />
            <span className="bg-gradient-to-r from-[#00DCE5] via-[#A855F7] to-[#22C55E] bg-clip-text text-transparent">
              master your finances
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[#9AA3AF]">
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
            className="group flex items-center gap-2.5 rounded-xl bg-[#00DCE5] px-7 py-3.5 text-sm font-semibold text-[#0B0F14] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,220,229,0.4)] hover:scale-[1.03] active:scale-[0.97]"
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
    <section className="relative overflow-hidden bg-[#0B0F14] py-24 sm:py-32">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <AnimateInView className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#A855F7]/20 bg-[#A855F7]/[0.08] px-4 py-1.5 font-medium text-xs tracking-wider text-[#A855F7]">
            Core Features
          </span>
          <h2 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Built for what matters
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#9AA3AF]">
            Essential tools for tracking, analyzing, and understanding your finances.
          </p>
        </AnimateInView>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(180px,auto)]">
          {coreFeatures.map((feature, index) => (
            <AnimateInView key={feature.title} delay={index * 0.08} className={feature.span}>
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="group relative h-full overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.04] hover:shadow-[0_0_40px_rgba(0,220,229,0.06)]"
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
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#9AA3AF]">{feature.description}</p>

                  {feature.featured && (
                    <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <div className="flex items-center justify-between text-xs text-[#9AA3AF]/60">
                        <span>This month</span>
                        <span className="text-[#00DCE5]">+24% savings</span>
                      </div>
                      <div className="mt-3 flex items-end gap-1 h-12">
                        {[30, 45, 35, 60, 50, 70, 85, 65, 75, 90, 55, 95].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t-sm bg-gradient-to-t from-[#00DCE5]/20 to-[#00DCE5]/60"
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
    <section className="relative overflow-hidden border-y border-white/[0.06] bg-[#080C10] py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-[#A855F7]/[0.03] blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <AnimateInView className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#22C55E]/20 bg-[#22C55E]/[0.08] px-4 py-1.5 font-medium text-xs tracking-wider text-[#22C55E]">
            Advanced Tools
          </span>
          <h2 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Go beyond basic tracking
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#9AA3AF]">
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
                <p className="mt-2 text-sm leading-relaxed text-[#9AA3AF]">{feature.description}</p>
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
    <section className="relative overflow-hidden bg-[#0B0F14] py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <AnimateInView key={stat.label} delay={index * 0.1}>
              <div className="text-center">
                <p className="text-4xl font-bold text-white">{stat.value}</p>
                <p className="mt-2 text-sm text-[#9AA3AF]">{stat.label}</p>
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
    <section className="relative overflow-hidden bg-[#0B0F14] py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 bottom-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-[#00DCE5]/[0.02] blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <AnimateInView className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 font-medium text-xs tracking-wider text-[#9AA3AF]">
            FAQ
          </span>
          <h2 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
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
                        className={`shrink-0 text-[#9AA3AF] transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </h3>
                  <div
                    id={id}
                    role="region"
                    aria-labelledby={`faq-${index}`}
                    className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-40' : 'max-h-0'}`}
                  >
                    <p className="px-6 pb-4 text-sm leading-relaxed text-[#9AA3AF]">
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
    <section className="relative overflow-hidden border-t border-white/[0.06] bg-[#080C10] py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00DCE5]/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <AnimateInView>
          <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Start tracking smarter today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#9AA3AF]">
            Join thousands of users who understand their finances better with Expense Tracker AI.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/sign-up"
              className="group flex items-center gap-2.5 rounded-xl bg-[#00DCE5] px-8 py-4 text-sm font-semibold text-[#0B0F14] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,220,229,0.4)] hover:scale-[1.03] active:scale-[0.97]"
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
          <p className="mt-6 text-xs text-[#9AA3AF]/60">No credit card required. Free forever.</p>
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
    <main className="min-h-screen bg-[#0B0F14]">
      <HeroSection />
      <CoreFeaturesSection />
      <DetailedFeaturesSection />
      <StatsSection />
      <FaqSection />
      <CtaSection />
    </main>
  );
}
