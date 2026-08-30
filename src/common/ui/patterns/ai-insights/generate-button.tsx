"use client";

import { motion } from "motion/react";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/src/common/ui/cn";

interface GenerateButtonProps {
  onGenerate: () => void;
  loading?: boolean;
  className?: string;
}

export function GenerateButton({ onGenerate, loading = false, className }: GenerateButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "h-full rounded-xl border border-border/50 bg-surface p-4 flex flex-col items-center gap-2",
        className,
      )}
    >
      <button
        onClick={onGenerate}
        disabled={loading}
        className={cn(
          "flex items-center justify-center gap-2 rounded-xl bg-primary px-16 py-7 text-lg font-bold text-primary-foreground transition-all duration-300",
          "hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(0,245,255,0.3)] hover:scale-[1.02]",
          "active:scale-[0.98]",
          "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none",
        )}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Sparkles size={14} strokeWidth={2.2} />
        )}
        {loading ? "Generating..." : "Generate New Insights"}
      </button>
    </motion.div>
  );
}
