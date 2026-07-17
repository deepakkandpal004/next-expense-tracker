import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthenticationShell } from './authentication-shell';

function renderShell() {
  return render(
    <ThemeProvider initialAppearance='light' initialDensity='comfortable'>
      <AuthenticationShell><form aria-label='Sign in form' /></AuthenticationShell>
    </ThemeProvider>,
  );
}

describe('AuthenticationShell', () => {
  it('provides product identity, appearance choice, home return, and direct auth-task links', () => {
    renderShell();

    expect(screen.getByRole('link', { name: 'Expense AI home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Return home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('combobox', { name: /appearance/i })).toBeVisible();
    const navigation = screen.getByRole('navigation', { name: 'Authentication tasks' });
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/sign-in');
    expect(screen.getByRole('link', { name: 'Create account' })).toHaveAttribute('href', '/sign-up');
    expect(screen.getByRole('link', { name: 'Reset password' })).toHaveAttribute('href', '/forgot-password');
    expect(navigation).not.toHaveTextContent(/features|contact|dashboard|records|insights/i);
  });

  it('keeps the form slot separate from the optional wide-screen support region', () => {
    renderShell();

    expect(screen.getByRole('region', { name: 'Account access' })).toContainElement(screen.getByRole('form', { name: 'Sign in form' }));
    expect(screen.getByRole('complementary', { name: 'Manage your finances with clarity.' })).toBeVisible();
  });
});
