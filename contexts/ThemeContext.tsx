'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  ContentDensity,
  ResolvedAppearance,
} from '@/lib/domain/types';
import {
  DENSITY_COOKIE_NAME,
  DENSITY_STORAGE_KEY,
  THEME_COLORS,
  isContentDensity,
  readPreferenceCookie,
  serializePreferenceCookie,
} from '@/lib/preferences/preferences';

interface ThemeContextType {
  resolvedAppearance: ResolvedAppearance;
  density: ContentDensity;
  setDensity: (density: ContentDensity) => void;
  theme: ResolvedAppearance;
}

interface ThemeProviderProps {
  children: ReactNode;
  initialDensity?: ContentDensity;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function persistPreference(name: string, value: string, storageKey: string) {
  try {
    localStorage.setItem(storageKey, value);
  } catch {
  }

  try {
    document.cookie = serializePreferenceCookie(name, value);
  } catch {
  }
}

function updateBrowserDensity(density: ContentDensity) {
  try {
    document.documentElement.dataset.density = density;
  } catch {
    // Keep the in-memory fallback when browser APIs are unavailable.
  }
}

function applyDarkAppearance() {
  try {
    const root = document.documentElement;
    root.classList.remove('light');
    root.classList.add('dark');
    root.dataset.appearancePreference = 'dark';
    root.dataset.theme = 'dark';
    root.style.colorScheme = 'dark';

    let metadata = Array.from(
      document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
    );
    if (metadata.length === 0) {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.append(meta);
      metadata = [meta];
    }
    metadata.forEach((meta) => {
      meta.content = THEME_COLORS.dark;
    });
  } catch {
    // Presentation failures must never prevent app rendering.
  }
}

function ThemeState({
  children,
  initialDensity,
}: Required<ThemeProviderProps>) {
  const [density, setDensityState] = useState<ContentDensity>(initialDensity);
  const hasHydratedDensity = useRef(false);

  useEffect(() => {
    applyDarkAppearance();
  }, []);

  useEffect(() => {
    if (hasHydratedDensity.current) return;
    hasHydratedDensity.current = true;

    const rootDensity = document.documentElement.dataset.density;
    const cookieDensity = readPreferenceCookie(
      document.cookie,
      DENSITY_COOKIE_NAME,
    );
    const mirroredDensity = (() => {
      try {
        return localStorage.getItem(DENSITY_STORAGE_KEY);
      } catch {
        return null;
      }
    })();
    const hydratedDensity = isContentDensity(cookieDensity)
      ? cookieDensity
      : isContentDensity(rootDensity)
        ? rootDensity
        : isContentDensity(mirroredDensity)
          ? mirroredDensity
          : initialDensity;

    setDensityState(hydratedDensity);
    updateBrowserDensity(hydratedDensity);
    persistPreference(DENSITY_COOKIE_NAME, hydratedDensity, DENSITY_STORAGE_KEY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setDensity = useCallback((nextDensity: ContentDensity) => {
    if (!isContentDensity(nextDensity)) return;
    setDensityState(nextDensity);
    updateBrowserDensity(nextDensity);
    persistPreference(DENSITY_COOKIE_NAME, nextDensity, DENSITY_STORAGE_KEY);
  }, []);

  const value = useMemo<ThemeContextType>(
    () => ({
      resolvedAppearance: 'dark',
      density,
      setDensity,
      theme: 'dark',
    }),
    [density, setDensity],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function ThemeProvider({
  children,
  initialDensity = 'comfortable',
}: ThemeProviderProps) {
  return <ThemeState initialDensity={initialDensity}>{children}</ThemeState>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
