import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, hashSessionToken } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: Request) {
  const limit = rateLimit(request, 'reset-password', { windowMs: 60_000, maxRequests: 5 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(limit.retryAfterMs / 1000)) } },
    );
  }

  try {
    const { token, password } = await request.json();
    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
        { status: 400 },
      );
    }

    const tokenHash = hashSessionToken(token);
    const resetToken = await db.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!resetToken || resetToken.expiresAt <= new Date()) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    // Update password
    const hashedPassword = await hashPassword(password);
    await db.user.update({ where: { id: resetToken.userId }, data: { password: hashedPassword } });

    // Delete the used token and all other reset tokens for this user
    await db.passwordResetToken.deleteMany({ where: { userId: resetToken.userId } });

    // Invalidate all existing sessions for security
    await db.session.deleteMany({ where: { userId: resetToken.userId } });

    return NextResponse.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
