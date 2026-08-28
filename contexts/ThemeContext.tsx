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
  APPEARANCE_COOKIE_NAME,
  APPEARANCE_STORAGE_KEY,
  THEME_COLORS,
  isContentDensity,
  isResolvedAppearance,
  readPreferenceCookie,
  serializePreferenceCookie,
} from '@/lib/preferences/preferences';

interface ThemeContextType {
  resolvedAppearance: ResolvedAppearance;
  density: ContentDensity;
  setDensity: (density: ContentDensity) => void;
  theme: ResolvedAppearance;
  setTheme: (theme: ResolvedAppearance) => void;
}

interface ThemeProviderProps {
  children: ReactNode;
  initialDensity?: ContentDensity;
  initialAppearance?: ResolvedAppearance;
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
  } catch {}
}

function applyAppearance(appearance: ResolvedAppearance) {
  try {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(appearance);
    root.dataset.appearancePreference = appearance;
    root.dataset.theme = appearance;
    root.style.colorScheme = appearance;

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
      meta.content = THEME_COLORS[appearance];
    });
  } catch {}
}

function ThemeState({
  children,
  initialDensity,
  initialAppearance,
}: Required<ThemeProviderProps>) {
  const [density, setDensityState] = useState<ContentDensity>(initialDensity);
  const [appearance, setAppearanceState] = useState<ResolvedAppearance>(initialAppearance);
  const hasHydratedDensity = useRef(false);

  useEffect(() => {
    const cookieAppearance = readPreferenceCookie(document.cookie, APPEARANCE_COOKIE_NAME);
    const storedAppearance = (() => {
      try { return localStorage.getItem(APPEARANCE_STORAGE_KEY); } catch { return null; }
    })();
    const resolved = isResolvedAppearance(cookieAppearance)
      ? cookieAppearance
      : isResolvedAppearance(storedAppearance)
        ? storedAppearance
        : initialAppearance;
    setAppearanceState(resolved);
    applyAppearance(resolved);
  }, [initialAppearance]);

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

  const setTheme = useCallback((nextAppearance: ResolvedAppearance) => {
    if (!isResolvedAppearance(nextAppearance)) return;
    setAppearanceState(nextAppearance);
    applyAppearance(nextAppearance);
    persistPreference(APPEARANCE_COOKIE_NAME, nextAppearance, APPEARANCE_STORAGE_KEY);
  }, []);

  const value = useMemo<ThemeContextType>(
    () => ({
      resolvedAppearance: appearance,
      density,
      setDensity,
      theme: appearance,
      setTheme,
    }),
    [appearance, density, setDensity, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function ThemeProvider({
  children,
  initialDensity = 'comfortable',
  initialAppearance = 'dark',
}: ThemeProviderProps) {
  return <ThemeState initialAppearance={initialAppearance} initialDensity={initialDensity}>{children}</ThemeState>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
