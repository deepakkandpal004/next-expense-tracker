import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { getAuthUser, redirect } = vi.hoisted(() => ({
  getAuthUser: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({ getAuthUser }));
vi.mock('next/navigation', () => ({ redirect }));
vi.mock('@/components/Guest', () => ({
  default: () => 'Public landing',
}));
vi.mock('@/components/patterns/PublicHeader', () => ({
  PublicHeader: () => 'Public navigation',
}));
vi.mock('@/components/patterns/PublicFooter', () => ({
  PublicFooter: () => 'Public footer',
}));

import HomePage from './page';

describe('HomePage legacy route behavior', () => {
  it('redirects a server-verified authenticated user to the dashboard', async () => {
    getAuthUser.mockResolvedValue({ id: 'user-1' });
    redirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });

    await expect(HomePage()).rejects.toThrow('NEXT_REDIRECT');
    expect(redirect).toHaveBeenCalledWith('/dashboard');
  });

  it('renders the public landing for a signed-out visitor', async () => {
    getAuthUser.mockResolvedValue(null);

    render(await HomePage());

    expect(screen.getByText('Public landing')).toBeInTheDocument();
    expect(redirect).not.toHaveBeenCalled();
  });
});
