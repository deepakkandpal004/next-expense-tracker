import { db } from "@/src/database/client";

export async function updateUserSettings(userId: string, data: { name?: string | null; currency?: string }) {
  return db.user.update({ where: { id: userId }, data });
}

export async function findUserForSettings(userId: string) {
  return db.user.findUnique({ where: { id: userId } });
}
