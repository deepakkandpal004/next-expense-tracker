"use client";

import { motion } from "motion/react";
import {
  BarChart3,
  Target,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { DashboardPreview } from "./dashboard-preview";

export function HeroSection() {
  return (
    <section className="relative isolate -mt-[69px] overflow-hidden bg-bg-base">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 bg-primary-muted blur-[100px]" />
      </div>

      <div className="relative z-10 pt-[150px] sm:pt-[175px] lg:pt-[190px]">
        <div className="mx-auto max-w-5xl px-6 text-center sm:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Know exactly where your
            <br />
            money goes.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg"
          >
            Log expenses in seconds, set monthly budgets, and see what you can
            safely spend.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              href="/sign-up"
              className="group inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-foreground-inverse transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.99]"
            >
              Get started free
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>

            <Link
              href="/features"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.03] px-5 text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.99]"
            >
              Explore features
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          >
            {[
              {
                icon: Target,
                label: "Monthly budgets",
              },
              {
                icon: ShieldCheck,
                label: "Private by default",
              },
              {
                icon: BarChart3,
                label: "Safe-to-spend tracking",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <span
                  key={item.label}
                  className="flex items-center gap-1.5 text-xs font-medium text-text-tertiary"
                >
                  <Icon size={14} className="text-primary" />
                  {item.label}
                </span>
              );
            })}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-12 flex w-full justify-center px-4 sm:px-6 lg:px-8"
        >
          <DashboardPreview />
        </motion.div>
        <div className="h-12 sm:h-16" />
      </div>
    </section>
  );
}
