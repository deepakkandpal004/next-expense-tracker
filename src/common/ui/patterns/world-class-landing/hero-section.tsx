"use client";

import { motion } from "motion/react";
import {
  BarChart3,
  Target,
  Zap,
  ArrowRight,
  Play,
} from "lucide-react";
import Link from "next/link";
import { FloatingShapes } from "./shared";
import { DashboardPreview } from "./dashboard-preview";

export function HeroSection() {
  return (
    <section className="relative isolate -mt-[76px] overflow-hidden bg-bg-base">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <FloatingShapes />
        <div className="absolute left-1/2 top-[18%] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary/[0.055] blur-[140px]" />
        <div className="absolute left-1/2 top-[65%] h-[400px] w-[900px] -translate-x-1/2 rounded-full bg-kpi-savings/[0.035] blur-[160px]" />
      </div>

      <div className="relative z-10 pt-[160px] sm:pt-[185px] lg:pt-[210px]">
        <div className="mx-auto max-w-6xl px-6 text-center sm:px-8">
          <motion.div
            initial={{
              opacity: 0,
              y: 18,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.6,
              delay: 0.1,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex justify-center"
          >
          </motion.div>

          <motion.h1
            initial={{
              opacity: 0,
              y: 28,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="font-space-grotesk mt-7 text-5xl leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-[76px]"
          >
            Track every expense.
            <br />

            <span className="bg-gradient-to-r from-primary via-kpi-savings to-success bg-clip-text text-transparent">
              Master every month.
            </span>
          </motion.h1>

          <motion.p
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              delay: 0.35,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8"
          >
            Expense Tracker AI automatically categorizes your
            transactions, keeps your budgets on track, and
            predicts your spending — so you always know where
            your money goes.
          </motion.p>
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              delay: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              href="/sign-up"
              className="group relative flex h-14 items-center gap-2.5 rounded-2xl bg-primary px-8 text-base font-semibold text-foreground-inverse shadow-[0_0_25px_var(--primary-muted)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_35px_var(--primary-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base active:scale-[0.97]"
            >
              Get started free

              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/features"
              className="group flex h-14 items-center gap-2.5 rounded-2xl border border-white/[0.12] bg-white/[0.035] px-7 text-base font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-white/[0.2] hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base active:scale-[0.97]"
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-white/[0.08] transition-all duration-300 group-hover:bg-white/[0.14]">
                <Play
                  size={13}
                  fill="currentColor"
                  className="ml-0.5"
                />
              </span>

              See how it works
            </Link>
          </motion.div>
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.65,
            }}
            className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
          >
            {[
              {
                icon: Zap,
                label: "Auto-categorization",
              },
              {
                icon: Target,
                label: "Budget alerts",
              },
              {
                icon: BarChart3,
                label: "AI predictions",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <span
                  key={item.label}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
                >
                  <span className="flex size-6 items-center justify-center rounded-full border border-primary/10 bg-primary/[0.08]">
                    <Icon
                      size={12}
                      className="text-primary"
                    />
                  </span>

                  {item.label}
                </span>
              );
            })}
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-14 flex w-full justify-center px-4 sm:px-6 lg:px-8"
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[55%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.09] blur-[140px]" />
          <DashboardPreview />
        </motion.div>
        <div className="h-12 sm:h-16 lg:h-20" />
      </div>
    </section>
  );
}
