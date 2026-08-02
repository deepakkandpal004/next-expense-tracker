"use client";
import { motion } from "motion/react";

import { useState } from "react";
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

export function FloatingShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Deep navy base wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A1322] via-[#0B0F16] to-transparent" />

      {/* Primary glow — top center, breathing */}
      <motion.div
        animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.07, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-[-30%] h-[700px] w-[1100px] -translate-x-1/2 rounded-full bg-[#00DCE5]/[0.08] blur-[150px]"
      />

      {/* Secondary glow — purple, bottom right */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-22%] right-[-8%] h-[480px] w-[480px] rounded-full bg-[#A855F7]/[0.06] blur-[130px]"
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   HERO SECTION
   ──────────────────────────────────────────────────────────── */

function HeroSection() {
  return (
    <section className="relative -mt-[68px]">
      {/* Fintech background — hero only */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <FloatingShapes />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-[168px] pb-24 sm:px-10 sm:pt-[180px] sm:pb-28 lg:px-12">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Left — copy */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-[#00DCE5]/20 bg-[#00DCE5]/[0.08] px-4 py-1.5 text-xs font-semibold text-[#00DCE5] shadow-[0_0_20px_rgba(0,220,229,0.1)]">
                <Sparkles size={14} className="animate-pulse" />
                AI Powered Expense Tracking
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Track every expense.
              <br />
              <span className="bg-gradient-to-r from-[#00DCE5] via-[#A855F7] to-[#22C55E] bg-clip-text text-transparent">
                Master every month.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-5 max-w-xl text-base text-[#9AA3AF] sm:text-lg lg:mx-0"
            >
              Expense AI auto-categorizes your transactions, tracks budgets and
              savings goals, and predicts what&apos;s coming — so you always
              know where your money goes.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start"
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

            {/* Mini feature strip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 lg:justify-start"
            >
              {[
                { icon: Zap, label: "Auto-categorization" },
                { icon: Target, label: "Budget alerts" },
                { icon: BarChart3, label: "AI predictions" },
              ].map((item) => (
                <span
                  key={item.label}
                  className="flex items-center gap-2 text-sm font-medium text-[#9AA3AF]"
                >
                  <span className="flex size-6 items-center justify-center rounded-full bg-[#00DCE5]/[0.1]">
                    <item.icon size={12} className="text-[#00DCE5]" />
                  </span>
                  {item.label}
                </span>
              ))}
            </motion.div>

            {/* AI insight teaser */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-8 flex items-center gap-3 rounded-xl border border-[#00DCE5]/15 bg-[#00DCE5]/[0.05] p-3.5"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00DCE5]/[0.12] text-[#00DCE5]">
                <Brain size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white">AI Insight</p>
                <p className="mt-0.5 text-xs leading-relaxed text-[#9AA3AF]">
                  You&apos;re on track to save{" "}
                  <span className="font-semibold text-[#22C55E]">₹2,400</span> this
                  month.
                </p>
              </div>
              <ArrowRight
                size={14}
                className="ml-auto shrink-0 text-[#5B6472]"
              />
            </motion.div>
          </div>

          {/* Right — dashboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Glow behind the card */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-[#00DCE5]/[0.08] via-[#A855F7]/[0.04] to-transparent blur-2xl" />

            {/* Floating chips */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-2 -top-5 z-20 hidden items-center gap-2 rounded-full border border-white/[0.08] bg-[#0B0F14]/90 px-3.5 py-2 text-xs font-medium text-white shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:flex"
            >
              <span className="size-1.5 animate-pulse rounded-full bg-[#22C55E]" />
              Budget suggestion · ₹8,000
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-4 -left-3 z-20 hidden items-center gap-2 rounded-full border border-white/[0.08] bg-[#0B0F14]/90 px-3.5 py-2 text-xs font-medium text-white shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:flex"
            >
              <span className="size-1.5 rounded-full bg-[#F5A623]" />
              Anomaly detected · +15% food spend
            </motion.div>

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
              <div className="grid gap-4 p-5 sm:grid-cols-3">
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
                    className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04] hover:shadow-lg"
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
              <div className="border-t border-white/[0.06] px-5 py-3">
                <div className="flex items-center justify-between text-xs text-[#9AA3AF]/60">
                  <span>Monthly Spending</span>
                  <span className="text-[#00DCE5]">+15% this month</span>
                </div>
                <div className="mt-3 flex items-end gap-1.5 h-14">
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

              {/* Recent activity */}
              <div className="border-t border-white/[0.06] px-5 py-3">
                <div className="mb-2 flex items-center justify-between text-xs text-[#9AA3AF]/60">
                  <span>Recent Activity</span>
                  <span className="text-[#9AA3AF]">Today</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: "Zomato", tag: "Food & Dining", amount: "-₹420", color: "#F5A623" },
                    { label: "Uber", tag: "Transportation", amount: "-₹186", color: "#3B82F6" },
                    { label: "Netflix", tag: "Entertainment", amount: "-₹199", color: "#EC4899" },
                  ].map((tx, i) => (
                    <motion.div
                      key={tx.label}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 1.5 + i * 0.08 }}
                      className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2 transition-colors duration-200 hover:bg-white/[0.04]"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: tx.color }} />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-white">{tx.label}</p>
                          <p className="truncate text-[10px] text-[#9AA3AF]/70">{tx.tag}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold tabular-nums text-white">{tx.amount}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
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
    span: "lg:col-span-1",
    featured: false,
  },
];

function FeaturesSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0B0F14] py-24 sm:py-32">
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
        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(180px,auto)] grid-flow-dense">
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
  const insights = [
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
  ];

  return (
    <section className="relative isolate overflow-hidden border-b border-border/50 bg-gradient-to-b from-surface-subtle to-surface py-24 sm:py-32">
      {/* Background: dot grid + soft glows */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-[-10%] top-[-20%] h-[500px] w-[500px] rounded-full bg-[#00DCE5]/[0.04] blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-5%] h-[400px] w-[400px] rounded-full bg-[#A855F7]/[0.035] blur-[120px]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage: "radial-gradient(ellipse 65% 55% at 50% 50%, black 20%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 65% 55% at 50% 50%, black 20%, transparent 100%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <AnimateInView>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#00DCE5]/20 bg-[#00DCE5]/[0.08] px-4 py-1.5 text-xs font-semibold text-[#00DCE5]">
              <Sparkles size={14} />
              AI-Powered
            </span>
            <h2 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Intelligence that works for you
            </h2>
            <p className="mt-5 text-lg text-[#9AA3AF]">
              Our AI understands your spending patterns and provides actionable
              insights to help you save more and spend smarter.
            </p>

            <div className="mt-10 space-y-3">
              {insights.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group flex items-start gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all duration-300 hover:border-[#00DCE5]/20 hover:bg-[#00DCE5]/[0.04]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00DCE5]/[0.1] transition-transform duration-300 group-hover:scale-105">
                    <item.icon size={20} className="text-[#00DCE5]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <p className="mt-0.5 text-sm text-[#9AA3AF]">{item.desc}</p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="mt-1 shrink-0 text-[#5B6472] opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                  />
                </motion.div>
              ))}
            </div>
          </AnimateInView>

          <AnimateInView delay={0.2} className="relative">
            {/* Floating chips */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-3 -top-5 z-20 hidden items-center gap-2 rounded-full border border-white/[0.08] bg-[#0B0F14]/90 px-3.5 py-2 text-xs font-medium text-white shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:flex"
            >
              <span className="size-1.5 animate-pulse rounded-full bg-[#22C55E]" />
              Budget suggestion · ₹8,000
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-5 -left-4 z-20 hidden items-center gap-2 rounded-full border border-white/[0.08] bg-[#0B0F14]/90 px-3.5 py-2 text-xs font-medium text-white shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:flex"
            >
              <span className="size-1.5 rounded-full bg-[#F5A623]" />
              Anomaly detected · +15% food spend
            </motion.div>

            {/* Glow behind the card */}
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-b from-[#00DCE5]/[0.08] via-[#A855F7]/[0.04] to-transparent blur-2xl" />

            {/* Main card */}
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B0F14]/80 p-6 shadow-[0_0_60px_rgba(0,220,229,0.06)] backdrop-blur-xl">
              {/* Card header */}
              <div className="mb-6 flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00DCE5]/20 to-[#00DCE5]/[0.05] text-[#00DCE5]">
                  <Sparkles size={20} />
                  <span className="absolute -right-1 -top-1 size-2.5 animate-pulse rounded-full bg-[#00DCE5]" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white">AI Insight</p>
                  <p className="text-xs text-[#9AA3AF]">Based on your spending</p>
                </div>
                <span className="ml-auto flex items-center gap-1.5 rounded-full border border-[#22C55E]/20 bg-[#22C55E]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#22C55E]">
                  <span className="size-1 animate-pulse rounded-full bg-[#22C55E]" />
                  Live
                </span>
              </div>

              {/* Insight body */}
              <div className="rounded-xl border-l-2 border-[#00DCE5] bg-white/[0.03] p-4">
                <p className="text-sm leading-relaxed text-[#C7CDD6]">
                  Your food expenses increased by{" "}
                  <span className="font-semibold text-[#F5A623]">15%</span> this
                  month. Consider setting a budget of{" "}
                  <span className="font-semibold text-white">₹8,000</span> to stay
                  on track.
                </p>
                <svg
                  className="mt-4 h-12 w-full"
                  viewBox="0 0 200 48"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="aiSparkFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00DCE5" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#00DCE5" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 40 L25 36 L50 39 L75 30 L100 33 L125 24 L150 28 L175 16 L200 20 L200 48 L0 48 Z"
                    fill="url(#aiSparkFill)"
                  />
                  <path
                    d="M0 40 L25 36 L50 39 L75 30 L100 33 L125 24 L150 28 L175 16 L200 20"
                    stroke="#00DCE5"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#22C55E]/15 bg-[#22C55E]/[0.06] p-4">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#22C55E]">
                    <Wallet size={13} /> Potential Savings
                  </div>
                  <p className="mt-1.5 text-2xl font-bold text-white">₹2,400</p>
                  <p className="mt-0.5 text-[11px] text-[#9AA3AF]">
                    18% of monthly spend
                  </p>
                </div>
                <div className="rounded-xl border border-[#8B5CF6]/15 bg-[#8B5CF6]/[0.06] p-4">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#C4B5FD]">
                    <Target size={13} /> Confidence
                  </div>
                  <p className="mt-1.5 text-2xl font-bold text-white">94%</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#00DCE5]" />
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
   FAQ SECTION
   ──────────────────────────────────────────────────────────── */

const faqs = [
  {
    q: "What is Expense AI?",
    a: "Expense AI is a smart financial tracking app that helps you record transactions, understand spending patterns, and get AI-powered insights to manage your money better.",
  },
  {
    q: "Is Expense AI free?",
    a: "Yes — completely free. There are no paid plans, no hidden charges, and no credit card required. Every feature, including AI insights, is available to everyone.",
  },
  {
    q: "Are there any limits on transactions?",
    a: "None. Record as many transactions as you want. There are no caps on usage, budgets, categories, or AI insights.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. We use bank-grade encryption and never sell your data. Your financial information is encrypted at rest and in transit.",
  },
  {
    q: "How does the AI work?",
    a: "Our AI analyzes your spending patterns to provide personalized insights, categorize transactions automatically, and predict future expenses. All AI features are optional and completely free.",
  },
  {
    q: "Can I use it on mobile?",
    a: "Yes! Expense AI works perfectly on all devices — desktop, tablet, and mobile. Your data syncs instantly across all your devices.",
  },
  {
    q: "Can I export my data?",
    a: "Yes, you can export your transaction data as CSV at any time. Your data is always accessible and portable.",
  },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative isolate border-b border-border/50 bg-surface py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <AnimateInView className="text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#00DCE5]">
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
                      ? "border-[#00DCE5]/30 bg-[#00DCE5]/[0.05]"
                      : "border-white/[0.06] bg-surface"
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-foreground transition-colors hover:text-[#00DCE5]"
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
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-surface-subtle to-canvas py-24 sm:py-32">
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
              href="/features"
              className="flex items-center gap-2 rounded-xl border border-border px-8 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-surface-subtle active:scale-[0.98]"
            >
              Explore Features
            </Link>
          </div>
          <p className="mt-6 text-sm text-foreground-secondary">
            Free forever. No credit card required. No limits.
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
      <FAQSection />
      <CTASection />
    </main>
  );
}
