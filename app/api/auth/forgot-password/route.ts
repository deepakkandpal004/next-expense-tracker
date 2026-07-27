import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { db } from '@/lib/db';
import { hashSessionToken } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export async function POST(request: Request) {
  const limit = rateLimit(request, 'forgot-password', { windowMs: 60_000, maxRequests: 3 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(limit.retryAfterMs / 1000)) } },
    );
  }

  try {
    const { email } = await request.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: 'If an account exists, recovery instructions were sent.' });
    }

    // Invalidate any existing reset tokens for this user
    await db.passwordResetToken.deleteMany({ where: { userId: user.id } });

    // Create new token
    const rawToken = randomBytes(32).toString('base64url');
    const tokenHash = hashSessionToken(rawToken);
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

    await db.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    // In production, send email with reset link containing rawToken
    // For now, log the token for development purposes
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${rawToken}`;
    console.log(`[Password Reset] ${user.email}: ${resetUrl}`);

    return NextResponse.json({ message: 'If an account exists, recovery instructions were sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
