"use client";
import { BarChart3, Bot, Globe, ShieldCheck, Target, Zap } from "lucide-react";
import { AnimateInView } from "./shared";

const features = [
  {
    icon: BarChart3,
    title: "Real-Time Runway Analytics",
    description: "Dynamic safe-to-spend calculations, monthly burn rate pacing, and verified balance tracking.",
    color: "#7585F8",
    bgColor: "rgba(117,133,248,0.1)",
    span: "lg:col-span-2 lg:row-span-2",
    featured: true,
  },
  {
    icon: Bot,
    title: "Smart Categorization",
    description: "Automatic suggestions based on merchant rules and recurring transaction patterns.",
    color: "#A855F7",
    bgColor: "rgba(168,85,247,0.1)",
    span: "lg:col-span-1",
    featured: false,
  },
  {
    icon: Target,
    title: "Cadence Budgeting",
    description: "Monthly and custom interval budget thresholds with visual utilization gauges.",
    color: "#37C98C",
    bgColor: "rgba(55,201,140,0.1)",
    span: "lg:col-span-1",
    featured: false,
  },
  {
    icon: ShieldCheck,
    title: "Privacy by Design",
    description: "Zero raw merchant leakage. Only aggregated category summaries are analyzed on-demand.",
    color: "#3B82F6",
    bgColor: "rgba(59,130,246,0.1)",
    span: "lg:col-span-1",
    featured: false,
  },
  {
    icon: Zap,
    title: "Instant Ledger Sync",
    description: "Fast, optimistic mutations with server-side idempotency protection and Redis caching.",
    color: "#F0B66A",
    bgColor: "rgba(240,182,106,0.1)",
    span: "lg:col-span-1",
    featured: false,
  },
  {
    icon: Globe,
    title: "Multi-Currency Support",
    description: "Seamless support for major international currencies with localized decimal formatting.",
    color: "#F16F6F",
    bgColor: "rgba(241,111,111,0.1)",
    span: "lg:col-span-1",
    featured: false,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative isolate overflow-hidden bg-bg-base py-16 sm:py-20 scroll-mt-20 border-t border-white/[0.06]">
      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-8">
        {/* Header */}
        <AnimateInView className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Engineered for financial control.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-text-secondary leading-relaxed">
            Every feature is built for high information density, strict mathematical accuracy, and effortless day-to-day use.
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
                <div className="flex size-10 items-center justify-center rounded-lg border border-white/[0.08]" style={{ backgroundColor: feature.bgColor }}>
                  <feature.icon size={20} style={{ color: feature.color }} />
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
                      <span>Pacing vs Target</span>
                      <span className="text-emerald-400 font-semibold font-mono">+18.4% surplus</span>
                    </div>
                    <div className="mt-2.5 flex items-end gap-1.5 h-10">
                      {[35, 45, 30, 60, 50, 70, 80, 65, 75, 90, 60, 95].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-sm bg-primary/40 hover:bg-primary transition-colors"
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
