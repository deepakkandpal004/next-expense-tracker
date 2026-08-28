'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/src/common/ui/toast';
import { TooltipProvider } from '@/src/common/ui/tooltip';
import type { ContentDensity, ResolvedAppearance } from '@/src/common/domain/types';

interface RootProvidersProps {
  children: ReactNode;
  initialDensity: ContentDensity;
  initialAppearance: ResolvedAppearance;
}

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
