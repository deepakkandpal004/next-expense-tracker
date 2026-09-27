"use client";
import { BarChart2, PlusCircle, Target } from "lucide-react";
import { AnimateInView } from "./shared";

const workflowSteps = [
  {
    number: "01",
    icon: PlusCircle,
    title: "Instant Transaction Entry",
    description: "Record expenses or incomes in seconds with automatic category inference.",
    color: "#7585F8",
    surface: "bg-primary/10",
  },
  {
    number: "02",
    icon: BarChart2,
    title: "Continuous Runway Tracking",
    description: "Calculates safe-to-spend allowances against upcoming recurring obligations.",
    color: "#37C98C",
    surface: "bg-emerald-500/10",
  },
  {
    number: "03",
    icon: Target,
    title: "Predictable Financial Growth",
    description: "Keep budgets intact and hit savings targets with calm monthly pacing.",
    color: "#F0B66A",
    surface: "bg-amber-500/10",
  },
];

export function HowItWorksSection() {
  return (
    <section id="about" className="relative isolate overflow-hidden border-t border-white/[0.06] bg-bg-base py-16 sm:py-20 scroll-mt-20">
      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-8">
        <div className="text-center">
          <AnimateInView>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              How it works
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-text-secondary">
              A straightforward workflow designed to keep your financial life organized with zero friction.
            </p>
          </AnimateInView>

          <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <AnimateInView key={step.number} delay={index * 0.05}>
                <div
                  className="group relative flex h-full flex-col items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 text-center transition-colors hover:border-white/[0.14] hover:bg-white/[0.03]"
                >
                  <span className="absolute right-3.5 top-3 font-mono font-medium text-xs text-text-tertiary">
                    {step.number}
                  </span>
                  <div className={`mt-2 flex size-10 items-center justify-center rounded-lg ${step.surface}`}>
                    <step.icon size={20} style={{ color: step.color }} />
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
