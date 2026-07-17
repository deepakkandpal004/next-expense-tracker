'use client';

import { useTheme } from '@/contexts/ThemeContext';
import type { ContentDensity } from '@/lib/domain/types';

export default function DensityToggle() {
  const { density, setDensity } = useTheme();

  return (
    <label className='flex min-h-11 items-center gap-2 text-[var(--color-text)]'>
      <span className='text-sm font-medium'>Density</span>
      <select
        aria-label='Content density'
        className='min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-base'
        value={density}
        onChange={(event) =>
          setDensity(event.target.value as ContentDensity)
        }
      >
        <option value='comfortable'>Comfortable</option>
        <option value='compact'>Compact</option>
      </select>
    </label>
  );
}
