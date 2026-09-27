"use client";

import { motion } from "motion/react";
import {
  BarChart3,
  Target,
  ShieldCheck,
  ArrowRight,
  Play,
} from "lucide-react";
import Link from "next/link";
import { DashboardPreview } from "./dashboard-preview";

export function HeroSection() {
  return (
    <section className="relative isolate -mt-[76px] overflow-hidden bg-bg-base">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 bg-primary/[0.04] blur-[100px]" />
      </div>

      <div className="relative z-10 pt-[150px] sm:pt-[175px] lg:pt-[190px]">
        <div className="mx-auto max-w-5xl px-6 text-center sm:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Personal finance with
            <br />
            <span className="bg-gradient-to-r from-primary via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              clarity, precision, and privacy.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg"
          >
            A high-precision expense tracker with automated cadence budgeting,
            real-time runway calculations, and instant ledger analytics.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              href="/sign-up"
              className="group inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-color-text-inverse transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.99]"
            >
              Get started free
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>

            <Link
              href="/features"
              className="group inline-flex h-11 items-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.03] px-5 text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.99]"
            >
              <Play
                size={13}
                fill="currentColor"
                className="text-text-secondary group-hover:text-white"
              />
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
                label: "Cadence Budgeting",
              },
              {
                icon: ShieldCheck,
                label: "Privacy-First Architecture",
              },
              {
                icon: BarChart3,
                label: "Runway Forecasting",
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
