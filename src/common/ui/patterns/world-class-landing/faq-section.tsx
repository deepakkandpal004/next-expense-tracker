"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { AnimateInView } from "./shared";

const faqs = [
  {
    q: "What is Expense Tracker AI?",
    a: "Expense Tracker AI is a smart financial tracking app that helps you record transactions, understand spending patterns, and get AI-powered insights to manage your money better.",
  },
  {
    q: "Is Expense Tracker AI free?",
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
    a: "Yes! Expense Tracker AI works perfectly on all devices — desktop, tablet, and mobile. Your data syncs instantly across all your devices.",
  },
  {
    q: "Can I export my data?",
    a: "Yes, you can export your transaction data as CSV at any time. Your data is always accessible and portable.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative isolate border-b border-white/[0.06] bg-black py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <AnimateInView className="text-center">
          <h2 className="font-bold tracking-tight mt-3 text-4xl text-white sm:text-5xl">
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
                      ? "border-primary/30 bg-primary/[0.05]"
                      : "border-white/[0.06] bg-white/[0.02]"
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium text-sm tracking-wide text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/70"
                    aria-expanded={isOpen}
                  >
                    {faq.q}
                    <ChevronDown
                      size={16}
                      className={`shrink-0 text-muted-foreground transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-primary" : ""
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
                      <p className="px-5 pb-4 text-sm text-muted-foreground">
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
