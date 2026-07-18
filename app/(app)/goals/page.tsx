import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { SavingsGoalsPage } from "@/components/patterns/savings-goals-page";

export const metadata: Metadata = { title: "Savings Goals – Expense AI" };

export default async function GoalsRoute() {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");

  return <SavingsGoalsPage />;
}
