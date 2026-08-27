/**
 * Recurring repository — was lib/data/recurring.ts
 */
export { processDueRecurringRecords } from "@/lib/data/recurring";
import { db } from "@/src/database/client";

export async function findActiveByUser(userId: string) {
  return db.recurringRecord.findMany({ where: { userId, active: true } });
}

export async function findByUser(userId: string) {
  return db.recurringRecord.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}
