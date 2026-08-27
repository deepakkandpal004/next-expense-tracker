import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/src/modules/auth";
import { getCachedDashboardData } from "@/src/modules/dashboard";
import { resolveValidReportingPeriod } from "@/lib/domain/reporting-period";
import { toSearchParams } from "@/lib/domain/search-params";
import { BudgetPage } from "@/src/modules/budgets/presentation";

export const metadata: Metadata = { title: "Budget – Expense Tracker AI" };

interface BudgetPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function BudgetRoute({ searchParams }: BudgetPageProps) {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");

  const query = await searchParams;
  const { period } = resolveValidReportingPeriod(toSearchParams(query));
  const dashboard = await getCachedDashboardData(user.id, period, user.currency);

  return (
    <BudgetPage
      budget={dashboard.kpis.budget}
      categoryBreakdown={dashboard.categoryBreakdown}
      currency={dashboard.currency}
      resolvedPeriod={dashboard.period}
    />
  );
}
