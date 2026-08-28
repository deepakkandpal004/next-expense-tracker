"use client";

import { useMemo } from "react";
import { Chart as ChartCanvas } from "react-chartjs-2";
import { useTheme } from "@/contexts/ThemeContext";
import type { CategoryBreakdownRow } from "@/src/common/domain/types";
import { buildDoughnutData, buildDoughnutOptions } from "./chart";

export function CategoryChartCanvas({ breakdown, currency }: { breakdown: readonly CategoryBreakdownRow[]; currency: string }) {
  const { resolvedAppearance } = useTheme();
  // Rebuild when CSS variable values change with the active appearance.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = useMemo(() => buildDoughnutData(breakdown), [breakdown, resolvedAppearance]);
  const options = useMemo(() => buildDoughnutOptions(currency), [currency]);
  return <ChartCanvas aria-label="Spending by category doughnut chart" data={data} options={options} role="img" tabIndex={-1} type="doughnut" />;
}
