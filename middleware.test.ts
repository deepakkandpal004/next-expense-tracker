import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { config, middleware } from './middleware';

function createRequest(pathname: string, cookie?: string) {
  return new NextRequest(`https://expense.example${pathname}`, {
    headers: cookie ? { cookie } : undefined,
  });
}

describe('middleware route boundaries', () => {
  it.each(['/dashboard', '/records', '/insights'])('redirects anonymous visitors from %s to sign in', (pathname) => {
    const response = middleware(createRequest(`${pathname}?returnTo=https://malicious.example`));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://expense.example/sign-in');
  });

  it.each(['/dashboard', '/records', '/insights'])('allows session-hinted visitors to reach %s for server-side authorization', (pathname) => {
    const response = middleware(createRequest(pathname, 'access_token=present'));

    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it.each(['/sign-in', '/sign-up', '/forgot-password'])('redirects session-hinted visitors away from %s', (pathname) => {
    const response = middleware(createRequest(`${pathname}?next=https://malicious.example`, 'refresh_token=present'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://expense.example/dashboard');
  });

  it('routes a session-hinted legacy root request to the dashboard without retaining its query', () => {
    const response = middleware(createRequest('/?returnTo=https://malicious.example', 'access_token=present'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://expense.example/dashboard');
  });

  it('leaves a signed-out legacy root request to the public shell', () => {
    const response = middleware(createRequest('/'));

    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('matches only the new app, authentication, and legacy route boundaries', () => {
    expect(config.matcher).toEqual([
      '/',
      '/dashboard/:path*',
      '/records/:path*',
      '/insights/:path*',
      '/sign-in/:path*',
      '/sign-up/:path*',
      '/forgot-password/:path*',
    ]);
  });
});
