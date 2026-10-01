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
      {/* Main Container Window */}
      <div className="relative rounded-xl border border-white/[0.1] bg-[#0c0e14]/95 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Browser / App Header Bar */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-2.5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-white/20" />
              <span className="size-2.5 rounded-full bg-white/20" />
              <span className="size-2.5 rounded-full bg-white/20" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Interactive Month Switcher */}
            <div className="flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03] p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setSelectedMonth("current")}
                className={`flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                  selectedMonth === "current"
                    ? "bg-white/[0.1] text-white"
                    : "text-text-tertiary hover:text-white"
                }`}
              >
                <Calendar size={11} />
                <span>Oct 2026</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMonth("previous")}
                className={`flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                  selectedMonth === "previous"
                    ? "bg-white/[0.1] text-white"
                    : "text-text-tertiary hover:text-white"
                }`}
              >
                <Calendar size={11} />
                <span>Sep 2026</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              <span>Synced</span>
            </div>
          </div>
        </div>

        {/* Dashboard Content Body */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* KPI 1: Net Balance */}
            <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.12]">
              <div className="flex items-center justify-between text-xs font-medium text-text-secondary">
                <span>Net Balance</span>
                <span className="flex items-center text-emerald-400 font-semibold gap-0.5 text-[11px]">
                  <TrendingUp size={12} />
                  {stats.balanceDelta.split(" ")[1]}
                </span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={stats.balance}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-white"
                >
                  {stats.balance}
                </motion.div>
              </AnimatePresence>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-text-tertiary">
                <ShieldCheck size={13} className="text-primary" />
                <span>Verified ledger balance</span>
              </div>
            </div>

            {/* KPI 2: Budget Spent */}
            <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.12]">
              <div className="flex items-center justify-between text-xs font-medium text-text-secondary">
                <span>Budget Spent</span>
                <span className="font-mono text-xs font-semibold text-text-primary">
                  {stats.budgetPct}%
                </span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={stats.spent}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-white"
                >
                  {stats.spent}
                  <span className="text-xs font-normal text-text-tertiary ml-1.5">/ {stats.budget}</span>
                </motion.div>
              </AnimatePresence>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.budgetPct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
            </div>

            {/* KPI 3: Safe To Spend */}
            <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.12]">
              <div className="flex items-center justify-between text-xs font-medium text-text-secondary">
                <span>Safe to Spend</span>
                <span className="text-[11px] font-mono text-text-tertiary">{stats.dailyPacing}</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={stats.safeToSpend}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-emerald-400"
                >
                  {stats.safeToSpend}
                </motion.div>
              </AnimatePresence>
              <p className="mt-2 text-[11px] text-text-tertiary">
                What you can still spend
              </p>
            </div>
          </div>

          {/* Monthly Intelligence Banner */}
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Pacing this month
                </span>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={stats.aiObservation}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-0.5 text-xs text-text-secondary leading-relaxed"
                  >
                    {stats.aiObservation}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Proof Tag */}
              <div className="shrink-0">
                <span className="inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-text-tertiary">
                  <CheckCircle2 size={12} className="text-primary" />
                  <span>{stats.proofTag}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Breakdown + Recent Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Category Breakdown */}
            <div className="lg:col-span-5 rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <Layers size={13} className="text-primary" />
                  Category Breakdown
                </span>
                <span className="text-text-tertiary text-[11px]">Top Spend</span>
              </div>

              <div className="space-y-3 pt-1">
                {[
                  { name: "Housing & Utilities", amount: "₹22,000", pct: 45, color: "bg-blue-400" },
                  { name: "Food & Dining", amount: "₹8,420", pct: 18, color: "bg-amber-400" },
                  { name: "Groceries", amount: "₹6,100", pct: 13, color: "bg-emerald-400" },
                  { name: "Software & Tools", amount: "₹5,200", pct: 11, color: "bg-indigo-400" },
                  { name: "Transport & Fuel", amount: "₹3,490", pct: 8, color: "bg-purple-400" },
                ].map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary font-medium">{cat.name}</span>
                      <span className="font-mono text-text-tertiary text-[11px]">{cat.amount}</span>
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

            {/* Recent Transactions */}
            <div className="lg:col-span-7 rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
                <span>Recent Transactions</span>
                <span className="text-xs text-text-tertiary hover:text-white transition-colors cursor-pointer flex items-center gap-0.5">
                  View all <ArrowUpRight size={12} />
                </span>
              </div>

              <div className="divide-y divide-white/[0.04]">
                {txList.map((tx) => {
                  const Icon = tx.icon;
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between py-2 first:pt-1 last:pb-0 group transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex size-7 shrink-0 items-center justify-center rounded-md"
                          style={{ backgroundColor: tx.iconBg, color: tx.iconColor }}
                        >
                          <Icon size={14}/>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-text-primary group-hover:text-white transition-colors">
                            {tx.name}
                          </p>
                          <p className="text-[10px] text-text-tertiary">
                            {tx.category} • {tx.date}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`font-mono text-xs tabular-nums font-semibold ${
                          tx.type === "income" ? "text-emerald-400" : "text-text-primary"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "−"}₹{tx.amount.toLocaleString("en-IN")}
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
