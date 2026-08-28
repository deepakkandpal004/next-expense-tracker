import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '@/lib/auth';
import { withApiLogging } from '@/src/common/server/logger';

/**
 * Clears stale session cookies for visitors whose cookie outlives its session
 * row (DB reset, revoked session, token expiry). Server layouts cannot mutate
 * cookies, so an unauthenticated request is redirected here first; otherwise
 * middleware would bounce it back to /dashboard in an infinite redirect loop.
 */
export const GET = withApiLogging(async (request: Request) => {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');

  return NextResponse.redirect(new URL('/sign-in', request.url));
});
