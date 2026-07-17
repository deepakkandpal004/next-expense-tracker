'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import type { AppearancePreference, ContentDensity } from '@/lib/domain/types';

interface RootProvidersProps {
  children: ReactNode;
  initialAppearance: AppearancePreference;
  initialDensity: ContentDensity;
  // optional server-provided initial authenticated user to avoid an extra client-side fetch
  initialUser?: { id: string; email: string; name: string | null; imageUrl: string | null } | null;
}

/** Keeps the root provider boundary small and seeds SSR-visible preferences. */
export function RootProviders({
  children,
  initialAppearance,
  initialDensity,
  initialUser,
}: RootProvidersProps) {
  return (
    <ThemeProvider
      initialAppearance={initialAppearance}
      initialDensity={initialDensity}
    >
      <AuthProvider initialUser={initialUser}>{children}</AuthProvider>
    </ThemeProvider>
  );
}
