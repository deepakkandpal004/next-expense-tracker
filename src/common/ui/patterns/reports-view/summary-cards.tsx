import { CurrencyText } from "@/src/common/ui";

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
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="text-xs text-muted-foreground">Total income</p>
        <p className="mt-1 text-xl font-bold text-success">
          <CurrencyText currency={currency} minorValue={totalIncomeMinor} />
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="text-xs text-muted-foreground">Total expenses</p>
        <p className="mt-1 text-xl font-bold text-danger">
          <CurrencyText currency={currency} minorValue={totalExpenseMinor} />
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="text-xs text-muted-foreground">Net</p>
        <p className={`mt-1 text-xl font-bold ${netMinor >= 0 ? "text-success" : "text-danger"}`}>
          <CurrencyText currency={currency} minorValue={netMinor} />
        </p>
      </div>
    </div>
  );
}
