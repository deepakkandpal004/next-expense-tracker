import { AlertTriangle, Clock, Info, Lightbulb } from "lucide-react";
import type { BudgetMetric, CategoryBreakdownRow, ResolvedPeriod } from "@/src/common/domain/types";
import { formatCurrency, formatPercentage } from "@/src/common/formatters/locale";
import type { AISuggestion, ForecastData } from "./types";

export function calculateForecast(
  spentMinor: number,
  period: ResolvedPeriod,
): ForecastData {
  const now = new Date();
  const startDate = new Date(period.start);
  const endDate = new Date(period.end);

  const totalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const elapsedDays = Math.max(
    1,
    Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const remainingDays = Math.max(0, totalDays - elapsedDays);

  const dailyRate = spentMinor / elapsedDays;
  const projectedTotal = dailyRate * totalDays;

  return {
    projectedTotal,
    dailyRate,
    daysRemaining: remainingDays,
    daysInPeriod: totalDays,
    daysElapsed: elapsedDays,
    onPace: projectedTotal <= spentMinor * 1.1,
  };
}

export function generateAISuggestions(
  budget: BudgetMetric,
  forecast: ForecastData,
  categoryBreakdown: readonly CategoryBreakdownRow[],
): AISuggestion[] {
  const suggestions: AISuggestion[] = [];

  if (budget.status === "exceeded") {
    suggestions.push({
      type: "warning",
      title: "Budget exceeded",
      description: `You've exceeded your budget by ${formatCurrency({ minorValue: budget.excessMinor, currency: budget.currency })}. Consider reducing spending in the remaining days.`,
      icon: AlertTriangle,
    });
  } else if (budget.status === "approaching") {
    suggestions.push({
      type: "warning",
      title: "Approaching limit",
      description: `You've used ${formatPercentage(budget.utilization)} of your budget with ${forecast.daysRemaining} days remaining. Pace yourself carefully.`,
      icon: AlertTriangle,
    });
  }

  if (forecast.dailyRate > 0 && forecast.daysRemaining > 0) {
    const topCategory = categoryBreakdown[0];
    if (topCategory && topCategory.percentage > 0.4) {
      suggestions.push({
        type: "insight",
        title: "Category concentration",
        description: `${topCategory.label} accounts for ${formatPercentage(topCategory.percentage)} of spending. Diversifying could help balance your budget.`,
        icon: Info,
      });
    }
  }

  if (budget.status === "on-track" && forecast.daysRemaining > 7) {
    suggestions.push({
      type: "tip",
      title: "On track",
      description: "Great job! You're within budget with time to spare. Consider setting aside savings for unexpected expenses.",
      icon: Lightbulb,
    });
  }

  if (forecast.daysRemaining <= 5 && budget.status !== "exceeded") {
    suggestions.push({
      type: "tip",
      title: "Month ending soon",
      description: `${forecast.daysRemaining} days left. ${budget.status === "approaching" ? "Be mindful of spending." : "You're doing well!"}`,
      icon: Clock,
    });
  }

  return suggestions;
}
