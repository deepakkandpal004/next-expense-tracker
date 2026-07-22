"use client";

import { motion } from "motion/react";
import { LineChart, Lightbulb, FileBarChart, Download } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { listItemVariants } from "@/lib/ui/motion";

interface QuickActionsProps {
  className?: string;
}

const ACTIONS = [
  {
    icon: <LineChart size={16} strokeWidth={2} />,
    label: "View charts",
    href: "/dashboard",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: <Lightbulb size={16} strokeWidth={2} />,
    label: "Saving tips",
    href: "/goals",
    color: "text-warning",
    bg: "bg-warning-surface",
  },
  {
    icon: <FileBarChart size={16} strokeWidth={2} />,
    label: "Monthly report",
    href: "/budgets",
    color: "text-info",
    bg: "bg-info-surface",
  },
  {
    icon: <Download size={16} strokeWidth={2} />,
    label: "Export PDF",
    href: "/records?export=pdf",
    color: "text-success",
    bg: "bg-success-surface",
  },
];

export function QuickActions({ className }: QuickActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "rounded-xl border border-border/50 bg-surface p-4",
        className,
      )}
    >
      <h3 className="text-sm font-semibold text-foreground mb-2">
        Quick actions
      </h3>
      <motion.div
        className="grid grid-cols-2 gap-2"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.03 } },
        }}
      >
        {ACTIONS.map((action) => (
          <motion.a
            key={action.label}
            variants={listItemVariants}
            href={action.href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg border border-border/30 bg-white/5 p-2.5 transition-all duration-200",
              "hover:bg-white/10 hover:border-border/50 hover:shadow-md",
              "active:scale-[0.97]",
            )}
          >
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg",
                action.bg,
                action.color,
              )}
            >
              {action.icon}
            </span>
            <span className="text-[10px] font-medium text-foreground text-center leading-tight">
              {action.label}
            </span>
          </motion.a>
        ))}
      </motion.div>
    </motion.div>
  );
}
