import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { db } from './db';

const getSecretKey = () => {
  const secret = process.env.JWT_SECRET || 'super-secret-key-expense-tracker-ai-token-secret-xyz';
  return new TextEncoder().encode(secret);
};

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function generateAccessToken(userId: string, email: string): Promise<string> {
  return await new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(getSecretKey());
}

export async function generateRefreshToken(userId: string, email: string): Promise<string> {
  return await new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecretKey());
}

export async function verifyJWT(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as { userId: string; email: string };
  } catch {
    return null;
  }
}

export async function refreshSession() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;
  if (!refreshToken) return null;

  const decoded = await verifyJWT(refreshToken);
  if (!decoded) return null;

  const user = await db.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user || user.refreshToken !== refreshToken) {
    return null;
  }

  const newAccessToken = await generateAccessToken(user.id, user.email);
  const newRefreshToken = await generateRefreshToken(user.id, user.email);

  await db.user.update({
    where: { id: user.id },
    data: { refreshToken: newRefreshToken },
  });

  cookieStore.set('access_token', newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60,
    path: '/',
  });

  cookieStore.set('refresh_token', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  return user;
}

export async function getAuthUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return await refreshSession();
  }

  const decoded = await verifyJWT(accessToken);
  if (!decoded) {
    return await refreshSession();
  }

  const user = await db.user.findUnique({
    where: { id: decoded.userId },
  });

  return user;
}
