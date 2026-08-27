import { formatCurrency } from "@/lib/formatters/locale";

export function MonthlyTable({
  monthly,
  currency,
}: {
  monthly: { month: string; incomeMinor: number; expenseMinor: number; netMinor: number; transactionCount: number }[];
  currency: string;
}) {
  return (
    <section>
      <h2 className="mb-4 text-sm font-semibold text-foreground">Monthly Breakdown</h2>
      <div className="overflow-x-auto rounded-xl border border-border/50">
        <table className="w-full min-w-max text-left text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/20">
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Month</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Income</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Expenses</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Net</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">Txns</th>
            </tr>
          </thead>
          <tbody>
            {monthly.map(m => (
              <tr key={m.month} className="border-b border-border/30 last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">{m.month}</td>
                <td className="px-4 py-3 text-right text-success">
                  {formatCurrency({ minorValue: m.incomeMinor, currency })}
                </td>
                <td className="px-4 py-3 text-right text-danger">
                  {formatCurrency({ minorValue: m.expenseMinor, currency })}
                </td>
                <td className={`px-4 py-3 text-right font-semibold ${m.netMinor >= 0 ? "text-success" : "text-danger"}`}>
                  {formatCurrency({ minorValue: m.netMinor, currency })}
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
