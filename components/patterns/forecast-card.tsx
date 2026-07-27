"use client";

import { motion } from "motion/react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { getForecastSnapshot, type ForecastSnapshot } from "@/app/actions/getForecastSnapshot";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { formatCurrency } from "@/lib/formatters/locale";
import { listItemVariants } from "@/lib/ui/motion";
import type { ResolvedPeriod } from "@/lib/domain/types";

interface ForecastCardProps {
  period: ResolvedPeriod;
  currency: string;
  className?: string;
}

export function ForecastCard({ period, currency, className }: ForecastCardProps) {
  const [data, setData] = useState<ForecastSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getForecastSnapshot(period);
    if (result.status === "success") setData(result.data);
    setLoading(false);
  }, [period]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="h-40 animate-pulse rounded-xl bg-card/50" />
    );
  }

  if (!data || data.forecast.status === "insufficient-data") {
    return null;
  }

  const { forecast, anomalies } = data;
  const trendIcon = forecast.trend === "increasing"
    ? <TrendingUp className="size-4 text-[#F04438]" />
    : forecast.trend === "decreasing"
    ? <TrendingDown className="size-4 text-[#22C55E]" />
    : <Minus className="size-4 text-muted-foreground" />;

  const trendLabel = forecast.trend === "increasing" ? "Rising" : forecast.trend === "decreasing" ? "Declining" : "Stable";

  const highAnomalies = anomalies.filter(a => a.severity === "high");

  return (
    <motion.div variants={listItemVariants} className={className}>
      <Card>
        <CardHeader>
          <CardTitle>Spending Forecast</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Predicted next month</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency({ minorValue: forecast.predictedNextMonthMinor, currency })}
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
              {trendIcon}
              <span>{trendLabel}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg bg-muted/50 p-2.5">
              <p className="text-muted-foreground">Monthly average</p>
              <p className="mt-0.5 font-semibold text-foreground">
                {formatCurrency({ minorValue: forecast.averageMonthlyMinor, currency })}
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2.5">
              <p className="text-muted-foreground">Confidence</p>
              <p className="mt-0.5 font-semibold text-foreground capitalize">
                {forecast.confidence}
              </p>
            </div>
          </div>

          {forecast.monthsAnalyzed > 0 && (
            <p className="text-xs text-muted-foreground">
              Based on {forecast.monthsAnalyzed} month{forecast.monthsAnalyzed > 1 ? "s" : ""} of data
              {forecast.changePercent !== 0 && (
                <> &middot; {forecast.trend === "increasing" ? "+" : ""}{forecast.changePercent}% vs earlier</>
              )}
            </p>
          )}

          {highAnomalies.length > 0 && (
            <div className="rounded-lg border border-[#F04438]/20 bg-[#F04438]/5 p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#F04438]">
                <AlertTriangle className="size-3.5" />
                <span>{highAnomalies.length} unusual transaction{highAnomalies.length > 1 ? "s" : ""} detected</span>
              </div>
              {highAnomalies.slice(0, 3).map(a => (
                <div key={a.transactionId} className="flex items-center justify-between text-xs">
                  <span className="truncate text-muted-foreground">{a.description}</span>
                  <span className="font-medium text-foreground ml-2">
                    {formatCurrency({ minorValue: a.amountMinor, currency })} ({a.deviationMultiplier}x)
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
