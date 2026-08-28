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

export async function remove(id: string) {
  return db.recurringRecord.delete({ where: { id } });
}

export async function toggle(id: string, active: boolean) {
  return db.recurringRecord.update({ where: { id }, data: { active } });
}
