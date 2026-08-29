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
    <section className="relative isolate overflow-hidden border-b border-white/[0.08] bg-[#050608] py-20 sm:py-28">
      {/* Background radial glows and grid */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-primary/[0.06] blur-[150px]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <AnimateInView>
            <div className="inline-flex px-5 py-2 items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold tracking-normal text-primary">
              <span>Summary-Only Financial Copilot</span>
            </div>
            <h2 className="font-space-grotesk mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Intelligence that explains the <span className="bg-gradient-to-r from-primary via-[#67e8f9] to-emerald-400 bg-clip-text text-transparent">story behind your numbers</span>
            </h2>
            <p className="mt-5 text-base sm:text-lg text-white/60 leading-relaxed">
              No generic chatbot answers. Every insight is generated on-demand from aggregated period data and backed by exact citation chips linking to your ledger.
            </p>
          </AnimateInView>
        </div>

        {/* Interactive AI Playground Box */}
        <div className="mt-14 max-w-4xl mx-auto">
          {/* Question Prompt Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-1.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl">
            {AI_DEMO_QUESTIONS.map((item) => {
              const isSelected = activeQuestion.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveQuestion(item)}
                  className={`relative rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    isSelected
                      ? "bg-primary text-black font-semibold shadow-lg shadow-primary/20"
                      : "text-white/70 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  <MessageSquareQuote size={14} className={isSelected ? "text-black" : "text-primary"} />
                  <span className="truncate">{item.question}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Response Container */}
          <div className="mt-5 rounded-2xl border border-primary/20 bg-[#0d1017]/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Top Bar inside Box */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
                  <Brain size={16} />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white">Expense AI Analysis</span>
                  <span className="text-[11px] text-white/40 ml-2 font-mono">Confidence: 98%</span>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400 font-mono">
                <ShieldCheck size={12} />
                <span>Zero Raw Data Leakage</span>
              </span>
            </div>

            {/* Dynamic Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeQuestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="pt-6 space-y-5"
              >
                {/* User Prompt Echo */}
                <div className="flex items-center gap-2 text-xs font-mono text-white/50">
                  <span className="text-primary font-bold">Query:</span>
                  <span>&ldquo;{activeQuestion.question}&rdquo;</span>
                </div>

                {/* AI Narrative Body */}
                <div className="rounded-xl border border-primary/15 bg-primary/[0.03] p-4.5">
                  <p className="text-sm px-5 py-2 sm:text-base text-[#d8fbfd] leading-relaxed">
                    {activeQuestion.response}
                  </p>
                </div>

                {/* Proof & Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                    <span className="text-[11px] text-white/40 block">Source Citation</span>
                    <span className="text-xs font-medium text-primary mt-1 flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      {activeQuestion.metrics.source}
                    </span>
                  </div>

                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                    <span className="text-[11px] text-white/40 block">Total Figure</span>
                    <span className="text-xs font-mono font-semibold text-white mt-1 block">
                      {activeQuestion.metrics.amount}
                    </span>
                  </div>

                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                    <span className="text-[11px] text-white/40 block">Impact Delta</span>
                    <span className="text-xs font-semibold text-emerald-400 mt-1 block">
                      {activeQuestion.metrics.trend}
                    </span>
                  </div>
                </div>

                {/* Action Recommendation */}
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-white/70 bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5">
                  <div>
                    <span className="font-semibold text-white">Suggested Action: </span>
                    <span>{activeQuestion.recommendation}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* 3 Privacy Guarantees Cards Below */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {[
            {
              icon: EyeOff,
              title: "Summary-Only Architecture",
              desc: "Only category sums and counts are sent. Transaction notes, IDs, and merchants are never transmitted.",
            },
            {
              icon: Lock,
              title: "Full User Opt-in",
              desc: "AI insights remain completely disabled until you explicitly generate them. Master toggle in settings.",
            },
            {
              icon: DatabaseZap,
              title: "Fail-Open & Invalidation",
              desc: "Fast responses powered by Redis with automatic cache invalidation whenever you record an entry.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4.5 transition-colors hover:border-primary/20 hover:bg-primary/[0.02]"
              >
                <h3 className="mt-3 font-semibold px-5 py-2 text-sm text-white">{item.title}</h3>
                <p className="mt-1 px-5 py-2 text-xs text-white/50 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
