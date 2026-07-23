import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100 or raw amount
  max?: number;  // limit or target
  variant?: "auto" | "primary" | "success" | "warning" | "danger";
  height?: number | string;
  showValueLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  variant = "auto",
  height = "8px",
  showValueLabel = false,
  className,
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(Math.max(0, (value / (max || 1)) * 100), 100);

  // Auto variant maps percentage to semantic colors:
  // <75% -> success (#22C55E)
  // 75%-99% -> warning (#F5A623)
  // >=100% -> danger (#F04438)
  let fillColor = "bg-[#00DCE5]";
  if (variant === "auto") {
    const rawRatio = value / (max || 1);
    if (rawRatio >= 1.0) {
      fillColor = "bg-[#F04438]";
    } else if (rawRatio >= 0.75) {
      fillColor = "bg-[#F5A623]";
    } else {
      fillColor = "bg-[#22C55E]";
    }
  } else if (variant === "success") {
    fillColor = "bg-[#22C55E]";
  } else if (variant === "warning") {
    fillColor = "bg-[#F5A623]";
  } else if (variant === "danger") {
    fillColor = "bg-[#F04438]";
  } else if (variant === "primary") {
    fillColor = "bg-[#00DCE5]";
  }

  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)} {...props}>
      <div
        className="w-full bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden relative"
        style={{ height }}
      >
        <div
          className={cn("h-full transition-all duration-300 rounded-full", fillColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValueLabel && (
        <div className="flex justify-between text-xs text-[#9AA3AF] font-geist">
          <span>{percentage.toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
}
