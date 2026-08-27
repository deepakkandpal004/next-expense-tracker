import { formatCurrency } from "@/lib/formatters/locale";

export function SummaryCards({
  totalIncomeMinor,
  totalExpenseMinor,
  netMinor,
  currency,
}: {
  totalIncomeMinor: number;
  totalExpenseMinor: number;
  netMinor: number;
  currency: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-border/50 bg-surface p-4">
        <p className="text-xs text-muted-foreground">Total Income</p>
        <p className="mt-1 text-xl font-bold text-success">
          {formatCurrency({ minorValue: totalIncomeMinor, currency })}
        </p>
      </div>
      <div className="rounded-xl border border-border/50 bg-surface p-4">
        <p className="text-xs text-muted-foreground">Total Expenses</p>
        <p className="mt-1 text-xl font-bold text-danger">
          {formatCurrency({ minorValue: totalExpenseMinor, currency })}
        </p>
      </div>
      <div className="rounded-xl border border-border/50 bg-surface p-4">
        <p className="text-xs text-muted-foreground">Net</p>
        <p className={`mt-1 text-xl font-bold ${netMinor >= 0 ? "text-success" : "text-danger"}`}>
          {formatCurrency({ minorValue: netMinor, currency })}
        </p>
      </div>
    </div>
  );
}
