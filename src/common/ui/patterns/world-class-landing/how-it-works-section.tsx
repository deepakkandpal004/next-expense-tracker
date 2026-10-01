"use client";
import { BarChart2, PlusCircle, Target } from "lucide-react";
import { AnimateInView } from "./shared";

const workflowSteps = [
  {
    number: "01",
    icon: PlusCircle,
    title: "Add transactions",
    description: "Log an expense or income in seconds. Categories get suggested automatically.",
  },
  {
    number: "02",
    icon: BarChart2,
    title: "Watch your runway",
    description: "See your safe-to-spend update as the month goes on.",
  },
  {
    number: "03",
    icon: Target,
    title: "Hit your targets",
    description: "Stay inside your budgets and hit savings goals without thinking about it daily.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="about" className="relative isolate overflow-hidden border-t border-white/[0.06] bg-bg-base py-16 sm:py-20 scroll-mt-20">
      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-8">
        <div>
          <AnimateInView>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              How it works
            </h2>
            <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-text-secondary">
              Three steps and you&apos;re set.
            </p>
          </AnimateInView>

          <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <AnimateInView key={step.number} delay={index * 0.05}>
                <div
                  className="group relative flex h-full flex-col items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 text-left transition-colors hover:border-white/[0.14] hover:bg-white/[0.03]"
                >
                  <span className="absolute right-3.5 top-3 font-mono font-medium text-xs text-text-tertiary">
                    {step.number}
                  </span>
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary-muted">
                    <step.icon size={20} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white">{step.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-text-secondary">{step.description}</p>
                  </div>
                </div>
              </AnimateInView>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
