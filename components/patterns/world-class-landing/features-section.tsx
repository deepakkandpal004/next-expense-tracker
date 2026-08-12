"use client";
import { motion } from "motion/react";
import { BarChart3, Brain, Globe, Shield, Target, Zap } from "lucide-react";
import { AnimateInView, SectionPill } from "./shared";

const features = [
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description: "Beautiful charts and insights that help you understand where your money goes.",
    color: "#00DCE5",
    bgColor: "rgba(0,220,229,0.08)",
    span: "lg:col-span-2 lg:row-span-2",
    featured: true,
  },
  {
    icon: Brain,
    title: "AI Categorization",
    description: "Automatically categorize transactions with AI-powered suggestions.",
    color: "#A855F7",
    bgColor: "rgba(168,85,247,0.08)",
    span: "lg:col-span-1",
    featured: false,
  },
  {
    icon: Target,
    title: "Budget Tracking",
    description: "Set budgets and track progress with real-time alerts.",
    color: "#22C55E",
    bgColor: "rgba(34,197,94,0.08)",
    span: "lg:col-span-1",
    featured: false,
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "Your data is encrypted and secure. We never sell your information.",
    color: "#3B82F6",
    bgColor: "rgba(59,130,246,0.08)",
    span: "lg:col-span-1",
    featured: false,
  },
  {
    icon: Zap,
    title: "Instant Sync",
    description: "Real-time updates across all your devices. Always up to date.",
    color: "#FBBF24",
    bgColor: "rgba(251,191,36,0.08)",
    span: "lg:col-span-1",
    featured: false,
  },
  {
    icon: Globe,
    title: "Multi-Currency",
    description: "Track expenses in multiple currencies with automatic conversion.",
    color: "#F04438",
    bgColor: "rgba(240,68,56,0.08)",
    span: "lg:col-span-1",
    featured: false,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative isolate overflow-hidden bg-black py-14 sm:py-16 scroll-mt-20">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#00DCE5]/[0.03] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-8">
        {/* Header */}
        <AnimateInView className="text-center">
          <SectionPill>Features</SectionPill>
          <h2 className="font-bold tracking-tight mt-6 text-5xl text-white sm:text-6xl">
            Everything you need
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-[#9AA3AF]">
            Powerful tools designed to give you clarity and control over your money.
          </p>
        </AnimateInView>

        {/* Bento Grid */}
        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(180px,auto)] grid-flow-dense">
          {features.map((feature, index) => (
            <AnimateInView
              key={feature.title}
              delay={index * 0.08}
              className={feature.span}
            >
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="group relative h-full overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.04] hover:shadow-[0_0_40px_rgba(0,220,229,0.06)]"
              >
                {/* Hover glow */}
                <div
                  className="pointer-events-none absolute -inset-1 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
                  style={{ backgroundColor: feature.bgColor }}
                />

                <div className="relative z-10 flex h-full flex-col">
                  {/* Icon */}
                  <div
                    className="flex size-12 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: feature.bgColor }}
                  >
                    <feature.icon size={24} style={{ color: feature.color }} />
                  </div>

                  {/* Content */}
                  <h3 className="font-semibold tracking-wide mt-5 text-xl text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#9AA3AF]">
                    {feature.description}
                  </p>

                  {/* Featured card extra content */}
                  {feature.featured && (
                    <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <div className="flex items-center justify-between text-xs font-medium text-[#9AA3AF]/60">
                        <span>This month</span>
                        <span className="text-[#00DCE5]">+24% savings</span>
                      </div>
                      <div className="mt-3 flex items-end gap-1 h-12">
                        {[30, 45, 35, 60, 50, 70, 85, 65, 75, 90, 55, 95].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t-sm bg-gradient-to-t from-[#00DCE5]/20 to-[#00DCE5]/60"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  );
}
