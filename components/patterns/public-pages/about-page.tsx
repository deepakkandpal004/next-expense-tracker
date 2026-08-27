'use client';

import { motion } from 'motion/react';
import {
  BarChart3,
  Brain,
  Globe,
  Shield,
  Target,
  Zap,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { AnimateInView } from './shared';

export function AboutPageContent() {
  return (
    <main className="min-h-screen bg-foreground-inverse">
      {/* Hero — editorial style, minimal */}
      <section className="relative overflow-hidden py-32 sm:py-40">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/[0.03] blur-[150px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <AnimateInView>
            <h1 className="text-6xl font-semibold tracking-tight text-white sm:text-7xl md:text-8xl">
              We believe finance
              <br />
              should be{' '}
              <span className="bg-gradient-to-r from-primary to-kpi-savings bg-clip-text text-transparent">
                clear
              </span>
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Expense Tracker AI exists to make financial tracking simple, private, and accessible.
              No complexity. No hidden agendas. Just clarity.
            </p>
          </AnimateInView>
        </div>
      </section>

      {/* Stats — large, minimal */}
      <section className="relative border-y border-white/[0.06] bg-bg-base py-20">
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
                  <p className="text-6xl font-semibold tracking-tight text-white sm:text-7xl">{stat.value}</p>
                  <p className="mt-3 text-sm font-medium uppercase tracking-wider text-muted-foreground/60">{stat.label}</p>
                </div>
              </AnimateInView>
            ))}
          </div>
        </div>
      </section>

      {/* Story — split layout, editorial */}
      <section className="relative overflow-hidden bg-foreground-inverse py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-kpi-savings/[0.03] blur-[120px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-16 lg:grid-cols-2">
            <AnimateInView>
              <p className="text-xs font-semibold uppercase tracking-widest text-kpi-savings">Our Story</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Why we built this
              </h2>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
                <p>
                  Most expense trackers are either too simple or too complicated.
                  We wanted something in between — powerful enough for real financial
                  insight, but simple enough to use every day.
                </p>
                <p>
                  So we built Expense Tracker AI. A clean workspace where you record transactions,
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
                    <span className="text-xs font-semibold text-primary/60">{item.step}</span>
                    <h3 className="mt-2 text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </AnimateInView>
          </div>
        </div>
      </section>

      {/* Principles — minimal grid */}
      <section className="relative border-y border-white/[0.06] bg-bg-base py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <AnimateInView className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/60">Principles</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              What guides us
            </h2>
          </AnimateInView>

          <div className="mt-16 grid gap-px sm:grid-cols-2 lg:grid-cols-3 bg-white/[0.04] rounded-2xl overflow-hidden">
            {[
              {
                icon: Shield,
                title: 'Privacy',
                desc: 'Your data stays yours. Always.',
                color: '#3B82F6',
              },
              {
                icon: Brain,
                title: 'Transparency',
                desc: 'AI is optional and clearly explained.',
                color: '#A855F7',
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
                color: '#FBBF24',
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
                color: '#00DCE5',
              },
            ].map((p, index) => (
              <AnimateInView key={p.title} delay={index * 0.06}>
                <div className="group bg-foreground-inverse p-8 transition-colors duration-300 hover:bg-white/[0.02]">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-white/[0.04]">
                    <p.icon size={20} style={{ color: p.color }} />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-white">{p.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                </div>
              </AnimateInView>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-foreground-inverse py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.04] blur-[120px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <AnimateInView>
            <h2 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              Start with clarity
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Join thousands who track smarter with Expense Tracker AI.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className="group flex items-center gap-2.5 rounded-xl bg-primary px-8 py-4 text-sm font-semibold text-foreground-inverse transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,220,229,0.4)] hover:scale-[1.03] active:scale-[0.97]"
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
