"use client";

import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { cn } from "@/src/common/ui/cn";
import { Button } from "@/src/common/ui";

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
        "h-full rounded-2xl border border-border bg-surface p-4 flex flex-col items-center justify-center gap-2",
        className,
      )}
    >
      <Button
        label="Create insights"
        icon={<Sparkles size={16} strokeWidth={2.2} />}
        loading={loading}
        onClick={onGenerate}
      />
    </motion.div>
  );
}
