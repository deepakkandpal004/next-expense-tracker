import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "@/src/database/client";
import { getCache, setCache, deleteCache, CacheKey } from "@/src/common/cache";
import * as repo from "@/src/modules/auth/infrastructure/auth.repository";

export const SESSION_COOKIE_NAME = "session_token";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Auth application service — orchestrates domain + infrastructure.
 * This is the sole entry-point for auth; presentation (routes/actions)
 * must import from here, not from lib/auth directly.
 *
 * Migrated from lib/auth.ts — now lives in modular monolith.
 */

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12); // raised from 10 → 12 for prod
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await repo.createSessionRow({ userId, tokenHash: hashSessionToken(token), expiresAt });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: expiresAt,
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}

export async function deleteCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    const tokenHash = hashSessionToken(token);
    await db.session.deleteMany({ where: { tokenHash } });
    await deleteCache(CacheKey.session(tokenHash));
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}

export const getAuthUser = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const tokenHash = hashSessionToken(token);
  const cachedUser = await getCache<unknown>(CacheKey.session(tokenHash));
  if (cachedUser) return cachedUser as Awaited<ReturnType<typeof repo.findSessionByHash>> extends { user: infer U } ? U : never;
  const session = await repo.findSessionByHash(tokenHash);
  if (!session || session.expiresAt <= new Date()) {
    if (session) await deleteCache(CacheKey.session(tokenHash));
    return null;
  }
  await setCache(CacheKey.session(tokenHash), session.user, 60 * 5);
  return session.user;
});
