/**
 * Dashboard module — composes KPIs, charts, safe-to-spend, cash-flow.
 * Pure domain in lib/domain/dashboard + lib/data/dashboard-bundle.
 */
export { getDashboardData, getCachedDashboardData } from "@/lib/data/dashboard";
export { getDashboardBundle } from "@/lib/data/dashboard-bundle";
export { aggregateDashboard } from "@/lib/domain/dashboard";
export type { DashboardDTO } from "@/lib/domain/dashboard";
