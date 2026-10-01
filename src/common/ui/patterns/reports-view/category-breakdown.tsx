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
import { getCategoryDefinition } from "@/src/common/domain/categories";
import { CurrencyText } from "@/src/common/ui";
import { formatPercentage } from "@/src/common/formatters/locale";

const ICONS = {
  Utensils,
  Car,
  ShoppingBag,
  Film,
  Receipt,
  HeartPulse,
  CircleDollarSign,
  Shapes,
} as const;

export function CategoryBreakdown({
  categories,
  currency,
}: {
  categories: { categoryId: string; label: string; amountMinor: number; percentage: number; transactionCount: number }[];
  currency: string;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground">Spending by category</h2>
      <div className="space-y-3">
        {categories.map(cat => {
          const definition = getCategoryDefinition(cat.categoryId);
          const Icon = ICONS[definition.lucideIcon as keyof typeof ICONS] ?? Shapes;
          const color = `var(--color-${definition.semanticToken})`;
          return (
            <div key={cat.categoryId} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
              <div
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
                  color,
                }}
              >
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{cat.label}</span>
                  <span className="text-sm font-semibold text-foreground">
                    <CurrencyText currency={currency} minorValue={cat.amountMinor} />
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(cat.percentage * 100, 100)}%` }}
                  />
                </div>
                <div className="mt-0.5 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{formatPercentage(cat.percentage, { maximumFractionDigits: 1 })}</span>
                  <span>{cat.transactionCount} transactions</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
