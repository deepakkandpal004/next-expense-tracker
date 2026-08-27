"use client";
import { motion } from "motion/react";
import { Brain, Target, Wallet } from "lucide-react";
import { AnimateInView, SectionPill } from "./shared";

const workflowSteps = [
  {
    number: "01",
    icon: Wallet,
    title: "Capture the moment",
    description: "Add an expense or income in seconds, whenever it happens.",
    color: "#00DCE5",
    surface: "bg-primary/[0.10]",
  },
  {
    number: "02",
    icon: Brain,
    title: "Let AI find the pattern",
    description: "Keep categories, recurring costs, and spending trends organized.",
    color: "#A855F7",
    surface: "bg-kpi-savings/[0.10]",
  },
  {
    number: "03",
    icon: Target,
    title: "Make your next move",
    description: "Use budgets and practical insights to stay on track each month.",
    color: "#22C55E",
    surface: "bg-success/[0.10]",
  },
];

export function HowItWorksSection() {
  return (
    <section id="about" className="relative isolate overflow-hidden border-y border-white/[0.06] bg-black py-14 sm:py-16 scroll-mt-20">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-[-12%] top-1/2 size-[420px] -translate-y-1/2 rounded-full bg-primary/[0.045] blur-[130px]" />
        <div className="absolute right-[-10%] top-0 size-[340px] rounded-full bg-kpi-savings/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-8">
        <div className="text-center">
          <AnimateInView>
            <SectionPill>A simpler routine</SectionPill>
            <h2 className="font-bold tracking-tight mt-6 text-5xl text-white sm:text-6xl">
              From a quick entry to a clearer plan.
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              Expense Tracker AI turns the small financial decisions you make
              every day into a picture you can actually use.
            </p>
          </AnimateInView>

          <div className="mx-auto mt-14 grid max-w-6xl gap-4 sm:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <AnimateInView key={step.number} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                   className="group relative flex h-full flex-col items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-center transition-all duration-300 hover:border-primary/20 hover:bg-primary/[0.04]"
                >
                  <span className="absolute right-4 top-3 font-medium tracking-wider text-xs text-white/[0.18]">
                    {step.number}
                  </span>
                  <div className={`mt-2 flex size-12 items-center justify-center rounded-xl ${step.surface} transition-transform duration-300 group-hover:scale-105`}>
                    <step.icon size={22} style={{ color: step.color }} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold tracking-wide text-lg text-white">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              </AnimateInView>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
