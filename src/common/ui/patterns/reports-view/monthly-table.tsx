import { CurrencyText } from "@/src/common/ui";

export function MonthlyTable({
  monthly,
  currency,
}: {
  monthly: { month: string; incomeMinor: number; expenseMinor: number; netMinor: number; transactionCount: number }[];
  currency: string;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground">Monthly breakdown</h2>
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-max text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Month</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Income</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Expenses</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Net</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Transactions</th>
            </tr>
          </thead>
          <tbody>
            {monthly.map(m => (
              <tr key={m.month} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">{m.month}</td>
                <td className="px-4 py-3 text-right text-success">
                  <CurrencyText currency={currency} minorValue={m.incomeMinor} />
                </td>
                <td className="px-4 py-3 text-right text-danger">
                  <CurrencyText currency={currency} minorValue={m.expenseMinor} />
                </td>
                <td className={`px-4 py-3 text-right font-semibold ${m.netMinor >= 0 ? "text-success" : "text-danger"}`}>
                  <CurrencyText currency={currency} minorValue={m.netMinor} />
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">{m.transactionCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
