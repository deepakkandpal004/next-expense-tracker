import { db } from "../db";
import type { ResolvedPeriod, Transaction } from "../domain/types";
import { toDashboardTransactionDTO, DEFAULT_CURRENCY, type DashboardRecordRow } from "./dashboard";

function boundaryAtStart(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function boundaryAtEnd(date: string): Date {
  return new Date(`${date}T23:59:59.999Z`);
}

/**
 * Loads exactly the authorized, inclusive period-scoped transactions for one
 * user. This is the only supported record source for new route composition;
 * it never returns records from other users and never falls back to an
 * unscoped query.
 */
export async function getRecordsForPeriod(
  userId: string,
  period: ResolvedPeriod,
  currency: string = DEFAULT_CURRENCY,
): Promise<readonly Transaction[]> {
  const rows: readonly DashboardRecordRow[] = await db.record.findMany({
    where: {
      userId,
      date: { gte: boundaryAtStart(period.start), lte: boundaryAtEnd(period.end) },
    },
    orderBy: { date: "desc" },
  });

  return rows.map((row) => toDashboardTransactionDTO(row, currency));
}
