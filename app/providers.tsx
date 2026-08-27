'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/components/ui/toast';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { ContentDensity, ResolvedAppearance } from '@/lib/domain/types';

interface RootProvidersProps {
  children: ReactNode;
  initialDensity: ContentDensity;
  initialAppearance: ResolvedAppearance;
}

/** Keeps the root provider boundary small and seeds SSR-visible preferences. */
export function RootProviders({
  children,
  initialDensity,
  initialAppearance,
}: RootProvidersProps) {
  return (
    <ThemeProvider initialAppearance={initialAppearance} initialDensity={initialDensity}>
      <TooltipProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
