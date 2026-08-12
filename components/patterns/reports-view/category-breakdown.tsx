import { FileBarChart } from "lucide-react";
import { formatCurrency } from "@/lib/formatters/locale";

export function CategoryBreakdown({
  categories,
  currency,
}: {
  categories: { categoryId: string; label: string; amountMinor: number; percentage: number; transactionCount: number }[];
  currency: string;
}) {
  return (
    <section>
      <h2 className="mb-4 text-sm font-semibold text-foreground">Spending by Category</h2>
      <div className="space-y-2">
        {categories.map(cat => (
          <div key={cat.categoryId} className="flex items-center gap-3 rounded-xl border border-border/50 bg-surface px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileBarChart size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{cat.label}</span>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency({ minorValue: cat.amountMinor, currency })}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full rounded-full bg-muted/30 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(cat.percentage * 100, 100)}%` }}
                />
              </div>
              <div className="mt-0.5 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{(cat.percentage * 100).toFixed(1)}%</span>
                <span>{cat.transactionCount} txns</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
