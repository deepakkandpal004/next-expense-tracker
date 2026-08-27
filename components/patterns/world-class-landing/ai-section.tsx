"use client";
import { motion } from "motion/react";
import { Bell, Brain, TrendingUp } from "lucide-react";
import { AnimateInView, SectionPill } from "./shared";

export function AISection() {
  const insights = [
    {
      icon: Brain,
      title: "Smart Categorization",
      desc: "AI automatically categorizes your transactions",
    },
    {
      icon: TrendingUp,
      title: "Spending Predictions",
      desc: "Forecast monthly expenses before they happen",
    },
    {
      icon: Bell,
      title: "Proactive Alerts",
      desc: "Get notified before exceeding budgets",
    },
  ];

  return (
    <section className="relative isolate overflow-hidden border-b border-white/[0.06] bg-black py-14 sm:py-16">
      {/* Background: dot grid + soft glows */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-[-10%] top-[-20%] h-[500px] w-[500px] rounded-full bg-primary/[0.04] blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-5%] h-[400px] w-[400px] rounded-full bg-kpi-savings/[0.035] blur-[120px]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage: "radial-gradient(ellipse 65% 55% at 50% 50%, black 20%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 65% 55% at 50% 50%, black 20%, transparent 100%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-8">
<div className="text-center">
          <AnimateInView>
            <SectionPill>AI-Powered</SectionPill>
            <h2 className="font-bold mt-6 text-5xl tracking-tight text-white sm:text-6xl">
              Intelligence that works for you
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-lg text-muted-foreground">
              Our AI understands your spending patterns and provides actionable
              insights to help you save more and spend smarter.
            </p>
          </AnimateInView>

          <div className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-3">
              {insights.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                   className="group flex flex-col items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center transition-all duration-300 hover:border-primary/20 hover:bg-primary/[0.04]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/[0.1] transition-transform duration-300 group-hover:scale-105">
                    <item.icon size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-base text-white">{item.title}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
        </div>
      </div>
    </section>
  );
}
