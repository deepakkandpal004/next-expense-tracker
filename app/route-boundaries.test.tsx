import { createElement } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SignedInError from './(app)/error';
import SignedInNotFound from './(app)/not-found';
import GlobalErrorBoundary from './error';
import Loading from './loading';
import NotFound from './not-found';

describe('global route boundaries', () => {
  it('reserves an accessible loading footprint', () => {
    render(createElement(Loading));

    expect(screen.getByRole('status', { name: 'Loading page content' })).toHaveStyle({
      minHeight: '36rem',
    });
  });

  it('offers signed-out recovery, support, and retry actions', () => {
    const reset = vi.fn();
    render(createElement(GlobalErrorBoundary, { error: new Error('internal detail'), reset }));

    expect(screen.getByRole('heading', { name: 'We couldn’t load this page' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Return home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Open support' })).toHaveAttribute('href', '/contact');
    fireEvent.click(screen.getByRole('button', { name: 'Retry page' }));
    expect(reset).toHaveBeenCalledOnce();
  });

  it('uses dashboard recovery destinations for signed-in boundaries', () => {
    const reset = vi.fn();
    const { rerender } = render(createElement(SignedInError, { error: new Error('internal detail'), reset }));

    expect(screen.getByRole('link', { name: 'View dashboard' })).toHaveAttribute('href', '/dashboard');
    rerender(createElement(SignedInNotFound));
    expect(screen.getByRole('link', { name: 'View dashboard' })).toHaveAttribute('href', '/dashboard');
  });

  it('returns signed-out missing pages to the public home', () => {
    render(createElement(NotFound));

    expect(screen.getByRole('link', { name: 'Return home' })).toHaveAttribute('href', '/');
  });
});
