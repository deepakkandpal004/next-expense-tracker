import * as React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TrendDeltaProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number; // percentage value e.g. 12.5 or -4.2
  type?: "income" | "expense" | "generic";
  showIcon?: boolean;
  className?: string;
}

export function TrendDelta({
  value,
  type = "generic",
  showIcon = true,
  className,
  ...props
}: TrendDeltaProps) {
  if (value === 0 || isNaN(value)) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-0.5 text-xs font-semibold text-[#5B6472]",
          className
        )}
        {...props}
      >
        {showIcon && <Minus className="w-3.5 h-3.5" />}
        0.0%
      </span>
    );
  }

  const isPositive = value > 0;
  
  // Semantic color calculation:
  // For income/generic: positive is success (#22C55E), negative is danger (#F04438).
  // For expense: positive means spending increased (danger #F04438), negative means spending decreased (success #22C55E).
  let isGood = isPositive;
  if (type === "expense") {
    isGood = !isPositive;
  }

  const colorClass = isGood 
    ? "text-[#22C55E] bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.2)]" 
    : "text-[#F04438] bg-[rgba(240,68,56,0.12)] border border-[rgba(240,68,56,0.2)]";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold font-geist",
        colorClass,
        className
      )}
      {...props}
    >
      {showIcon && (
        isPositive ? (
          <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
        ) : (
          <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
        )
      )}
      {isPositive ? `+${value.toFixed(1)}%` : `${value.toFixed(1)}%`}
    </span>
  );
}
