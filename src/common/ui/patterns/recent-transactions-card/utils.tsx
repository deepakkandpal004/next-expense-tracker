import { CreditCard, DollarSign } from "lucide-react";
import type { ReactNode } from "react";
import type { TransactionType } from "@/src/common/domain/types";

const CATEGORY_ICON: Record<string, ReactNode> = {
  Food: <DollarSign size={16} strokeWidth={2.2} />,
  Transportation: <CreditCard size={16} strokeWidth={2.2} />,
  Shopping: <DollarSign size={16} strokeWidth={2.2} />,
  Entertainment: <DollarSign size={16} strokeWidth={2.2} />,
  Bills: <CreditCard size={16} strokeWidth={2.2} />,
  Healthcare: <DollarSign size={16} strokeWidth={2.2} />,
  Income: <DollarSign size={16} strokeWidth={2.2} />,
  Other: <DollarSign size={16} strokeWidth={2.2} />,
};

export function categoryIcon(categoryId: string): ReactNode {
  return CATEGORY_ICON[categoryId] ?? CATEGORY_ICON.Other;
}

export function relativeDate(isoString: string): string {
  const now = new Date();
  const date = new Date(isoString);
  const nowDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const targetDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const diffMs = nowDay.getTime() - targetDay.getTime();
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function getPaymentMethodIcon(type: TransactionType): ReactNode {
  return type === "income" ? <DollarSign size={14} strokeWidth={2.2} /> : <CreditCard size={14} strokeWidth={2.2} />;
}
