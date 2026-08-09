"use server";

import { getAuthUser } from "@/lib/auth";
import { getCashFlowProjection } from "@/lib/data/cash-flow";
import type { CashFlowProjection } from "@/lib/domain/cash-flow";
import type { ActionResult, ResolvedPeriod } from "@/lib/domain/types";

/**
 * Loads the deterministic cash-flow projection for a reporting period.
 * Server-only data access; the caller (client component) receives the
 * ready-to-render projection and never queries the database directly.
 */
export async function getCashFlowForecast(
  period: ResolvedPeriod,
): Promise<ActionResult<CashFlowProjection, never>> {
  const user = await getAuthUser();
  if (!user) {
    return { status: "error", message: "Sign in to continue.", retryable: false };
  }

  try {
    const projection = await getCashFlowProjection(user.id, period, user.currency);
    return { status: "success", message: "Cash-flow forecast ready.", data: projection };
  } catch (error) {
    console.error("Cash-flow forecast failed", error);
    return {
      status: "error",
      message: "Could not build the cash-flow forecast.",
      retryable: true,
    };
  }
}