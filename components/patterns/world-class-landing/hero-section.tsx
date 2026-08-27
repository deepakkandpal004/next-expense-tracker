"use client";

import { motion } from "motion/react";
import {
  BarChart3,
  Target,
  Zap,
  ArrowRight,
  Play,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FloatingShapes } from "./shared";

export function HeroSection() {
  return (
    <section className="relative isolate -mt-[76px] overflow-hidden bg-bg-base">
      {/* =========================
          BACKGROUND
      ========================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <FloatingShapes />

        {/* Main hero glow */}
        <div className="absolute left-1/2 top-[18%] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary/[0.055] blur-[140px]" />

        {/* Dashboard glow */}
        <div className="absolute left-1/2 top-[65%] h-[400px] w-[900px] -translate-x-1/2 rounded-full bg-kpi-savings/[0.035] blur-[160px]" />
      </div>

      <div className="relative z-10 pt-[160px] sm:pt-[185px] lg:pt-[210px]">
        {/* =========================
            HERO CONTENT
        ========================== */}
        <div className="mx-auto max-w-6xl px-6 text-center sm:px-8">
          {/* Badge */}
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
            <span className="rainbow relative isolate inline-flex overflow-hidden rounded-full p-px shadow-[0_0_30px_rgba(34,211,238,0.14)]">
              <span className="relative z-10 inline-flex items-center gap-3 rounded-full bg-bg-base/90 px-5 py-2 text-sm font-medium tracking-wide backdrop-blur-xl">
                <span className="text-white">
                  AI-Powered
                </span>

                <span className="h-4 w-px bg-white/10" />

                <span className="text-muted-foreground">
                  Expense Tracking
                </span>
              </span>
            </span>
          </motion.div>

          {/* Headline */}
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

          {/* Subtitle */}
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

          {/* =========================
              CTA BUTTONS
          ========================== */}
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
            {/* Primary CTA */}
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

            {/* Secondary CTA */}
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

          {/* =========================
              FEATURE STRIP
          ========================== */}
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

        {/* =========================
            HERO IMAGE
        ========================== */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-12 flex w-full justify-center px-6 sm:px-8"
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[45%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.07] blur-[120px]" />

          <Image
            src="/hero.png"
            alt="Expense Tracker AI dashboard preview"
            width={952}
            height={717}
            priority
            sizes="100vw"
            className="block h-auto max-w-full object-contain drop-shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
          />
        </motion.div>

        {/* Bottom spacing */}
        <div className="h-12 sm:h-16 lg:h-20" />
      </div>
    </section>
  );
}
