'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import type { AppearancePreference, ContentDensity } from '@/lib/domain/types';

interface RootProvidersProps {
  children: ReactNode;
  initialAppearance: AppearancePreference;
  initialDensity: ContentDensity;
}

/** Keeps the root provider boundary small and seeds SSR-visible preferences. */
export function RootProviders({
  children,
  initialAppearance,
  initialDensity,
}: RootProvidersProps) {
  return (
    <ThemeProvider
      initialAppearance={initialAppearance}
      initialDensity={initialDensity}
    >
      {children}
    </ThemeProvider>
  );
}
