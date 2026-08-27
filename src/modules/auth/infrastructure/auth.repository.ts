import { db } from "@/src/database/client";
import type { User } from "@prisma/client";

/**
 * Auth repository — data access for users & sessions.
 * Isolates Prisma queries behind module boundary.
 * Previously scattered in lib/auth.ts + app/api/auth/* routes.
 */

export async function findUserByEmail(email: string): Promise<User | null> {
  return db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
}

export async function findUserById(id: string): Promise<User | null> {
  return db.user.findUnique({ where: { id } });
}

export async function createUser(data: { email: string; password: string; name?: string | null; currency?: string }) {
  return db.user.create({ data });
}

export async function findSessionByHash(tokenHash: string) {
  return db.session.findUnique({ where: { tokenHash }, include: { user: true } });
}

export async function createSessionRow(data: { userId: string; tokenHash: string; expiresAt: Date }) {
  return db.session.create({ data });
}

export async function deleteSessionsByHash(tokenHash: string) {
  return db.session.deleteMany({ where: { tokenHash } });
}

export async function deleteExpiredSessions() {
  return db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
}
