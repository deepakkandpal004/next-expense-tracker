import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/data/dashboard";
import { resolveValidReportingPeriod } from "@/lib/domain/reporting-period";
import { toSearchParams } from "@/lib/domain/search-params";
import { BudgetPage } from "@/components/patterns/budget-page";

export const metadata: Metadata = { title: "Budget – Expense AI" };

interface BudgetPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function BudgetRoute({ searchParams }: BudgetPageProps) {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");

  const query = await searchParams;
  const { period } = resolveValidReportingPeriod(toSearchParams(query));
  const dashboard = await getDashboardData(user.id, period);

  return (
    <BudgetPage
      budget={dashboard.kpis.budget}
      categoryBreakdown={dashboard.categoryBreakdown}
      currency={dashboard.currency}
      resolvedPeriod={dashboard.period}
    />
  );
}
