import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_ROUTES = ['/sign-in', '/sign-up'] as const;
const APP_ROUTES = ['/dashboard', '/records', '/ai-insights', '/budgets', '/goals', '/recurring', '/categories', '/reports', '/settings'] as const;

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

  // Redirect unauthenticated users to sign-in for protected routes
  if (matchesRouteBoundary(pathname, APP_ROUTES) && !isAuthenticated) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Redirect authenticated users away from auth pages to dashboard
  if (matchesRouteBoundary(pathname, AUTH_ROUTES) && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/records/:path*',
    '/ai-insights/:path*',
    '/budgets/:path*',
    '/goals/:path*',
    '/recurring/:path*',
    '/categories/:path*',
    '/reports/:path*',
    '/settings/:path*',
    '/sign-in/:path*',
    '/sign-up/:path*',
  ],
};
