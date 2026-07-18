"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useState, useRef } from "react";
import {
  Sparkles,
  BarChart3,
  Shield,
  Zap,
  Brain,
  Target,
  TrendingUp,
  CreditCard,
  Bell,
  Globe,
  ChevronDown,
  Check,
  Star,
  ArrowRight,
  Play,
  Wallet,
} from "lucide-react";
import Link from "next/link";

/* ────────────────────────────────────────────────────────────
   ANIMATION WRAPPER
   ──────────────────────────────────────────────────────────── */

function AnimateInView({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   HERO SECTION
   ──────────────────────────────────────────────────────────── */

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 60]);

  return (
    <section
      ref={ref}
      className="relative min-h-[90vh] overflow-hidden border-b border-border/50"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-canvas via-canvas to-surface-subtle" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow orbs */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
        <div className="h-[600px] w-[600px] rounded-full bg-accent/10 blur-[120px]" />
      </div>
      <div className="absolute bottom-0 left-0">
        <div className="h-[400px] w-[400px] rounded-full bg-kpi-income/10 blur-[100px]" />
      </div>

      <motion.div
        style={{ opacity, y }}
        className="relative z-10 mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
      >
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-semibold text-accent">
              <Sparkles size={14} />
              AI-Powered Financial Insights
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-8 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Money clarity,
            <br />
            <span className="bg-gradient-to-r from-accent via-kpi-income to-kpi-savings bg-clip-text text-transparent">
              powered by AI
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-foreground-secondary sm:text-xl"
          >
            Track expenses, understand spending patterns, and get intelligent
            recommendations — all in one beautiful workspace.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/sign-up"
              className="group flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-background transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
            >
              Get started free
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href="/features"
              className="flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-surface-subtle active:scale-[0.98]"
            >
              <Play size={16} />
              See how it works
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-12 flex items-center justify-center gap-6 text-sm text-foreground-secondary"
          >
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={14}
                    className="fill-warning text-warning"
                  />
                ))}
              </div>
              <span>4.9/5 rating</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <span>2,400+ users</span>
            <div className="h-4 w-px bg-border" />
            <span>No credit card required</span>
          </motion.div>
        </div>

        {/* Hero image/dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6 }}
          className="mt-16 sm:mt-20"
        >
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border/60 bg-surface shadow-2xl">
            <div className="flex items-center gap-2 border-b border-border/60 bg-surface-subtle/50 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-danger/60" />
              <div className="h-3 w-3 rounded-full bg-warning/60" />
              <div className="h-3 w-3 rounded-full bg-success/60" />
              <span className="ml-4 text-xs text-foreground-secondary">
                Expense AI Dashboard
              </span>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-3">
              {[
                {
                  icon: Wallet,
                  label: "Balance",
                  value: "₹1,24,500",
                  color: "text-accent",
                },
                {
                  icon: TrendingUp,
                  label: "Income",
                  value: "₹85,000",
                  color: "text-kpi-income",
                },
                {
                  icon: CreditCard,
                  label: "Expenses",
                  value: "₹42,300",
                  color: "text-kpi-expense",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border/40 bg-surface-subtle/30 p-4"
                >
                  <div className="flex items-center gap-2">
                    <stat.icon size={16} className={stat.color} />
                    <span className="text-xs text-foreground-secondary">
                      {stat.label}
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-bold tabular-nums">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   FEATURES SECTION
   ──────────────────────────────────────────────────────────── */

const features = [
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description:
      "Beautiful charts and insights that help you understand where your money goes.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Brain,
    title: "AI Categorization",
    description:
      "Automatically categorize transactions with AI-powered suggestions.",
    color: "text-kpi-savings",
    bg: "bg-kpi-savings-surface",
  },
  {
    icon: Target,
    title: "Budget Tracking",
    description:
      "Set budgets and track progress with real-time alerts and forecasts.",
    color: "text-kpi-income",
    bg: "bg-kpi-income-surface",
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description:
      "Your data is encrypted and secure. We never sell your information.",
    color: "text-info",
    bg: "bg-info-surface",
  },
  {
    icon: Zap,
    title: "Instant Sync",
    description:
      "Real-time updates across all your devices. Always up to date.",
    color: "text-warning",
    bg: "bg-warning-surface",
  },
  {
    icon: Globe,
    title: "Multi-Currency",
    description:
      "Track expenses in multiple currencies with automatic conversion.",
    color: "text-kpi-expense",
    bg: "bg-danger-surface",
  },
];

function FeaturesSection() {
  return (
    <section className="border-b border-border/50 bg-surface py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <AnimateInView className="text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            Features
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to master your finances
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-foreground-secondary">
            Powerful tools designed to give you clarity and control over your
            money.
          </p>
        </AnimateInView>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <AnimateInView key={feature.title} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                className="group rounded-2xl border border-border/60 bg-surface p-6 transition-shadow hover:shadow-lg"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg}`}
                >
                  <feature.icon size={24} className={feature.color} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-foreground-secondary">
                  {feature.description}
                </p>
              </motion.div>
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   AI SECTION
   ──────────────────────────────────────────────────────────── */

function AISection() {
  return (
    <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-surface-subtle to-surface py-24 sm:py-32">
      {/* Glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2">
        <div className="h-[500px] w-[500px] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <AnimateInView>
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              AI-Powered
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Intelligence that works for you
            </h2>
            <p className="mt-4 text-lg text-foreground-secondary">
              Our AI understands your spending patterns and provides actionable
              insights to help you save more and spend smarter.
            </p>

            <div className="mt-8 space-y-4">
              {[
                {
                  icon: Brain,
                  title: "Smart Categorization",
                  desc: "AI automatically categorizes your transactions",
                },
                {
                  icon: TrendingUp,
                  title: "Spending Predictions",
                  desc: "Forecast monthly expenses before they happen",
                },
                {
                  icon: Bell,
                  title: "Proactive Alerts",
                  desc: "Get notified before exceeding budgets",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-4 rounded-xl border border-border/40 bg-surface p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <item.icon size={20} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-foreground-secondary">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimateInView>

          <AnimateInView delay={0.2} className="relative">
            <div className="relative rounded-2xl border border-border/60 bg-surface p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <Sparkles size={20} className="text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">AI Insight</p>
                  <p className="text-xs text-foreground-secondary">
                    Based on your spending
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl bg-surface-subtle p-4">
                  <p className="text-sm text-foreground-secondary">
                    Your food expenses increased by 15% this month. Consider
                    setting a budget of ₹8,000 to stay on track.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-kpi-income-surface p-3 text-center">
                    <p className="text-xs text-kpi-income-foreground">
                      Potential Savings
                    </p>
                    <p className="mt-1 text-xl font-bold text-kpi-income">
                      ₹2,400
                    </p>
                  </div>
                  <div className="rounded-xl bg-kpi-savings-surface p-3 text-center">
                    <p className="text-xs text-kpi-savings-foreground">
                      Confidence
                    </p>
                    <p className="mt-1 text-xl font-bold text-kpi-savings">
                      94%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AnimateInView>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   TESTIMONIALS SECTION
   ──────────────────────────────────────────────────────────── */

const testimonials = [
  {
    quote:
      "Expense AI completely changed how I manage my money. The AI insights are genuinely helpful.",
    author: "Priya Sharma",
    role: "Product Manager",
    rating: 5,
  },
  {
    quote:
      "Finally, a finance app that's beautiful AND functional. The charts are incredible.",
    author: "Arjun Mehta",
    role: "Startup Founder",
    rating: 5,
  },
  {
    quote:
      "I've tried dozens of expense trackers. This is the only one I actually stick with.",
    author: "Neha Kapoor",
    role: "Freelance Designer",
    rating: 5,
  },
];

function TestimonialsSection() {
  return (
    <section className="border-b border-border/50 bg-surface py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <AnimateInView className="text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            Testimonials
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Loved by thousands
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-foreground-secondary">
            See what our users have to say about their experience.
          </p>
        </AnimateInView>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <AnimateInView key={testimonial.author} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                className="flex h-full flex-col rounded-2xl border border-border/60 bg-surface p-6 transition-shadow hover:shadow-lg"
              >
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="fill-warning text-warning"
                    />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {testimonial.author}
                    </p>
                    <p className="text-xs text-foreground-secondary">
                      {testimonial.role}
                    </p>
                  </div>
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
   PRICING SECTION
   ──────────────────────────────────────────────────────────── */

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for getting started",
    features: [
      "Up to 100 transactions/month",
      "Basic analytics",
      "1 budget",
      "CSV export",
      "Email support",
    ],
    cta: "Get started",
    href: "/sign-up",
    popular: false,
  },
  {
    name: "Pro",
    price: "299",
    period: "/month",
    description: "For serious financial tracking",
    features: [
      "Unlimited transactions",
      "Advanced AI insights",
      "Unlimited budgets",
      "Savings goals",
      "Priority support",
      "Custom categories",
    ],
    cta: "Start free trial",
    href: "/sign-up",
    popular: true,
  },
  {
    name: "Team",
    price: "799",
    period: "/month",
    description: "For families and teams",
    features: [
      "Everything in Pro",
      "Up to 5 members",
      "Shared budgets",
      "Team analytics",
      "Dedicated support",
      "API access",
    ],
    cta: "Contact sales",
    href: "/contact",
    popular: false,
  },
];

function PricingSection() {
  return (
    <section className="border-b border-border/50 bg-gradient-to-b from-surface-subtle to-surface py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <AnimateInView className="text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            Pricing
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-foreground-secondary">
            Start free. Upgrade when you need more power.
          </p>
        </AnimateInView>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <AnimateInView key={plan.name} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                className={`relative flex h-full flex-col rounded-2xl border p-6 transition-shadow hover:shadow-lg ${
                  plan.popular
                    ? "border-accent/50 bg-surface shadow-lg"
                    : "border-border/60 bg-surface"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </span>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-sm text-foreground-secondary">
                    {plan.description}
                  </p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">
                      ₹{plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-sm text-foreground-secondary">
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check
                        size={16}
                        className="mt-0.5 shrink-0 text-kpi-income"
                      />
                      <span className="text-sm text-foreground-secondary">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`mt-6 block rounded-xl py-3 text-center text-sm font-semibold transition-all active:scale-[0.98] ${
                    plan.popular
                      ? "bg-foreground text-background hover:shadow-lg"
                      : "border border-border text-foreground hover:bg-surface-subtle"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
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

const faqs = [
  {
    q: "What is Expense AI?",
    a: "Expense AI is a smart financial tracking app that helps you record transactions, understand spending patterns, and get AI-powered insights to manage your money better.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. We use bank-grade encryption and never sell your data. Your financial information is encrypted at rest and in transit.",
  },
  {
    q: "How does the AI work?",
    a: "Our AI analyzes your spending patterns to provide personalized insights, categorize transactions automatically, and predict future expenses. All AI features are optional.",
  },
  {
    q: "Can I use it on mobile?",
    a: "Yes! Expense AI works perfectly on all devices — desktop, tablet, and mobile. Your data syncs instantly across all your devices.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes, our Free plan includes up to 100 transactions per month, basic analytics, and one budget. No credit card required to get started.",
  },
  {
    q: "Can I export my data?",
    a: "Yes, you can export your transaction data as CSV at any time. Your data is always accessible and portable.",
  },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="border-b border-border/50 bg-surface py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <AnimateInView className="text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            FAQ
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently asked questions
          </h2>
        </AnimateInView>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <AnimateInView key={faq.q} delay={index * 0.05}>
                <div
                  className={`rounded-xl border transition-colors ${
                    isOpen
                      ? "border-accent/30 bg-accent/5"
                      : "border-border/60 bg-surface"
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-foreground transition-colors hover:text-accent"
                    aria-expanded={isOpen}
                  >
                    {faq.q}
                    <ChevronDown
                      size={16}
                      className={`shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-sm text-foreground-secondary">
                        {faq.a}
                      </p>
                    </motion.div>
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

/* ────────────────────────────────────────────────────────────
   CTA SECTION
   ──────────────────────────────────────────────────────────── */

function CTASection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-surface-subtle to-canvas py-24 sm:py-32">
      {/* Glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-[400px] w-[400px] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <AnimateInView>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Start understanding your money today
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground-secondary">
            Join thousands of people who have transformed their financial lives
            with Expense AI.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/sign-up"
              className="group flex items-center gap-2 rounded-xl bg-foreground px-8 py-3.5 text-sm font-semibold text-background transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
            >
              Get started for free
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-2 rounded-xl border border-border px-8 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-surface-subtle active:scale-[0.98]"
            >
              Talk to sales
            </Link>
          </div>
          <p className="mt-6 text-sm text-foreground-secondary">
            Free plan available. No credit card required.
          </p>
        </AnimateInView>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   MAIN LANDING PAGE
   ──────────────────────────────────────────────────────────── */

export function WorldClassLandingPage() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <AISection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </main>
  );
}
