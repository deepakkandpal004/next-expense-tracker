import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/src/modules/auth";
import { SavingsGoalsPage } from "@/src/modules/goals/presentation";

export const metadata: Metadata = { title: "Savings Goals – Expense Tracker AI" };

export default async function GoalsRoute() {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");

  return <SavingsGoalsPage currency={user.currency} />;
}
