"use server";

import { getAuthUser } from "@/lib/auth";
import { getMoneyLeakReport } from "@/lib/data/money-leaks";
import type { MoneyLeakReport } from "@/lib/domain/money-leaks";
import type { ActionResult, ResolvedPeriod } from "@/lib/domain/types";

/**
 * Deterministic money-leak scan for a period. App-computed truth (never AI);
 * the savings figures derive from the user's own trailing-month median.
 */
export async function getMoneyLeaks(
  period: ResolvedPeriod,
): Promise<ActionResult<MoneyLeakReport, never>> {
  const user = await getAuthUser();
  if (!user) {
    return { status: "error", message: "Sign in to continue.", retryable: false };
  }

  try {
    const report = await getMoneyLeakReport(user.id, period);
    return { status: "success", message: "Money leak scan ready.", data: report };
  } catch (error) {
    console.error("Money leak scan failed", error);
    return {
      status: "error",
      message: "Could not scan for money leaks.",
      retryable: true,
    };
  }
}