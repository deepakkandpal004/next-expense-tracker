"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { AnimateInView } from "./shared";

const faqs = [
  {
    q: "What is Expense Tracker AI?",
    a: "A simple app to record your expenses and income, see where your money goes, and get optional AI insights on your spending.",
  },
  {
    q: "Is it free?",
    a: "Yes. Every feature is free, no paid plans, no credit card required.",
  },
  {
    q: "Are there any limits on transactions?",
    a: "No. Add as many transactions, budgets, and categories as you want.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. Your data is never sold, and you can export or delete it anytime.",
  },
  {
    q: "How does the AI work?",
    a: "When you ask, it looks at your category totals and answers in plain English, like where you're overspending. It never sees merchant names or notes, and it's completely optional.",
  },
  {
    q: "Can I use it on mobile?",
    a: "Yes. It works on phones, tablets, and desktops, and your data syncs across all of them.",
  },
  {
    q: "Can I export my data?",
    a: "Anytime. One click gives you a CSV download. It's your data.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative isolate border-b border-white/[0.06] bg-bg-base py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <AnimateInView>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
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
                      ? "border-border bg-primary-muted"
                      : "border-white/[0.06] bg-white/[0.02]"
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium text-sm tracking-wide text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
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
