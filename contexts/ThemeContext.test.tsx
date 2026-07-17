import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DensityToggle from '@/components/DensityToggle';
import ThemeToggle from '@/components/ThemeToggle';
import { ThemeProvider, useTheme } from './ThemeContext';

function installColorScheme(initialDark: boolean) {
  let dark = initialDark;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const media = {
    get matches() {
      return dark;
    },
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addListener: (listener: (event: MediaQueryListEvent) => void) =>
      listeners.add(listener),
    removeListener: (listener: (event: MediaQueryListEvent) => void) =>
      listeners.delete(listener),
    addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) =>
      listeners.add(listener),
    removeEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) =>
      listeners.delete(listener),
    dispatchEvent: () => true,
  } as MediaQueryList;

  vi.stubGlobal('matchMedia', vi.fn(() => media));
  return (nextDark: boolean) => {
    dark = nextDark;
    const event = { matches: dark, media: media.media } as MediaQueryListEvent;
    listeners.forEach((listener) => listener(event));
  };
}

function PreferenceHarness() {
  const { resolvedAppearance } = useTheme();
  return (
    <div>
      <ThemeToggle />
      <DensityToggle />
      <label>
        Draft
        <input aria-label='Draft' defaultValue='Entered amount' />
      </label>
      <label>
        Filter
        <select aria-label='Filter' defaultValue='expense'>
          <option value='all'>All</option>
          <option value='expense'>Expense</option>
        </select>
      </label>
      <output data-testid='resolved'>{resolvedAppearance}</output>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.cookie = 'expense-ai-density=; Max-Age=0; Path=/';
  document.cookie = 'expense-ai-appearance=; Max-Age=0; Path=/';
  document.documentElement.className = '';
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-density');
  document.documentElement.removeAttribute('data-appearance-preference');
  document.documentElement.style.colorScheme = '';
  document.querySelectorAll('meta[name="theme-color"]').forEach((node) => node.remove());
});
describe('ThemeProvider', () => {
  it('synchronizes appearance and density without replacing child state', async () => {
    installColorScheme(false);
    render(
      <ThemeProvider initialAppearance='light' initialDensity='comfortable'>
        <PreferenceHarness />
      </ThemeProvider>,
    );

    const draft = screen.getByRole('textbox', { name: 'Draft' });
    const filter = screen.getByRole('combobox', { name: 'Filter' });
    fireEvent.change(draft, { target: { value: '₹1,250 taxi' } });
    fireEvent.change(filter, { target: { value: 'expense' } });
    fireEvent.change(screen.getByRole('combobox', { name: /Appearance/ }), {
      target: { value: 'dark' },
    });

    await waitFor(() => expect(screen.getByTestId('resolved')).toHaveTextContent('dark'));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute(
      'content',
      '#0b132b',
    );
    expect(localStorage.getItem('theme')).toBe('dark');

    fireEvent.change(screen.getByRole('combobox', { name: 'Content density' }), {
      target: { value: 'compact' },
    });
    expect(document.documentElement).toHaveAttribute('data-density', 'compact');
    expect(localStorage.getItem('expense-ai-density')).toBe('compact');
    expect(document.cookie).toContain('expense-ai-density=compact');
    expect(draft).toHaveValue('₹1,250 taxi');
    expect(filter).toHaveValue('expense');
  });

  it('updates live when the OS scheme changes in system mode', async () => {
    const setDark = installColorScheme(false);
    render(
      <ThemeProvider initialAppearance='system'>
        <PreferenceHarness />
      </ThemeProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('resolved')).toHaveTextContent('light'));
    act(() => setDark(true));
    await waitFor(() => expect(screen.getByTestId('resolved')).toHaveTextContent('dark'));
    expect(document.documentElement).toHaveAttribute(
      'data-appearance-preference',
      'system',
    );
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });

  it('keeps safe in-memory fallbacks when browser storage fails', async () => {
    installColorScheme(true);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });

    render(
      <ThemeProvider initialAppearance='system'>
        <PreferenceHarness />
      </ThemeProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('resolved')).toHaveTextContent('dark'));
    fireEvent.change(screen.getByRole('combobox', { name: 'Content density' }), {
      target: { value: 'compact' },
    });
    expect(document.documentElement).toHaveAttribute('data-density', 'compact');
    expect(screen.getByRole('combobox', { name: 'Content density' })).toHaveValue(
      'compact',
    );
  });
});
