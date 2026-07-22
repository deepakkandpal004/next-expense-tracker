"use client";

import { motion } from "motion/react";
import { CheckCircle2, Info, ArrowRight } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { listItemVariants } from "@/lib/ui/motion";

interface DataSource {
  label: string;
  available: boolean;
}

interface DataSourcesProps {
  sources: DataSource[];
  className?: string;
}

export function DataSources({ sources, className }: DataSourcesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "rounded-xl border border-border/50 bg-surface p-4",
        className,
      )}
    >
      <h3 className="text-sm font-semibold text-foreground mb-2">
        Data used for analysis
      </h3>
      <motion.ul
        className="space-y-1.5"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.03 } },
        }}
      >
        {sources.map((source) => (
          <motion.li
            key={source.label}
            variants={listItemVariants}
            className="flex items-center justify-between py-0.5"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2
                size={12}
                className={cn(
                  source.available ? "text-success" : "text-foreground-secondary/30",
                )}
              />
              <span className="text-xs text-foreground">{source.label}</span>
            </div>
            <button
              type="button"
              className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white/5 text-foreground-secondary/50 hover:bg-white/10 hover:text-foreground-secondary transition-colors"
              aria-label={`Info about ${source.label}`}
            >
              <Info size={9} />
            </button>
          </motion.li>
        ))}
      </motion.ul>
      <a
        href="/ai-transparency"
        className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
      >
        Learn more about data usage
        <ArrowRight size={10} strokeWidth={2.5} />
      </a>
    </motion.div>
  );
}
