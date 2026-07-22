"use client";

import { motion } from "motion/react";
import { Sparkles, Upload, FileText, ArrowRight } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { listItemVariants } from "@/lib/ui/motion";

interface ActivityItem {
  icon: string;
  label: string;
  timestamp: string;
  type: "ai" | "import" | "budget";
}

interface RecentActivityProps {
  activities: ActivityItem[];
  className?: string;
}

const ICON_MAP = {
  ai: <Sparkles size={12} className="text-primary" />,
  import: <Upload size={12} className="text-success" />,
  budget: <FileText size={12} className="text-warning" />,
};

const ICON_BG_MAP = {
  ai: "bg-primary/10",
  import: "bg-success-surface",
  budget: "bg-warning-surface",
};

export function RecentActivity({ activities, className }: RecentActivityProps) {
  if (activities.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "rounded-xl border border-border/50 bg-surface p-4",
        className,
      )}
    >
      <h3 className="text-sm font-semibold text-foreground mb-2">
        Recent activity
      </h3>
      <motion.ul
        className="space-y-2"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.04 } },
        }}
      >
        {activities.map((activity, index) => (
          <motion.li
            key={`${activity.type}-${index}`}
            variants={listItemVariants}
            className="flex items-center gap-2"
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                ICON_BG_MAP[activity.type],
              )}
            >
              {ICON_MAP[activity.type]}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{activity.label}</p>
              <p className="text-[10px] text-foreground-secondary">{activity.timestamp}</p>
            </div>
          </motion.li>
        ))}
      </motion.ul>
      <a
        href="/records"
        className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
      >
        View all activity
        <ArrowRight size={10} strokeWidth={2.5} />
      </a>
    </motion.div>
  );
}
