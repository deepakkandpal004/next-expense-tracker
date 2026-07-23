import * as React from "react";
import {
  Utensils,
  Car,
  ShoppingBag,
  Film,
  FileText,
  HeartPulse,
  TrendingUp,
  HelpCircle,
  Briefcase,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_MAP: Record<
  string,
  { label: string; icon: LucideIcon; color: string; bg: string }
> = {
  food: { label: "Food & Dining", icon: Utensils, color: "text-[#00DCE5]", bg: "bg-[rgba(0,220,229,0.12)]" },
  dining: { label: "Food & Dining", icon: Utensils, color: "text-[#00DCE5]", bg: "bg-[rgba(0,220,229,0.12)]" },
  groceries: { label: "Groceries", icon: Utensils, color: "text-[#00DCE5]", bg: "bg-[rgba(0,220,229,0.12)]" },
  transportation: { label: "Transportation", icon: Car, color: "text-[#3B82F6]", bg: "bg-[rgba(59,130,246,0.12)]" },
  travel: { label: "Travel", icon: Car, color: "text-[#3B82F6]", bg: "bg-[rgba(59,130,246,0.12)]" },
  shopping: { label: "Shopping", icon: ShoppingBag, color: "text-[#F5A623]", bg: "bg-[rgba(245,166,35,0.12)]" },
  entertainment: { label: "Entertainment", icon: Film, color: "text-[#EC4899]", bg: "bg-[rgba(236,72,153,0.12)]" },
  bills: { label: "Bills & Utilities", icon: FileText, color: "text-[#8B5CF6]", bg: "bg-[rgba(139,92,246,0.12)]" },
  utilities: { label: "Utilities", icon: FileText, color: "text-[#8B5CF6]", bg: "bg-[rgba(139,92,246,0.12)]" },
  healthcare: { label: "Healthcare", icon: HeartPulse, color: "text-[#F04438]", bg: "bg-[rgba(240,68,56,0.12)]" },
  income: { label: "Income", icon: TrendingUp, color: "text-[#22C55E]", bg: "bg-[rgba(34,197,94,0.12)]" },
  salary: { label: "Salary", icon: Briefcase, color: "text-[#22C55E]", bg: "bg-[rgba(34,197,94,0.12)]" },
  other: { label: "Other", icon: HelpCircle, color: "text-[#9AA3AF]", bg: "bg-[rgba(154,163,175,0.12)]" },
};

export interface CategoryBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  category: string;
  showIcon?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function CategoryBadge({
  category,
  showIcon = true,
  size = "md",
  className,
  ...props
}: CategoryBadgeProps) {
  const normalizedKey = (category || "other").toLowerCase();
  const meta = CATEGORY_MAP[normalizedKey] || {
    label: category || "Other",
    icon: HelpCircle,
    color: "text-[#9AA3AF]",
    bg: "bg-[rgba(154,163,175,0.12)]",
  };

  const IconComponent = meta.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium border border-transparent transition-colors",
        meta.bg,
        meta.color,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        className
      )}
      {...props}
    >
      {showIcon && <IconComponent className={cn("shrink-0", size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5")} />}
      <span>{meta.label}</span>
    </span>
  );
}

export function getCategoryMeta(category: string) {
  const normalizedKey = (category || "other").toLowerCase();
  return CATEGORY_MAP[normalizedKey] || {
    label: category || "Other",
    icon: HelpCircle,
    color: "text-[#9AA3AF]",
    bg: "bg-[rgba(154,163,175,0.12)]",
  };
}
