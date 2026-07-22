"use client";

import { motion } from "motion/react";
import { Bot } from "lucide-react";
import { cn } from "@/lib/ui/cn";

interface GreetingBannerProps {
  greeting: string;
  userName: string;
  className?: string;
}

export function GreetingBanner({ greeting, userName, className }: GreetingBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-surface via-surface to-primary/5 p-4",
        className,
      )}
    >
      <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-primary/5 blur-[50px] pointer-events-none" aria-hidden="true" />
      <div className="relative flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-foreground">
            {greeting}, {userName} 👋
          </h2>
          <p className="mt-0.5 text-xs text-foreground-secondary">
            Here&apos;s what changed in your finances this month.
          </p>
        </div>
        <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Bot size={20} strokeWidth={1.5} />
        </div>
      </div>
    </motion.div>
  );
}
