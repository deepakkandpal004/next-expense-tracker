"use client";

import { useId, useRef, useEffect, useState } from "react";
import { cn } from "@/lib/ui/cn";

export interface MiniSparklineProps {
  /** Data points, chronologically ordered. At least 2 points required to render. */
  data: readonly number[];
  /** CSS color for the stroke and gradient fill. Accepts `var(--color-*)`. */
  color: string;
  /** Rendered height in pixels. Width auto-fits the container. */
  height?: number;
  /** Enable stroke draw animation on mount. */
  animated?: boolean;
  className?: string;
}

/**
 * Compact area chart with draw animation and hover effects.
 * Renders `null` when fewer than two points are available.
 */
export function MiniSparkline({ data, color, height = 36, animated = false, className }: MiniSparklineProps) {
  const gradientId = useId().replace(/:/g, "");
  const pathRef = useRef<SVGPolylineElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (animated && pathRef.current) {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
      requestAnimationFrame(() => setShouldAnimate(true));
    }
  }, [animated]);

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
      const y = flat ? 50 : 100 - ((value - min) / denominator) * 80 - 10;
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity={isHovered ? 0.4 : 0.25} />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradientId})`} />
      <polyline
        ref={pathRef}
        fill="none"
        points={linePoints}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={isHovered ? "3" : "2"}
        vectorEffect="non-scaling-stroke"
        style={{
          transition: "stroke-width 0.2s ease, opacity 0.2s ease",
          opacity: isHovered ? 1 : 0.9,
          ...(animated && shouldAnimate && pathLength > 0
            ? {
                strokeDasharray: pathLength,
                strokeDashoffset: pathLength,
                animation: `sparkline-draw 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
              }
            : {}),
        }}
      />
    </svg>
  );
}
