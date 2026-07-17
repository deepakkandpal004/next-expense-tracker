'use client';

import { useTheme } from '@/contexts/ThemeContext';
import type { AppearancePreference } from '@/lib/domain/types';

const labels: Record<AppearancePreference, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

export default function ThemeToggle() {
  const { appearance, resolvedAppearance, setAppearance } = useTheme();

  return (
    <label className='flex min-h-11 items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm text-[var(--color-text)]'>
      <span className='sr-only'>Appearance</span>
      <select
        aria-label={`Appearance, current setting ${labels[appearance]}, resolved ${resolvedAppearance}`}
        className='min-h-11 cursor-pointer bg-transparent px-1 text-base font-medium text-[var(--color-text)] focus:outline-none'
        value={appearance}
        onChange={(event) =>
          setAppearance(event.target.value as AppearancePreference)
        }
      >
        <option value='light'>Light</option>
        <option value='dark'>Dark</option>
        <option value='system'>System</option>
      </select>
    </label>
  );
}
