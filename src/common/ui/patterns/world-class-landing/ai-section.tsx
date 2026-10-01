"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain,
  ShieldCheck,
  CheckCircle2,
  Lock,
  MessageSquareQuote,
  EyeOff,
  DatabaseZap,
} from "lucide-react";
import { AnimateInView } from "./shared";

interface QuestionDemo {
  id: string;
  question: string;
  categoryTag: string;
  response: string;
  metrics: {
    source: string;
    amount: string;
    trend: string;
  };
  recommendation: string;
}

const AI_DEMO_QUESTIONS: QuestionDemo[] = [
  {
    id: "leaks",
    question: "Where are my hidden money leaks this month?",
    categoryTag: "Recurring & Subscriptions",
    response:
      "You have 4 recurring software & streaming charges totaling ₹3,440. Two streaming subscriptions had zero recorded usage during the last 45 days.",
    metrics: {
      source: "Subscriptions · 4 active items",
      amount: "₹3,440/mo",
      trend: "Potential ₹1,598/mo immediate saving",
    },
    recommendation: "Cancel idle streaming services or switch to annual billing to save ~₹19,000 annually.",
  },
  {
    id: "dining",
    question: "How does my food & dining compare to last quarter?",
    categoryTag: "Food & Dining",
    response:
      "Your dining expenses increased by 19.4% (₹9,820 vs ₹8,220 avg). Weekday food delivery orders accounted for 64% of this category surge.",
    metrics: {
      source: "Food & Dining · 28 transactions",
      amount: "₹9,820",
      trend: "+19.4% vs 3-month baseline",
    },
    recommendation: "Reducing food delivery from 4x/week to 2x/week recovers ₹3,600/month into your safe-to-spend balance.",
  },
  {
    id: "afford",
    question: "Can I comfortably afford a ₹25,000 electronics purchase?",
    categoryTag: "Safe-to-Spend Analysis",
    response:
      "Yes. With a net balance of ₹1,42,850 and projected fixed obligations of ₹48,000 for the remainder of the cycle, safe runway is ₹94,850.",
    metrics: {
      source: "Cash Flow Runway · 30-day forward model",
      amount: "₹94,850 runway",
      trend: "Goal contribution preserved",
    },
    recommendation: "Purchase is safe without touching your 6-month Emergency Fund savings target.",
  },
];

export function AISection() {
  const [activeQuestion, setActiveQuestion] = useState<QuestionDemo>(AI_DEMO_QUESTIONS[0]);

  return (
    <section className="relative isolate overflow-hidden border-t border-white/[0.06] bg-bg-base py-16 sm:py-20">
      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-8">
        {/* Header */}
        <div className="max-w-3xl">
          <AnimateInView>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-medium text-text-secondary">
              <span>AI insights</span>
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              The context behind your numbers.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-text-secondary leading-relaxed">
              Every answer comes straight from your own transactions, with the numbers to back it up.
            </p>
          </AnimateInView>
        </div>

        {/* Interactive Playground */}
        <div className="mt-12">
          {/* Question Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-1 rounded-xl border border-white/[0.08] bg-white/[0.02]">
            {AI_DEMO_QUESTIONS.map((item) => {
              const isSelected = activeQuestion.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveQuestion(item)}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-white/[0.08] text-white font-semibold"
                      : "text-text-tertiary hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  <MessageSquareQuote size={13} className={isSelected ? "text-primary" : "text-text-tertiary"} />
                  <span className="truncate">{item.question}</span>
                </button>
              );
            })}
          </div>

          {/* Response Container */}
          <div className="mt-4 rounded-xl border border-white/[0.08] bg-[#0c0e14]/90 p-5 sm:p-6 shadow-xl relative overflow-hidden">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-md bg-primary-muted text-primary">
                  <Brain size={13} />
                </div>
                <span className="text-xs font-semibold text-text-primary">Ledger Analysis Report</span>
              </div>

              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                <ShieldCheck size={11} />
                <span>Summary only</span>
              </span>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeQuestion.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="pt-4 space-y-4"
              >
                {/* User Prompt Echo */}
                <div className="flex items-center gap-2 text-xs font-mono text-text-tertiary">
                  <span className="text-primary font-bold">Query:</span>
                  <span>&ldquo;{activeQuestion.question}&rdquo;</span>
                </div>

                {/* Narrative Body */}
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3.5">
                  <p className="text-xs sm:text-sm text-text-primary leading-relaxed">
                    {activeQuestion.response}
                  </p>
                </div>

                {/* Proof & Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                    <span className="text-[10px] text-text-tertiary block">Source</span>
                    <span className="text-xs font-medium text-primary mt-0.5 flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      {activeQuestion.metrics.source}
                    </span>
                  </div>

                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                    <span className="text-[10px] text-text-tertiary block">Amount</span>
                    <span className="text-xs font-mono font-semibold text-text-primary mt-0.5 block">
                      {activeQuestion.metrics.amount}
                    </span>
                  </div>

                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                    <span className="text-[10px] text-text-tertiary block">Trend</span>
                    <span className="text-xs font-semibold text-emerald-400 mt-0.5 block">
                      {activeQuestion.metrics.trend}
                    </span>
                  </div>
                </div>

                {/* Action Recommendation */}
                <div className="flex items-start gap-2 text-xs text-text-secondary bg-white/[0.02] border border-white/[0.06] rounded-lg p-3">
                  <div>
                    <span className="font-semibold text-white">Suggested Action: </span>
                    <span>{activeQuestion.recommendation}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* 3 Privacy Guarantees */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {[
            {
              icon: EyeOff,
              title: "Only totals, never details",
              desc: "The AI sees category totals and monthly sums. Your merchant names and notes never leave your account.",
            },
            {
              icon: Lock,
              title: "Off until you ask",
              desc: "AI only runs when you ask it to. Turn it off anytime in settings.",
            },
            {
              icon: DatabaseZap,
              title: "Always up to date",
              desc: "Add or delete a transaction and every insight refreshes itself.",
            },
          ].map((item) => {
            return (
              <div
                key={item.title}
                className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.14]"
              >
                <item.icon size={16} className="text-primary" />
                <h3 className="mt-2 text-xs font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-xs text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
