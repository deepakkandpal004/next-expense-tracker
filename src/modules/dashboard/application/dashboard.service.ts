import type { ResolvedPeriod } from "@/src/common/domain/types";
import { getDashboardData, getCachedDashboardData } from "../infrastructure/dashboard.repository";
import { getDashboardBundle } from "../infrastructure/dashboard-bundle.service";
import type { DashboardDTO } from "@/src/common/domain/dashboard";
import type { DashboardBundle } from "../infrastructure/dashboard-bundle.service";

export async function fetchDashboardData(
  userId: string,
  period: ResolvedPeriod,
  currency?: string,
): Promise<DashboardDTO> {
  return getDashboardData(userId, period, currency);
}

export async function fetchCachedDashboardData(
  userId: string,
  period: ResolvedPeriod,
  currency?: string,
): Promise<DashboardDTO> {
  return getCachedDashboardData(userId, period, currency);
}

export async function fetchDashboardBundle(
  userId: string,
  period: ResolvedPeriod,
  currency: string,
): Promise<DashboardBundle> {
  return getDashboardBundle(userId, period, currency);
}
