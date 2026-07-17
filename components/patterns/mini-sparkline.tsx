"use client";

import { useId } from "react";
import { cn } from "@/lib/ui/cn";

export interface MiniSparklineProps {
  /** Data points, chronologically ordered. At least 2 points required to render. */
  data: readonly number[];
  /** CSS color for the stroke and gradient fill. Accepts `var(--color-*)`. */
  color: string;
  /** Rendered height in pixels. Width auto-fits the container. */
  height?: number;
  className?: string;
}

/**
 * Compact, purely-decorative area chart. Not interactive. Renders `null` when
 * fewer than two points are available so cards can compact gracefully.
 */
export function MiniSparkline({ data, color, height = 40, className }: MiniSparklineProps) {
  const gradientId = useId().replace(/:/g, "");
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  const flat = range === 0;
  const denominator = flat ? 1 : range;

  const stepX = 100 / (data.length - 1);
  const linePoints = data
    .map((value, index) => {
      const x = index * stepX;
      const y = flat ? 50 : 100 - ((value - min) / denominator) * 90 - 5;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  const areaPoints = `0,100 ${linePoints} 100,100`;

  return (
    <svg
      aria-hidden="true"
      className={cn("block w-full", className)}
      preserveAspectRatio="none"
      role="presentation"
      style={{ height, color }}
      viewBox="0 0 100 100"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradientId})`} />
      <polyline
        fill="none"
        points={linePoints}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
