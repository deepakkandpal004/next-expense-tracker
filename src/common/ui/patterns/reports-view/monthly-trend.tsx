import { SparkBar } from "./spark-bar";

export function MonthlyTrend({
  monthly,
  maxIncome,
  maxExpense,
}: {
  monthly: { month: string; incomeMinor: number; expenseMinor: number }[];
  maxIncome: number;
  maxExpense: number;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground">Monthly trend</h2>
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-end justify-between gap-2" style={{ minHeight: 160 }}>
          {monthly.map(m => (
            <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex gap-0.5">
                <SparkBar value={m.incomeMinor} max={maxIncome} color="#37C98C" />
                <SparkBar value={m.expenseMinor} max={maxExpense} color="#F16F6F" />
              </div>
              <span className="text-[10px] text-muted-foreground">{m.month.slice(5)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> Income</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-danger" /> Expenses</span>
        </div>
      </div>
    </section>
  );
}
