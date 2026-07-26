import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { resolveValidReportingPeriod } from "@/lib/domain/reporting-period";
import { ReportsView } from "@/components/patterns/reports-view";

export const metadata: Metadata = { title: "Reports – Expense AI" };

interface ReportsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function toSearchParams(query: Record<string, string | string[] | undefined>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === "string") params.set(key, value);
    else if (Array.isArray(value) && value.length > 0) params.set(key, value[0]);
  }
  return params;
}

export default async function ReportsRoute({ searchParams }: ReportsPageProps) {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");

  const query = await searchParams;
  const { period } = resolveValidReportingPeriod(toSearchParams(query));

  return <ReportsView period={period} currency={user.currency ?? "INR"} />;
}
