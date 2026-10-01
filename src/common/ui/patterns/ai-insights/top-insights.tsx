"use client";

import { motion } from "motion/react";
import { TrendingUp, Lightbulb, AlertTriangle, ArrowRight, Wallet, Bell } from "lucide-react";
import { cn } from "@/src/common/ui/cn";
import { listItemVariants } from "@/src/common/ui/motion";
import type { AiInsightCard } from "@/app/actions/getAiFinancialInsights";

interface TopInsightsProps {
  insights: AiInsightCard[];
  className?: string;
}

const INSIGHT_CONFIG = {
  "spending-trend": {
    icon: <Wallet size={18} strokeWidth={2.2} />,
    iconBg: "bg-danger-surface",
    iconColor: "text-danger",
    badge: "Spending trend",
    badgeColor: "text-danger",
    cardBorder: "border-danger-border",
  },
  "savings-opportunity": {
    icon: <Lightbulb size={18} strokeWidth={2.2} />,
    iconBg: "bg-warning-surface",
    iconColor: "text-warning",
    badge: "Savings opportunity",
    badgeColor: "text-warning",
    cardBorder: "border-warning-border",
  },
  "unusual-activity": {
    icon: <AlertTriangle size={18} strokeWidth={2.2} />,
    iconBg: "bg-danger-surface",
    iconColor: "text-danger",
    badge: "Unusual activity",
    badgeColor: "text-danger",
    cardBorder: "border-danger-border",
  },
  "budget-alert": {
    icon: <Bell size={18} strokeWidth={2.2} />,
    iconBg: "bg-warning-surface",
    iconColor: "text-warning",
    badge: "Budget alert",
    badgeColor: "text-warning",
    cardBorder: "border-warning-border",
  },
  positive: {
    icon: <TrendingUp size={18} strokeWidth={2.2} />,
    iconBg: "bg-success-surface",
    iconColor: "text-success",
    badge: "Positive trend",
    badgeColor: "text-success",
    cardBorder: "border-success-border",
  },
};

function InsightCard({ insight }: { insight: AiInsightCard }) {
  const config = INSIGHT_CONFIG[insight.type];

  return (
    <motion.article
      variants={listItemVariants}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-surface p-4 min-h-[180px] transition-all duration-300 hover:shadow-lg",
        config.cardBorder,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            config.iconBg,
            config.iconColor,
          )}
          aria-hidden="true"
        >
          {config.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn("text-[10px] font-bold uppercase tracking-wider", config.badgeColor)}>
            {config.badge}
          </p>
          <h3 className="mt-0.5 text-sm font-semibold text-foreground">{insight.title}</h3>
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed pl-0 sm:pl-11">
        {insight.description}
      </p>
      {insight.actionLabel && insight.actionHref && (
        <a
          href={insight.actionHref}
          className="mt-3 ml-0 inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors sm:ml-11"
          >
          {insight.actionLabel}
          <ArrowRight size={12} strokeWidth={2.5} />
        </a>
      )}
    </motion.article>
  );
}

export function TopInsights({ insights, className }: TopInsightsProps) {
  if (insights.length === 0) return null;

  return (
    <section
      aria-labelledby="top-ai-insights-title"
      className={cn("", className)}
    >
      <div className="rounded-2xl border border-border bg-surface p-5 transition-all duration-300 hover:shadow-lg flex flex-col">
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground" id="top-ai-insights-title">
            Top insights
          </h2>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Based on your spending in this period.
        </p>
      </div>
      <motion.div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.06 } },
        }}
      >
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </motion.div>
    </div>
    </section>
  );
}
