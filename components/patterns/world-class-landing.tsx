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
   ANIMATED SVG SHAPES
   ──────────────────────────────────────────────────────────── */

function FloatingShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Cyan glow orb - top center */}
      <motion.div
        animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-[-10%] -translate-x-1/2"
      >
        <div className="h-[500px] w-[500px] rounded-full bg-[#00DCE5]/[0.07] blur-[100px]" />
      </motion.div>

      {/* Purple glow orb - bottom left */}
      <motion.div
        animate={{ y: [0, 15, 0], x: [0, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[-5%] left-[-5%]"
      >
        <div className="h-[400px] w-[400px] rounded-full bg-[#A855F7]/[0.06] blur-[80px]" />
      </motion.div>

      {/* Floating geometric shapes */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 800">
        {/* Rotating hexagon */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "200px 150px" }}
        >
          <motion.polygon
            points="200,110 230,130 230,170 200,190 170,170 170,130"
            fill="none"
            stroke="rgba(0,220,229,0.12)"
            strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.12, 0.25, 0.12] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.g>

        {/* Floating diamond */}
        <motion.g
          animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        >
          <rect
            x="950"
            y="120"
            width="40"
            height="40"
            rx="4"
            fill="none"
            stroke="rgba(168,85,247,0.15)"
            strokeWidth="1"
            transform="rotate(45 970 140)"
          />
        </motion.g>

        {/* Pulsing circle */}
        <motion.circle
          cx="150"
          cy="600"
          r="25"
          fill="none"
          stroke="rgba(0,220,229,0.1)"
          strokeWidth="1"
          animate={{ r: [25, 35, 25], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* Floating cross */}
        <motion.g
          animate={{ y: [0, 20, 0], rotate: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        >
          <line x1="1050" y1="500" x2="1050" y2="540" stroke="rgba(0,220,229,0.12)" strokeWidth="1" />
          <line x1="1030" y1="520" x2="1070" y2="520" stroke="rgba(0,220,229,0.12)" strokeWidth="1" />
        </motion.g>

        {/* Small dots constellation */}
        {[
          { cx: 300, cy: 200, delay: 0 },
          { cx: 320, cy: 220, delay: 0.5 },
          { cx: 280, cy: 240, delay: 1 },
          { cx: 340, cy: 180, delay: 1.5 },
          { cx: 260, cy: 210, delay: 2 },
        ].map((dot, i) => (
          <motion.circle
            key={i}
            cx={dot.cx}
            cy={dot.cy}
            r="2"
            fill="rgba(0,220,229,0.25)"
            animate={{ opacity: [0.25, 0.6, 0.25], scale: [1, 1.3, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: dot.delay }}
          />
        ))}

        {/* Connecting lines between dots */}
        <motion.line
          x1="300" y1="200" x2="320" y2="220"
          stroke="rgba(0,220,229,0.08)"
          strokeWidth="0.5"
          animate={{ opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.line
          x1="320" y1="220" x2="280" y2="240"
          stroke="rgba(0,220,229,0.08)"
          strokeWidth="0.5"
          animate={{ opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </svg>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />
    </div>
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
  const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.4], [0, 80]);
  const scale = useTransform(scrollYProgress, [0, 0.4], [1, 0.95]);

  return (
    <section
      ref={ref}
      className="relative"
    >
      {/* Background layer - clipped */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <FloatingShapes />
      </div>

      <motion.div
        style={{ opacity, y, scale }}
        className="relative z-10 mx-auto max-w-6xl px-4 pt-32 pb-24 sm:px-6 sm:pt-40 sm:pb-32 lg:px-8"
      >
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[#00DCE5]/20 bg-[#00DCE5]/[0.08] px-4 py-1.5 text-xs font-semibold text-[#00DCE5] shadow-[0_0_20px_rgba(0,220,229,0.1)]">
              <Sparkles size={14} className="animate-pulse" />
              AI-Powered Expense Tracking
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
          >
            Track smarter.
            <br />
            <span className="bg-gradient-to-r from-[#00DCE5] via-[#A855F7] to-[#22C55E] bg-clip-text text-transparent">
              Spend wiser.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-7 max-w-2xl text-lg text-[#9AA3AF] sm:text-xl"
          >
            AI auto-categorizes your expenses, forecasts your spending, and
            catches anomalies — so you always know where your money goes.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/sign-up"
              className="group relative flex items-center gap-2.5 rounded-xl bg-[#00DCE5] px-7 py-3.5 text-sm font-semibold text-[#0B0F14] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,220,229,0.4)] hover:scale-[1.03] active:scale-[0.97]"
            >
              Get started free
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/features"
              className="group flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] active:scale-[0.97]"
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-white/10 transition-all duration-300 group-hover:bg-white/15">
                <Play size={12} className="ml-0.5" />
              </span>
              See how it works
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-14 flex items-center justify-center gap-6 text-sm text-[#9AA3AF]"
          >
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={14}
                    className="fill-[#FBBF24] text-[#FBBF24]"
                  />
                ))}
              </div>
              <span>4.9/5 rating</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <span>2,400+ users</span>
            <div className="h-4 w-px bg-white/10" />
            <span>No credit card required</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Hero dashboard preview — outside parallax so it stays visible */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28"
      >
        <div className="relative">
          {/* Glow behind the card */}
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-[#00DCE5]/[0.08] via-[#A855F7]/[0.04] to-transparent blur-2xl" />

          {/* Browser frame */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B0F14]/80 shadow-[0_0_60px_rgba(0,220,229,0.08)] backdrop-blur-xl">
            {/* Title bar */}
            <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                <div className="h-3 w-3 rounded-full bg-[#28CA41]" />
              </div>
              <span className="ml-4 text-xs text-[#9AA3AF]/60">
                Expense AI Dashboard
              </span>
            </div>

            {/* Dashboard content */}
            <div className="grid gap-4 p-6 sm:grid-cols-3">
              {[
                {
                  icon: Wallet,
                  label: "Balance",
                  value: "₹1,24,500",
                  change: "+12.5%",
                  color: "#00DCE5",
                  bgColor: "rgba(0,220,229,0.08)",
                },
                {
                  icon: TrendingUp,
                  label: "Income",
                  value: "₹85,000",
                  change: "+8.2%",
                  color: "#22C55E",
                  bgColor: "rgba(34,197,94,0.08)",
                },
                {
                  icon: CreditCard,
                  label: "Expenses",
                  value: "₹42,300",
                  change: "-3.1%",
                  color: "#F04438",
                  bgColor: "rgba(240,68,56,0.08)",
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 + i * 0.1 }}
                  className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04] hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex size-8 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110"
                        style={{ backgroundColor: stat.bgColor }}
                      >
                        <stat.icon size={16} style={{ color: stat.color }} />
                      </div>
                      <span className="text-xs font-medium text-[#9AA3AF]">
                        {stat.label}
                      </span>
                    </div>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: stat.color }}
                    >
                      {stat.change}
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-bold tabular-nums text-white">
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Mini chart area */}
            <div className="border-t border-white/[0.06] px-6 py-4">
              <div className="flex items-center justify-between text-xs text-[#9AA3AF]/60">
                <span>Monthly Spending</span>
                <span className="text-[#00DCE5]">+15% this month</span>
              </div>
              <div className="mt-3 flex items-end gap-1.5 h-16">
                {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.5, delay: 1.1 + i * 0.05 }}
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-[#00DCE5]/20 to-[#00DCE5]/60 transition-all duration-300 hover:from-[#00DCE5]/30 hover:to-[#00DCE5]/80"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   FEATURES SECTION — Bento Grid
   ──────────────────────────────────────────────────────────── */

const features = [
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description: "Beautiful charts and insights that help you understand where your money goes.",
    color: "#00DCE5",
    bgColor: "rgba(0,220,229,0.08)",
    span: "lg:col-span-2 lg:row-span-2",
    featured: true,
  },
  {
    icon: Brain,
    title: "AI Categorization",
    description: "Automatically categorize transactions with AI-powered suggestions.",
    color: "#A855F7",
    bgColor: "rgba(168,85,247,0.08)",
    span: "lg:col-span-1",
    featured: false,
  },
  {
    icon: Target,
    title: "Budget Tracking",
    description: "Set budgets and track progress with real-time alerts.",
    color: "#22C55E",
    bgColor: "rgba(34,197,94,0.08)",
    span: "lg:col-span-1",
    featured: false,
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "Your data is encrypted and secure. We never sell your information.",
    color: "#3B82F6",
    bgColor: "rgba(59,130,246,0.08)",
    span: "lg:col-span-1",
    featured: false,
  },
  {
    icon: Zap,
    title: "Instant Sync",
    description: "Real-time updates across all your devices. Always up to date.",
    color: "#FBBF24",
    bgColor: "rgba(251,191,36,0.08)",
    span: "lg:col-span-1",
    featured: false,
  },
  {
    icon: Globe,
    title: "Multi-Currency",
    description: "Track expenses in multiple currencies with automatic conversion.",
    color: "#F04438",
    bgColor: "rgba(240,68,56,0.08)",
    span: "lg:col-span-2",
    featured: false,
  },
];

function FeaturesSection() {
  return (
    <section className="relative overflow-hidden bg-[#0B0F14] py-24 sm:py-32">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#00DCE5]/[0.03] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimateInView className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#00DCE5]/20 bg-[#00DCE5]/[0.08] px-4 py-1.5 text-xs font-semibold text-[#00DCE5]">
            Features
          </span>
          <h2 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Everything you need
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-[#9AA3AF]">
            Powerful tools designed to give you clarity and control over your money.
          </p>
        </AnimateInView>

        {/* Bento Grid */}
        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(180px,auto)]">
          {features.map((feature, index) => (
            <AnimateInView
              key={feature.title}
              delay={index * 0.08}
              className={feature.span}
            >
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="group relative h-full overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.04] hover:shadow-[0_0_40px_rgba(0,220,229,0.06)]"
              >
                {/* Hover glow */}
                <div
                  className="pointer-events-none absolute -inset-1 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
                  style={{ backgroundColor: feature.bgColor }}
                />

                <div className="relative z-10 flex h-full flex-col">
                  {/* Icon */}
                  <div
                    className="flex size-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: feature.bgColor }}
                  >
                    <feature.icon size={24} style={{ color: feature.color }} />
                  </div>

                  {/* Content */}
                  <h3 className="mt-5 text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#9AA3AF]">
                    {feature.description}
                  </p>

                  {/* Featured card extra content */}
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
