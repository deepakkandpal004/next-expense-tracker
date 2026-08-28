/**
 * Reports module — forecast, cash-flow, report data.
 */
export * from "./domain/reports.domain";
export {
  getForecastSummaries,
  getMonthlySpending,
  getCategoryMonthlySpending,
} from "./infrastructure/forecast.repository";
export {
  getCashFlowProjection,
  getCachedCashFlowProjection,
  buildScheduledEvents,
} from "./infrastructure/cash-flow.repository";
export {
  getMoneyLeakReport,
  getCachedMoneyLeakReport,
} from "./infrastructure/money-leaks.repository";
export type {
  MonthlyReportRow,
  CategoryReportRow,
  ReportData,
} from "./infrastructure/report-data.repository";
export {
  fetchReportData,
  getCachedReportData,
} from "./infrastructure/report-data.repository";
export {
  getReportData,
} from "./application/reports.service";
