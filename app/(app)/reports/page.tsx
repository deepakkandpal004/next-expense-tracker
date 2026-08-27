import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/src/modules/auth";
import { getCachedReportData } from "@/src/modules/reports";
import { getCachedCashFlowProjection } from "@/src/modules/reports";
import { resolveValidReportingPeriod } from "@/lib/domain/reporting-period";
import { toSearchParams } from "@/lib/domain/search-params";
import { ReportsView } from "@/src/modules/reports/presentation";

export const metadata: Metadata = { title: "Reports – Expense Tracker AI" };

interface ReportsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ReportsRoute({ searchParams }: ReportsPageProps) {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");

  const query = await searchParams;
  const { period } = resolveValidReportingPeriod(toSearchParams(query));

  const [initialData, initialCashFlow] = await Promise.all([
    getCachedReportData(user.id),
    getCachedCashFlowProjection(user.id, period, user.currency ?? "INR"),
  ]);

  return (
    <ReportsView
      currency={user.currency ?? "INR"}
      initialCashFlow={initialCashFlow}
      initialData={initialData}
      period={period}
    />
  );
}
