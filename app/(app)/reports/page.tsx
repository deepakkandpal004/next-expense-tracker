import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { resolveValidReportingPeriod } from "@/lib/domain/reporting-period";
import { toSearchParams } from "@/lib/domain/search-params";
import { ReportsView } from "@/components/patterns/reports-view";

export const metadata: Metadata = { title: "Reports – Expense AI" };

interface ReportsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ReportsRoute({ searchParams }: ReportsPageProps) {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");

  const query = await searchParams;
  const { period } = resolveValidReportingPeriod(toSearchParams(query));

  return <ReportsView period={period} currency={user.currency ?? "INR"} />;
}
