import type { SidebarDestinationId } from "../app-sidebar";

export function currentDestinationId(pathname: string): SidebarDestinationId {
  if (pathname.startsWith("/records")) return "transactions";
  if (pathname.startsWith("/ai-insights")) return "ai-insights";
  if (pathname.startsWith("/budgets")) return "budgets";
  if (pathname.startsWith("/goals")) return "goals";
  if (pathname.startsWith("/recurring")) return "recurring";
  if (pathname.startsWith("/categories")) return "categories";
  if (pathname.startsWith("/reports")) return "reports";
  if (pathname.startsWith("/settings")) return "settings";
  return "dashboard";
}

export const NAV_ROUTE: Record<SidebarDestinationId, string> = {
  dashboard: "/dashboard",
  transactions: "/records",
  "ai-insights": "/ai-insights",
  budgets: "/budgets",
  goals: "/goals",
  categories: "/categories",
  recurring: "/recurring",
  reports: "/reports",
  settings: "/settings",
};

export function hrefFor(destination: keyof typeof NAV_ROUTE): string {
  return NAV_ROUTE[destination];
}