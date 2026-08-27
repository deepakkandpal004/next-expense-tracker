import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/src/modules/auth";
import { CategoriesView } from "@/src/modules/categories/presentation";

export const metadata: Metadata = { title: "Categories – Expense Tracker AI" };

export default async function CategoriesRoute() {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");

  return <CategoriesView currency={user.currency ?? "INR"} />;
}
