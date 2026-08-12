import type { ReportData } from "@/app/actions/getReportData";

export function exportCsv(data: ReportData) {
  const header = "Month,Income,Expense,Net,Transactions";
  const rows = data.monthly.map(m =>
    `${m.month},${(m.incomeMinor / 100).toFixed(2)},${(m.expenseMinor / 100).toFixed(2)},${(m.netMinor / 100).toFixed(2)},${m.transactionCount}`
  );
  const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "spending-report.csv";
  a.click();
  URL.revokeObjectURL(url);
}
