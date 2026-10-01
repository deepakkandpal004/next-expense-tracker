import { motion } from "motion/react";
import { cn } from "@/src/common/ui/cn";

interface PaginationButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  "aria-label"?: string;
}

export function PaginationButton({
  children,
  onClick,
  disabled,
  "aria-label": ariaLabel,
}: PaginationButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150",
        disabled
          ? "cursor-not-allowed text-muted-foreground"
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
      )}
      type="button"
      aria-label={ariaLabel}
      aria-disabled={disabled}
    >
      {children}
    </motion.button>
  );
}