"use client";

import { motion } from "motion/react";
import { TrendingUp, Lightbulb, AlertTriangle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { listItemVariants } from "@/lib/ui/motion";
import type { AiInsightCard } from "@/app/actions/getAiFinancialInsights";

interface TopInsightsProps {
  insights: AiInsightCard[];
  className?: string;
}

const INSIGHT_CONFIG = {
  "spending-trend": {
    icon: <TrendingUp size={18} strokeWidth={2.2} />,
    iconBg: "bg-danger-surface",
    iconColor: "text-danger",
    badge: "SPENDING TREND",
    badgeColor: "text-danger",
    cardBorder: "border-danger/20",
  },
  "savings-opportunity": {
    icon: <Lightbulb size={18} strokeWidth={2.2} />,
    iconBg: "bg-warning-surface",
    iconColor: "text-warning",
    badge: "SAVINGS OPPORTUNITY",
    badgeColor: "text-warning",
    cardBorder: "border-warning/20",
  },
  "unusual-activity": {
    icon: <AlertTriangle size={18} strokeWidth={2.2} />,
    iconBg: "bg-danger-surface",
    iconColor: "text-danger",
    badge: "UNUSUAL ACTIVITY",
    badgeColor: "text-danger",
    cardBorder: "border-danger/20",
  },
  "budget-alert": {
    icon: <AlertTriangle size={18} strokeWidth={2.2} />,
    iconBg: "bg-warning-surface",
    iconColor: "text-warning",
    badge: "BUDGET ALERT",
    badgeColor: "text-warning",
    cardBorder: "border-warning/20",
  },
  positive: {
    icon: <TrendingUp size={18} strokeWidth={2.2} />,
    iconBg: "bg-success-surface",
    iconColor: "text-success",
    badge: "POSITIVE TREND",
    badgeColor: "text-success",
    cardBorder: "border-success/20",
  },
};

function InsightCard({ insight }: { insight: AiInsightCard }) {
  const config = INSIGHT_CONFIG[insight.type];

  return (
    <motion.article
      variants={listItemVariants}
      className={cn(
        "relative overflow-hidden rounded-xl border bg-surface p-4 transition-all duration-300 hover:shadow-lg flex flex-col",
        config.cardBorder,
      )}
    >
      <div className="flex items-start gap-3 mb-2">
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
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
      <p className="text-xs text-foreground-secondary leading-relaxed flex-1 pl-11">
        {insight.description}
      </p>
      {insight.actionLabel && insight.actionHref && (
        <a
          href={insight.actionHref}
          className="mt-2 ml-11 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
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
      <div className="mb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10">
            <span className="text-primary text-[10px]">✦</span>
          </span>
          <h2 className="text-sm font-semibold text-foreground" id="top-ai-insights-title">
            Top AI Insights
          </h2>
        </div>
        <p className="mt-0.5 text-xs text-foreground-secondary">
          Personalized insights based on your spending behavior.
        </p>
      </div>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3"
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
    </section>
  );
}
