import { Decimal } from "@prisma/client/runtime/library";
import { db } from "../db";
import { nextRecurrenceOccurrence } from "../utils/date-boundaries";

/**
 * Generates a Record row for every due recurring rule belonging to the user,
 * advancing each rule's `lastProcessed` cursor. Returns the number of rows
 * created. Called both by the "Process now" action and the scheduled cron.
 */
export async function processDueRecurringRecords(userId: string): Promise<number> {
  const recurringRecords = await db.recurringRecord.findMany({
    where: { userId, active: true },
  });

  const now = new Date();
  const toCreate: Array<{ text: string; amount: number | Decimal; type: string; category: string; date: Date; userId: string; recurringId: string }> = [];
  const toUpdate: Array<{ id: string; lastProcessed: Date }> = [];

  for (const record of recurringRecords) {
    const base = record.lastProcessed || record.startDate;
    const nextDue = nextRecurrenceOccurrence(base, record.frequency, record.interval);

    if (nextDue > now) continue;
    if (record.endDate && nextDue > record.endDate) continue;

    toCreate.push({
      text: record.text,
      amount: record.amount,
      type: record.type,
      category: record.category,
      date: nextDue,
      userId,
      recurringId: record.id,
    });
    toUpdate.push({ id: record.id, lastProcessed: nextDue });
  }

  if (toCreate.length === 0) return 0;

  // Batch in a transaction — single round-trip instead of 2*N sequential queries
  await db.$transaction(async (tx) => {
    if (toCreate.length > 0) {
      await tx.record.createMany({ data: toCreate });
    }
    await Promise.all(
      toUpdate.map((u) => tx.recurringRecord.update({ where: { id: u.id }, data: { lastProcessed: u.lastProcessed } })),
    );
  });

  return toCreate.length;
}
