import { db } from "../db";

/**
 * Generates a Record row for every due recurring rule belonging to the user,
 * advancing each rule's `lastProcessed` cursor. Returns the number of rows
 * created. Called both by the "Process now" action and the scheduled cron.
 */
export async function processDueRecurringRecords(userId: string): Promise<number> {
  const recurringRecords = await db.recurringRecord.findMany({
    where: { userId, active: true },
  });

  let created = 0;
  const now = new Date();

  for (const record of recurringRecords) {
    const base = record.lastProcessed || record.startDate;
    const nextDue = new Date(base);

    switch (record.frequency) {
      case 'daily': nextDue.setDate(nextDue.getDate() + record.interval); break;
      case 'weekly': nextDue.setDate(nextDue.getDate() + 7 * record.interval); break;
      case 'monthly': nextDue.setMonth(nextDue.getMonth() + record.interval); break;
      case 'yearly': nextDue.setFullYear(nextDue.getFullYear() + record.interval); break;
    }

    if (nextDue > now) continue;
    if (record.endDate && nextDue > record.endDate) continue;

    await db.record.create({
      data: {
        text: record.text,
        amount: record.amount,
        type: record.type,
        category: record.category,
        date: nextDue,
        userId,
        recurringId: record.id,
      },
    });

    await db.recurringRecord.update({
      where: { id: record.id },
      data: { lastProcessed: nextDue },
    });

    created += 1;
  }

  return created;
}
