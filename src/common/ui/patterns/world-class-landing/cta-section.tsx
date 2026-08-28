"use client";
import { ArrowRight } from "lucide-react";
import { AnimateInView } from "./shared";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="relative isolate bg-black py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-6 text-center sm:px-8">
        <AnimateInView>
          <h2 className="font-bold tracking-tight mt-5 text-4xl text-white sm:text-5xl lg:text-6xl">
            Take control of your money.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg font-medium leading-relaxed text-muted-foreground">
            Free expense tracking with AI that actually works. No cards, no fees, no catch.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/sign-up"
              className="flex h-12 items-center gap-2 rounded-xl bg-primary px-7 text-sm font-semibold text-foreground-inverse transition-all duration-200 hover:bg-primary/90 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.98]"
            >
              Get started for free
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/features"
              className="flex h-12 items-center gap-2 rounded-xl border border-white/[0.15] px-7 text-sm font-semibold text-white transition-all duration-200 hover:border-white/[0.25] hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.98]"
            >
              See how it works
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4 text-xs font-medium text-muted-foreground">
            <span>Free to start</span>
            <span className="h-3 w-px bg-white/10" />
            <span>No credit card</span>
            <span className="h-3 w-px bg-white/10" />
            <span>Your data stays yours</span>
          </div>
        </AnimateInView>
      </div>
    </section>
  );
}
