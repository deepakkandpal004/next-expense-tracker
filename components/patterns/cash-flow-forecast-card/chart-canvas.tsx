"use client";

import { useMemo } from "react";
import { Chart as ChartCanvas } from "react-chartjs-2";
import type { CashFlowProjection } from "@/lib/domain/cash-flow";
import { buildData, buildOptions } from "./chart";

export function CashFlowChartCanvas({ projection }: { projection: CashFlowProjection }) {
  const data = useMemo(() => buildData(projection), [projection]);
  const options = useMemo(() => buildOptions(projection.currency), [projection.currency]);

  return <ChartCanvas aria-label={`Day-by-day projected balance for ${projection.period.label}`} data={data} options={options} role="img" tabIndex={-1} type="line" />;
}
