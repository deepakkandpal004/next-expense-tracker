import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_ROUTES = ['/sign-in', '/sign-up', '/forgot-password'] as const;
const APP_ROUTES = ['/dashboard', '/records', '/insights'] as const;

function matchesRouteBoundary(pathname: string, routes: readonly string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/**
 * Cookie presence only determines navigation flow. Server layouts, actions, and
 * queries remain responsible for authenticating and authorizing every request.
 */
function hasSessionHint(request: NextRequest) {
  return Boolean(request.cookies.get('session_token')?.value);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = hasSessionHint(request);

  if (matchesRouteBoundary(pathname, APP_ROUTES) && !isAuthenticated) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (matchesRouteBoundary(pathname, AUTH_ROUTES) && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Keep existing authenticated bookmarks out of the public shell. This is a
  // navigation hint only; app layouts, server actions, and queries still
  // verify the session and authorize every request.
  if (pathname === '/' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/records/:path*',
    '/insights/:path*',
    '/sign-in/:path*',
    '/sign-up/:path*',
    '/forgot-password/:path*',
  ],
};
