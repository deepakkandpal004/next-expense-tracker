import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/src/modules/auth";
import { SettingsView } from "@/src/modules/settings/presentation";

export const metadata: Metadata = { title: "Settings – Expense Tracker AI" };

export default async function SettingsRoute() {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");

  return <SettingsView />;
}
