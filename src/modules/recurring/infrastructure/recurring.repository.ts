import { Decimal } from "@prisma/client/runtime/library";
import { db } from "@/src/database/client";
import { nextRecurrenceOccurrence } from "@/src/common/utils/date-boundaries";

export async function processDueRecurringRecords(userId: string): Promise<number> {
  const recurringRecords = await db.recurringRecord.findMany({
    where: { userId, active: true },
  });

  const now = new Date();
  const toCreate: Array<{ text: string; amount: number | Decimal; type: string; category: string; date: Date; userId: string; recurringId: string }> = [];
  const toUpdate: Array<{ id: string; lastProcessed: Date }> = [];

  for (const record of recurringRecords) {
    const base = record.lastProcessed || record.startDate;
    let nextDue = nextRecurrenceOccurrence(base, record.frequency, record.interval);

    // Create every occurrence that came due since the last run instead of just
    // one per run (a missed cron run used to lose occurrences forever).
    // Capped so a very stale or misconfigured rule can't spin the loop forever.
    let lastDue: Date | null = null;
    let iterations = 0;
    while (nextDue <= now && iterations < 31) {
      if (record.endDate && nextDue > record.endDate) break;

      toCreate.push({
        text: record.text,
        amount: record.amount,
        type: record.type,
        category: record.category,
        date: nextDue,
        userId,
        recurringId: record.id,
      });
      lastDue = nextDue;

      nextDue = nextRecurrenceOccurrence(nextDue, record.frequency, record.interval);
      iterations += 1;
    }

    if (lastDue) toUpdate.push({ id: record.id, lastProcessed: lastDue });
  }

  if (toCreate.length === 0) return 0;

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

export async function findActiveByUser(userId: string) {
  return db.recurringRecord.findMany({ where: { userId, active: true } });
}

export async function findByUser(userId: string) {
  return db.recurringRecord.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

export async function findByIdAndUser(id: string, userId: string) {
  return db.recurringRecord.findFirst({ where: { id, userId } });
}

export async function create(data: {
  userId: string;
  text: string;
  amount: number;
  type: string;
  category: string;
  frequency: string;
  interval: number;
  startDate: Date;
  endDate?: Date | null;
}) {
  return db.recurringRecord.create({ data });
}

export async function remove(id: string, userId: string) {
  const found = await db.recurringRecord.findFirst({ where: { id, userId } });
  if (!found) return null;
  return db.recurringRecord.delete({ where: { id } });
}

export async function toggle(id: string, active: boolean, userId: string) {
  const found = await db.recurringRecord.findFirst({ where: { id, userId } });
  if (!found) return null;
  return db.recurringRecord.update({ where: { id }, data: { active } });
}
