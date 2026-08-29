"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
  Coffee,
  ShoppingBag,
  Laptop,
  CheckCircle2,
  Wallet,
  Calendar,
  Layers,
} from "lucide-react";

interface SampleTransaction {
  id: string;
  name: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  icon: typeof Coffee;
  iconBg: string;
  iconColor: string;
}

const SAMPLE_TRANSACTIONS: Record<string, SampleTransaction[]> = {
  current: [
    {
      id: "1",
      name: "Blue Tokai Coffee Roasters",
      category: "Food & Dining",
      amount: 340,
      type: "expense",
      date: "Today, 10:24 AM",
      icon: Coffee,
      iconBg: "rgba(249, 115, 22, 0.12)",
      iconColor: "#FB923C",
    },
    {
      id: "2",
      name: "GitHub Copilot Subscription",
      category: "Software & Tools",
      amount: 899,
      type: "expense",
      date: "Yesterday",
      icon: Laptop,
      iconBg: "rgba(59, 130, 246, 0.12)",
      iconColor: "#60A5FA",
    },
    {
      id: "3",
      name: "Nature's Basket Groceries",
      category: "Groceries",
      amount: 1850,
      type: "expense",
      date: "28 Oct",
      icon: ShoppingBag,
      iconBg: "rgba(34, 197, 94, 0.12)",
      iconColor: "#4ADE80",
    },
    {
      id: "4",
      name: "Client Invoicing (Retainer)",
      category: "Income",
      amount: 65000,
      type: "income",
      date: "27 Oct",
      icon: Wallet,
      iconBg: "rgba(0, 220, 229, 0.12)",
      iconColor: "#00DCE5",
    },
  ],
  previous: [
    {
      id: "5",
      name: "Whole Foods Market",
      category: "Groceries",
      amount: 2450,
      type: "expense",
      date: "30 Sep",
      icon: ShoppingBag,
      iconBg: "rgba(34, 197, 94, 0.12)",
      iconColor: "#4ADE80",
    },
    {
      id: "6",
      name: "Vercel Pro Plan",
      category: "Software & Tools",
      amount: 1650,
      type: "expense",
      date: "25 Sep",
      icon: Laptop,
      iconBg: "rgba(59, 130, 246, 0.12)",
      iconColor: "#60A5FA",
    },
    {
      id: "7",
      name: "Third Wave Coffee",
      category: "Food & Dining",
      amount: 420,
      type: "expense",
      date: "22 Sep",
      icon: Coffee,
      iconBg: "rgba(249, 115, 22, 0.12)",
      iconColor: "#FB923C",
    },
    {
      id: "8",
      name: "Consulting Payout",
      category: "Income",
      amount: 55000,
      type: "income",
      date: "15 Sep",
      icon: Wallet,
      iconBg: "rgba(0, 220, 229, 0.12)",
      iconColor: "#00DCE5",
    },
  ],
};

const STATS_DATA = {
  current: {
    month: "October 2026",
    balance: "₹1,42,850",
    balanceDelta: "+₹12,400 (+9.2%)",
    spent: "₹48,210",
    budget: "₹65,000",
    budgetPct: 74,
    safeToSpend: "₹16,790",
    dailyPacing: "₹1,399/day",
    aiObservation: "Dining spend is 14% higher than usual. Pacing allows ₹1,399/day to hit your 20% savings target.",
    proofTag: "Food & Dining · ₹8,420 · 24 tx",
  },
  previous: {
    month: "September 2026",
    balance: "₹1,30,450",
    balanceDelta: "+₹8,900 (+6.8%)",
    spent: "₹52,100",
    budget: "₹60,000",
    budgetPct: 86,
    safeToSpend: "₹7,900",
    dailyPacing: "₹980/day",
    aiObservation: "Great discipline on Groceries (-12%). Total savings target met with a ₹12,900 surplus.",
    proofTag: "Groceries · ₹9,150 · 18 tx",
  },
};

export function DashboardPreview() {
  const [selectedMonth, setSelectedMonth] = useState<"current" | "previous">("current");
  const stats = STATS_DATA[selectedMonth];
  const txList = SAMPLE_TRANSACTIONS[selectedMonth];

  return (
    <div className="relative mx-auto w-full max-w-5xl">
      {/* Outer Glow frame */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-primary/30 via-primary/5 to-transparent blur-xl opacity-60 pointer-events-none" />

      {/* Main Glass Window Container */}
      <div className="relative rounded-2xl border border-white/[0.12] bg-[#0c0e14]/90 backdrop-blur-2xl shadow-2xl overflow-hidden">
        {/* App Titlebar */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-[#ff5f56]/80" />
              <span className="size-3 rounded-full bg-[#ffbd2e]/80" />
              <span className="size-3 rounded-full bg-[#27c93f]/80" />
            </div>
            <span className="ml-3 hidden sm:inline-block text-xs font-mono text-white/40">
              expense-tracker-ai/app/dashboard
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Interactive Month Switcher in Demo */}
            <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setSelectedMonth("current")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all ${
                  selectedMonth === "current"
                    ? "bg-primary text-black font-semibold shadow"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Calendar size={12} />
                <span>Oct 2026</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMonth("previous")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-all ${
                  selectedMonth === "previous"
                    ? "bg-primary text-black font-semibold shadow"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Calendar size={12} />
                <span>Sep 2026</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Synced</span>
            </div>
          </div>
        </div>

        {/* Interior Dashboard Body */}
        <div className="p-5 sm:p-7 space-y-6">
          {/* Top KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* KPI 1: Net Balance */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4.5 transition-colors hover:border-white/[0.14]">
              <div className="flex items-center px-5 py-2 justify-between text-xs font-medium text-white/50">
                <span>Net Balance</span>
                <span className="flex items-center text-emerald-400 font-semibold gap-0.5 text-[11px]">
                  <TrendingUp size={12} />
                  {stats.balanceDelta.split(" ")[1]}
                </span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={stats.balance}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-2 font-space-grotesk text-2xl px-5 py-2 sm:text-3xl font-bold tracking-tight text-white font-mono"
                >
                  {stats.balance}
                </motion.div>
              </AnimatePresence>
              <div className="mt-2 flex px-5 py-2 items-center gap-1.5 text-xs text-white/40">
                <ShieldCheck size={13} className="text-primary" />
                <span>100% verified ledger</span>
              </div>
            </div>

            {/* KPI 2: Budget Utilization */}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4.5 transition-colors hover:border-white/[0.14]">
              <div className="flex items-center justify-between text-xs font-medium text-white/50">
                <span className="px-5 py-2">Budget Spent</span>
                <span className="font-mono text-xs px-5 py-2 font-semibold text-white/70">
                  {stats.budgetPct}%
                </span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={stats.spent}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-2 font-space-grotesk text-2xl px-5 py-2 sm:text-3xl font-bold tracking-tight text-white font-mono"
                >
                  {stats.spent}
                  <span className="text-sm font-normal text-white/40 ml-1">/ {stats.budget}</span>
                </motion.div>
              </AnimatePresence>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.budgetPct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
                />
              </div>
            </div>

            {/* KPI 3: Safe To Spend */}
            <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-4.5 relative overflow-hidden transition-colors hover:border-primary/40">
              <div className="flex items-center justify-between text-xs font-medium text-primary">
                <span className="flex items-center px-5 py-2 gap-1.5 font-semibold">
                  Safe to Spend
                </span>
                <span className="text-[11px] font-mono px-5 py-2 text-primary/70">{stats.dailyPacing}</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={stats.safeToSpend}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-2 font-space-grotesk px-5 py-2 text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono"
                >
                  {stats.safeToSpend}
                </motion.div>
              </AnimatePresence>
              <p className="mt-2 px-5 py-2 text-xs text-white/50">
                Projected runway before month end
              </p>
            </div>
          </div>

          {/* AI Narrative Observation Banner (Floating Layer) */}
          <div className="relative rounded-xl border border-primary/25 bg-gradient-to-r from-primary/[0.09] via-white/[0.02] to-transparent p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold tracking-wider text-primary">
                      AI Observation
                    </span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={stats.aiObservation}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-1 text-sm text-[#d8fbfd] leading-relaxed"
                    >
                      {stats.aiObservation}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              {/* Proof Chip */}
              <div className="shrink-0">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <CheckCircle2 size={13} />
                  <span>{stats.proofTag}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Category Breakdown + Recent Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
            {/* Category Breakdown Progress */}
            <div className="lg:col-span-5 rounded-xl px-5 py-2 pt-5 border border-white/[0.08] bg-white/[0.02] p-4.5 space-y-3.5">
              <div className="flex items-center justify-between text-xs font-semibold text-white/70">
                <span className="flex items-center gap-1.5">
                  <Layers size={14} className="text-primary" />
                  Category Breakdown
                </span>
                <span className="text-white/40 text-[11px]">Top Spend</span>
              </div>

              <div className="space-y-8 pt-2">
                {[
                  { name: "Housing & Utilities", amount: "₹22,000", pct: 45, color: "bg-cyan-400" },
                  { name: "Food & Dining", amount: "₹8,420", pct: 18, color: "bg-amber-400" },
                  { name: "Groceries", amount: "₹6,100", pct: 13, color: "bg-emerald-400" },
                  { name: "Software & Subscriptions", amount: "₹5,200", pct: 11, color: "bg-blue-400" },
                  { name: "Transport & Fuel", amount: "₹3,490", pct: 8, color: "bg-purple-400" },
                ].map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/80 font-medium">{cat.name}</span>
                      <span className="font-mono text-white/60 text-[11px]">{cat.amount}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${cat.color}`}
                        style={{ width: `${cat.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Verified Transactions */}
            <div className="lg:col-span-7 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4.5 space-y-3">
              <div className="flex items-center px-5 py-2 justify-between text-xs font-semibold text-white/70">
                <span>Recent Transactions</span>
                <span className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-0.5">
                  Live Feed <ArrowUpRight size={13} />
                </span>
              </div>

              <div className="divide-y divide-white/[0.05]">
                {txList.map((tx) => {
                  const Icon = tx.icon;
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between py-2.5 first:pt-1 last:pb-0 group transition-colors"
                    >
                      <div className="flex items-center px-5 py-2 gap-3">
                        <div
                          className="flex size-8.5 shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: tx.iconBg, color: tx.iconColor }}
                        >
                          <Icon size={16}/>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-white group-hover:text-primary transition-colors">
                            {tx.name}
                          </p>
                          <p className="text-[11px] text-white/40">
                            {tx.category} • {tx.date}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`font-mono text-xs px-5 py-2 font-semibold ${
                          tx.type === "income" ? "text-emerald-400" : "text-white/90"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
