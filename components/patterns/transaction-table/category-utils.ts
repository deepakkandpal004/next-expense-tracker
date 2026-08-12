import {
  Car,
  CircleDollarSign,
  Film,
  HeartPulse,
  Receipt,
  Shapes,
  ShoppingBag,
  Utensils,
} from "lucide-react";
import { CATEGORY_REGISTRY } from "@/lib/domain/categories";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Utensils,
  Car,
  ShoppingBag,
  Film,
  Receipt,
  HeartPulse,
  CircleDollarSign,
  Shapes,
};

export function getCategoryIcon(categoryId: string) {
  const def = CATEGORY_REGISTRY[categoryId as keyof typeof CATEGORY_REGISTRY];
  if (!def) return Shapes;
  return ICON_MAP[def.lucideIcon] ?? Shapes;
}

export function getCategoryColor(categoryId: string): string {
  const def = CATEGORY_REGISTRY[categoryId as keyof typeof CATEGORY_REGISTRY];
  if (!def) return "var(--color-category-other)";
  return `var(--color-${def.semanticToken})`;
}

export function getMerchantInitials(description: string): string {
  const words = description.trim().split(/\s+/);
  if (words.length === 0) return "??";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function getMerchantColor(description: string): string {
  let hash = 0;
  for (let i = 0; i < description.length; i++) {
    hash = description.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 65%, 50%)`;
}
