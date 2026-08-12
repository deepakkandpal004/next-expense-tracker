import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIInsight } from "@/lib/ai";

export function AiGeneratedInsights({ insights }: { insights: AIInsight[] }) {
  return (
    <section className="rounded-xl border border-border/50 bg-surface p-4 space-y-4">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Sparkles size={12} />
        </span>
        <h2 className="text-sm font-semibold text-foreground">AI Insights Timeline</h2>
      </div>

      {insights.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No AI insights yet for this period. Click Generate to create them.
        </p>
      )}

      <div className="space-y-3">
        {insights.map((insight) => {
          const isUnusual =
            insight.type === "warning" ||
            insight.title.toLowerCase().includes("unusual") ||
            insight.title.toLowerCase().includes("alert") ||
            insight.title.toLowerCase().includes("spike");

          return (
            <div
              key={insight.id}
              className={cn(
                "rounded-xl border p-4 transition-all",
                isUnusual
                  ? "border-danger/25 bg-danger/5"
                  : "border-border/50 bg-surface hover:border-primary/30"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className={cn("text-sm font-semibold", isUnusual ? "text-danger" : "text-foreground")}>
                  {insight.title}
                </h3>
                {insight.confidence !== undefined && (
                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {Math.round(insight.confidence * 100)}% match
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-foreground-secondary leading-relaxed">
                {insight.message}
              </p>
              {insight.action && (
                <div className="mt-3">
                  <a
                    href={insight.action.startsWith("/") ? insight.action : "/budgets"}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline underline-offset-4"
                  >
                    <span>{insight.action.startsWith("/") ? "View Action" : insight.action}</span>
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
