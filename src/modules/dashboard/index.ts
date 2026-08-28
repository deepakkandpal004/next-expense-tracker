/**
 * Dashboard module — composes KPIs, charts, safe-to-spend, cash-flow.
 */
export { getDashboardData, getCachedDashboardData, toDashboardTransactionDTO, DEFAULT_CURRENCY } from "./infrastructure/dashboard.repository";
export { getDashboardBundle } from "./infrastructure/dashboard-bundle.service";
export { aggregateDashboard } from "@/src/common/domain/dashboard";
export type { DashboardDTO } from "@/src/common/domain/dashboard";
export type { DashboardBundle } from "./infrastructure/dashboard-bundle.service";
export { getForecastSnapshot, getCashFlowForecast } from "./application/forecast.service";
export type { ForecastSnapshot } from "./application/forecast.service";
