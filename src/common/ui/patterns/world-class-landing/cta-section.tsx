"use client";
import { ArrowRight } from "lucide-react";
import { AnimateInView } from "./shared";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="relative isolate border-t border-white/[0.06] bg-bg-base py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-6 text-center sm:px-8">
        <AnimateInView>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Start tracking today.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm sm:text-base text-text-secondary leading-relaxed">
            Free forever. No card required, no limits on transactions.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="group inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-foreground-inverse transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.99]"
            >
              Create free account
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/features"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-5 text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.99]"
            >
              Explore features
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3 text-xs text-text-tertiary">
            <span>Free forever</span>
            <span className="h-2.5 w-px bg-white/10" />
            <span>No credit card</span>
            <span className="h-2.5 w-px bg-white/10" />
            <span>Export anytime</span>
          </div>
        </AnimateInView>
      </div>
    </section>
  );
}
