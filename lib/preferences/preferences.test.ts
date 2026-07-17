import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DENSITY_RULES,
  PREFERENCES_BOOTSTRAP_SCRIPT,
  isAppearancePreference,
  isContentDensity,
  readPreferenceCookie,
  resolveAppearance,
  serializePreferenceCookie,
} from './preferences';

beforeEach(() => {
  localStorage.clear();
  document.cookie = 'expense-ai-appearance=; Max-Age=0; Path=/';
  document.cookie = 'expense-ai-density=; Max-Age=0; Path=/';
  document.documentElement.className = '';
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-density');
  document.querySelectorAll('meta[name="theme-color"]').forEach((node) => node.remove());
});

describe('appearance preferences', () => {
  it('resolves system from the OS while explicit preferences override it', () => {
    expect(resolveAppearance('system', 'dark')).toBe('dark');
    expect(resolveAppearance('system', 'light')).toBe('light');
    expect(resolveAppearance('light', 'dark')).toBe('light');
    expect(resolveAppearance('dark', 'light')).toBe('dark');
  });

  it('rejects malformed persisted preferences for safe fallback handling', () => {
    expect(isAppearancePreference('system')).toBe(true);
    expect(isAppearancePreference('sepia')).toBe(false);
    expect(isContentDensity('compact')).toBe(true);
    expect(isContentDensity('tiny')).toBe(false);
  });

  it('bootstraps the server-visible cookie before application providers mount', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
    localStorage.setItem('theme', 'light');
    localStorage.setItem('expense-ai-density', 'comfortable');
    document.cookie = 'expense-ai-appearance=dark; Path=/';
    document.cookie = 'expense-ai-density=compact; Path=/';
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.append(meta);

    new Function(PREFERENCES_BOOTSTRAP_SCRIPT)();

    expect(document.documentElement).toHaveClass('dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(document.documentElement).toHaveAttribute('data-density', 'compact');
    expect(meta).toHaveAttribute('content', '#0b132b');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(localStorage.getItem('expense-ai-density')).toBe('compact');
  });

  it('falls back safely when color-scheme detection is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined);
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.append(meta);

    new Function(PREFERENCES_BOOTSTRAP_SCRIPT)();

    expect(document.documentElement).toHaveClass('light');
    expect(document.documentElement).toHaveAttribute(
      'data-appearance-preference',
      'system',
    );
    expect(meta).toHaveAttribute('content', '#f8fafc');
  });
});

describe('density persistence contract', () => {
  it('round-trips encoded cookie values with session-wide scope', () => {
    const serialized = serializePreferenceCookie(
      'expense-ai-density',
      'compact',
    );
    expect(serialized).toContain('Path=/');
    expect(serialized).toContain('SameSite=Lax');
    expect(readPreferenceCookie(serialized, 'expense-ai-density')).toBe(
      'compact',
    );
  });

  it('documents geometry-only compact behavior and target preservation', () => {
    expect(DENSITY_RULES.geometryOnly).toBe(true);
    expect(DENSITY_RULES.preservedSemantics).toEqual([
      'content',
      'labels',
      'actions',
      'statuses',
    ]);
    expect(DENSITY_RULES.minimumFrequentControlTargetPx).toBe(44);
  });
});
