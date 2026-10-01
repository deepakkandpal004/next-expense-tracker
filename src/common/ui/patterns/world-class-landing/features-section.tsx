"use client";
import { BarChart3, Bot, Globe, ShieldCheck, Target, Zap } from "lucide-react";
import { AnimateInView } from "./shared";

const features = [
  {
    icon: BarChart3,
    title: "Safe-to-spend",
    description: "See how much you can spend today without blowing this month's budget.",
    span: "lg:col-span-2 lg:row-span-2",
    featured: true,
  },
  {
    icon: Bot,
    title: "Auto-categorization",
    description: "The app learns your habits and sorts new transactions for you.",
    span: "lg:col-span-1",
    featured: false,
  },
  {
    icon: Target,
    title: "Budgets",
    description: "Set monthly limits per category and watch them fill as you spend.",
    span: "lg:col-span-1",
    featured: false,
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    description: "AI insights only see category totals, never your merchant names or notes.",
    span: "lg:col-span-1",
    featured: false,
  },
  {
    icon: Zap,
    title: "Instant updates",
    description: "Add a transaction and every number on the page updates right away.",
    span: "lg:col-span-1",
    featured: false,
  },
  {
    icon: Globe,
    title: "Multiple currencies",
    description: "Track in rupees, dollars, or whatever you actually use.",
    span: "lg:col-span-1",
    featured: false,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative isolate overflow-hidden bg-bg-base py-16 sm:py-20 scroll-mt-20 border-t border-white/[0.06]">
      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-8">
        {/* Header */}
        <AnimateInView>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            What you get.
          </h2>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-text-secondary leading-relaxed">
            Simple tools that do the math for you.
          </p>
        </AnimateInView>

        {/* Bento Grid */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(180px,auto)] grid-flow-dense">
          {features.map((feature, index) => (
            <AnimateInView
              key={feature.title}
              delay={index * 0.05}
              className={feature.span}
            >
              <div
                className="group relative flex h-full flex-col rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 transition-colors hover:border-white/[0.14] hover:bg-white/[0.03]"
              >
                <div className="flex size-10 items-center justify-center rounded-lg border border-white/[0.08] bg-primary-muted">
                  <feature.icon size={20} className="text-primary" />
                </div>

                <h3 className="mt-4 text-base font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-1.5 flex-1 text-xs leading-relaxed text-text-secondary">
                  {feature.description}
                </p>

                {feature.featured && (
                  <div className="mt-5 rounded-lg border border-white/[0.06] bg-black/40 p-3.5">
                    <div className="flex items-center justify-between text-xs font-medium text-text-tertiary">
                      <span>Budget pacing</span>
                      <span className="text-emerald-400 font-semibold font-mono">₹4,210 under budget</span>
                    </div>
                    <div className="mt-2.5 flex items-end gap-1.5 h-10">
                      {[35, 45, 30, 60, 50, 70, 80, 65, 75, 90, 60, 95].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-sm bg-primary-muted hover:bg-primary transition-colors"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  );
}
