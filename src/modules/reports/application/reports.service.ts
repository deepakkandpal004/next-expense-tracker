import type { ResolvedPeriod } from "@/src/common/domain/types";
import type { ReportData } from "../infrastructure/report-data.repository";
import {
  fetchReportData,
} from "../infrastructure/report-data.repository";
import {
  getForecastSummaries,
  getMonthlySpending,
  getCategoryMonthlySpending,
  type ForecastSummaries,
} from "../infrastructure/forecast.repository";
import {
  getCachedCashFlowProjection,
  getCashFlowProjection,
} from "../infrastructure/cash-flow.repository";

export async function getReportData(
  period: ResolvedPeriod,
  monthsBack?: number,
): Promise<ReportData> {
  return fetchReportData('', monthsBack);
}

export async function getCachedReportData(
  userId: string,
  monthsBack?: number,
): Promise<ReportData> {
  return fetchReportData(userId, monthsBack);
}

export async function fetchForecastSummaries(
  userId: string,
  monthsBack?: number,
): Promise<ForecastSummaries> {
  return getForecastSummaries(userId, monthsBack);
}

export async function fetchMonthlySpending(
  userId: string,
  monthsBack?: number,
) {
  return getMonthlySpending(userId, monthsBack);
}

export async function fetchCategoryMonthlySpending(
  userId: string,
  monthsBack?: number,
) {
  return getCategoryMonthlySpending(userId, monthsBack);
}

export async function fetchCashFlowProjection(
  userId: string,
  period: ResolvedPeriod,
  currency?: string,
) {
  return getCashFlowProjection(userId, period, currency);
}

export async function fetchCachedCashFlowProjection(
  userId: string,
  period: ResolvedPeriod,
  currency?: string,
) {
  return getCachedCashFlowProjection(userId, period, currency);
}
