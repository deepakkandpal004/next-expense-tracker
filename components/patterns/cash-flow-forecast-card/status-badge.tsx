"use client";

import { motion } from "motion/react";
import { Clock, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/ui/cn";

export function StatusBadge({ state, netPositive }: { state: string; netPositive: boolean }) {
  if (state === "ended") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold text-foreground-secondary">
        <Clock size={12} aria-hidden="true" />
        Period ended
      </span>
    );
  }

  return (
    <motion.span
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold",
        netPositive
          ? "bg-[#4ADE80]/10 text-[#4ADE80]"
          : "bg-[#F5A524]/10 text-[#F5A524]",
      )}
    >
      {netPositive ? (
        <TrendingUp aria-hidden="true" size={12} />
      ) : (
        <TrendingDown aria-hidden="true" size={12} />
      )}
      {netPositive ? "Surplus" : "Deficit"} projected
    </motion.span>
  );
}
