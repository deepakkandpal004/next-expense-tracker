import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { SettingsView } from "@/components/patterns/settings-view";

export const metadata: Metadata = { title: "Settings – Expense AI" };

export default async function SettingsRoute() {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");

  return <SettingsView />;
}
