import { X } from "lucide-react";
import { motion } from "motion/react";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/ui/motion";

export function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: MOTION_DURATION.fast, ease: MOTION_EASE.standard }}
      className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent"
    >
      {label}
      <button
        onClick={onRemove}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-accent/20"
        type="button"
        aria-label={`Remove filter: ${label}`}
      >
        <X size={10} strokeWidth={2.5} />
      </button>
    </motion.span>
  );
}
