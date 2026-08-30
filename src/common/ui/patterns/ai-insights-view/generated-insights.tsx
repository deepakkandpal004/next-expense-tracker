"use client";

import { ShieldCheck, ArrowUpRight, AlertTriangle, Lightbulb, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/src/common/ui/cn";
import type { AIInsight } from "@/src/integrations/openai";

export function AiGeneratedInsights({ insights }: { insights: AIInsight[] }) {
  return (
    <section className="rounded-2xl w-full border border-white/[0.08] bg-surface p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div>
            <h2 className="text-sm font-bold text-foreground">AI-Generated Insights</h2>
            <p className="text-[11px] text-foreground-secondary">Derived from summary aggregate figures</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400 font-mono">
          <ShieldCheck size={12} />
          <span className="hidden sm:inline font-sans">Summary Only</span>
        </span>
      </div>

      {insights.length === 0 && (
        <div className="rounded-xl border border-dashed border-border/60 p-8 text-center">
          <Lightbulb size={24} className="mx-auto text-primary/60 mb-2" />
          <p className="text-sm text-foreground font-medium">No AI observations generated yet for this period</p>
          <p className="text-xs text-foreground-secondary mt-1">Click &ldquo;Generate AI narrative&rdquo; above to analyze spending patterns.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {insights.map((insight) => {
          const isWarning =
            insight.type === "warning" ||
            insight.title.toLowerCase().includes("unusual") ||
            insight.title.toLowerCase().includes("alert") ||
            insight.title.toLowerCase().includes("spike");

          const isOpportunity =
            insight.title.toLowerCase().includes("saving") ||
            insight.title.toLowerCase().includes("cut") ||
            insight.title.toLowerCase().includes("opportunity") ||
            insight.title.toLowerCase().includes("budget");

          return (
            <div
              key={insight.id}
              className={cn(
                "rounded-xl border p-4.5 transition-all relative overflow-hidden group",
                isWarning
                  ? "border-danger/30 bg-danger/[0.04] hover:border-danger/50"
                  : isOpportunity
                  ? "border-primary/30 bg-primary/[0.03] hover:border-primary/50"
                  : "border-white/[0.08] bg-surface-subtle hover:border-primary/30"
              )}
            >
              <div className="flex px-5 py-2 items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {isWarning ? (
                    <AlertTriangle size={15} className="text-danger shrink-0" />
                  ) : (
                    <SparklesIcon size={15} className="text-primary shrink-0" />
                  )}
                  <h3 className={cn("text-sm font-semibold tracking-tight", isWarning ? "text-danger" : "text-foreground")}>
                    {insight.title}
                  </h3>
                </div>

                {insight.confidence !== undefined && (
                  <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary sm:px-3 sm:text-[11px]">
                    {Math.round(insight.confidence * 100)}% confidence
                  </span>
                )}
              </div>

              <p className="mt-2 text-xs mb-3 sm:text-sm text-foreground-secondary leading-relaxed pl-5 sm:pl-6">
                {insight.message}
              </p>

              {insight.action && (
                <div className="mt-3.5 px-5 py-2 mb-2 pl-5 sm:pl-6 flex items-center gap-3">
                  <Link
                    href={insight.action.startsWith("/") ? insight.action : "/records"}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover hover:underline underline-offset-4"
                  >
                    <span>{insight.action.startsWith("/") ? "Drill into details" : insight.action}</span>
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
