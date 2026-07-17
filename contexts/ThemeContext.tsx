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
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from 'next-themes';
import type {
  AppearancePreference,
  ContentDensity,
  ResolvedAppearance,
} from '@/lib/domain/types';
import {
  APPEARANCE_COOKIE_NAME,
  APPEARANCE_STORAGE_KEY,
  DENSITY_COOKIE_NAME,
  DENSITY_STORAGE_KEY,
  THEME_COLORS,
  isAppearancePreference,
  isContentDensity,
  isResolvedAppearance,
  readPreferenceCookie,
  resolveAppearance,
  serializePreferenceCookie,
} from '@/lib/preferences/preferences';

interface ThemeContextType {
  appearance: AppearancePreference;
  resolvedAppearance: ResolvedAppearance;
  setAppearance: (preference: AppearancePreference) => void;
  density: ContentDensity;
  setDensity: (density: ContentDensity) => void;
  /** Compatibility aliases while legacy chart consumers migrate. */
  theme: ResolvedAppearance;
  toggleTheme: () => void;
}

interface ThemeProviderProps {
  children: ReactNode;
  initialAppearance?: AppearancePreference;
  initialDensity?: ContentDensity;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getBootstrappedAppearance(
  fallback: AppearancePreference,
): AppearancePreference {
  try {
    const value = document.documentElement.dataset.appearancePreference;
    return isAppearancePreference(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function getBootstrappedSystemAppearance(
  fallback: ResolvedAppearance,
): ResolvedAppearance {
  try {
    const value = document.documentElement.dataset.theme;
    return isResolvedAppearance(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function persistPreference(name: string, value: string, storageKey: string) {
  try {
    localStorage.setItem(storageKey, value);
  } catch {
    // The cookie and in-memory state still preserve the active document.
  }

  try {
    document.cookie = serializePreferenceCookie(name, value);
  } catch {
    // Browser privacy settings must not prevent a presentation change.
  }
}

function updateBrowserAppearance(
  preference: AppearancePreference,
  resolved: ResolvedAppearance,
) {
  try {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
    root.dataset.appearancePreference = preference;
    root.dataset.theme = resolved;
    root.style.colorScheme = resolved;

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
      meta.content = THEME_COLORS[resolved];
    });

    window.dispatchEvent(
      new CustomEvent('expense-ai:appearance-change', {
        detail: { preference, resolvedAppearance: resolved },
      }),
    );
  } catch {
    // Presentation preference failures must never prevent app rendering.
  }
}

function updateBrowserDensity(density: ContentDensity) {
  try {
    document.documentElement.dataset.density = density;
  } catch {
    // Keep the in-memory fallback when browser APIs are unavailable.
  }
}

function ThemeState({
  children,
  initialAppearance,
  initialDensity,
}: Required<ThemeProviderProps>) {
  const {
    systemTheme,
    setTheme: setNextTheme,
  } = useNextTheme();
  const [appearance, setAppearanceState] =
    useState<AppearancePreference>(initialAppearance);
  const [density, setDensityState] = useState<ContentDensity>(initialDensity);
  const hasHydratedAppearance = useRef(false);

  const systemAppearance = isResolvedAppearance(systemTheme)
    ? systemTheme
    : getBootstrappedSystemAppearance('light');
  const resolvedAppearance = resolveAppearance(appearance, systemAppearance);

  useEffect(() => {
    if (hasHydratedAppearance.current) return;
    hasHydratedAppearance.current = true;

    const hydratedAppearance = getBootstrappedAppearance(initialAppearance);
    setAppearanceState(hydratedAppearance);
    // Sync next-themes only if it differs — do NOT include nextThemePreference
    // or setNextTheme in deps: they change as a result of this call, which
    // would re-trigger the effect and create an infinite request loop.
    setNextTheme(hydratedAppearance);
    persistPreference(
      APPEARANCE_COOKIE_NAME,
      hydratedAppearance,
      APPEARANCE_STORAGE_KEY,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
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
  }, [initialDensity]);

  useEffect(() => {
    updateBrowserAppearance(appearance, resolvedAppearance);
  }, [appearance, resolvedAppearance]);

  const setAppearance = useCallback(
    (preference: AppearancePreference) => {
      if (!isAppearancePreference(preference)) return;
      setAppearanceState(preference);
      setNextTheme(preference);
      persistPreference(
        APPEARANCE_COOKIE_NAME,
        preference,
        APPEARANCE_STORAGE_KEY,
      );
    },
    [setNextTheme],
  );

  const setDensity = useCallback((nextDensity: ContentDensity) => {
    if (!isContentDensity(nextDensity)) return;
    setDensityState(nextDensity);
    updateBrowserDensity(nextDensity);
    persistPreference(DENSITY_COOKIE_NAME, nextDensity, DENSITY_STORAGE_KEY);
  }, []);

  const toggleTheme = useCallback(() => {
    setAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
  }, [resolvedAppearance, setAppearance]);

  const value = useMemo<ThemeContextType>(
    () => ({
      appearance,
      resolvedAppearance,
      setAppearance,
      density,
      setDensity,
      theme: resolvedAppearance,
      toggleTheme,
    }),
    [
      appearance,
      density,
      resolvedAppearance,
      setAppearance,
      setDensity,
      toggleTheme,
    ],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function ThemeProvider({
  children,
  initialAppearance = 'system',
  initialDensity = 'comfortable',
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={['class', 'data-theme']}
      defaultTheme={initialAppearance}
      enableColorScheme
      enableSystem
      disableTransitionOnChange
      storageKey={APPEARANCE_STORAGE_KEY}
      themes={['light', 'dark']}
    >
      <ThemeState
        initialAppearance={initialAppearance}
        initialDensity={initialDensity}
      >
        {children}
      </ThemeState>
    </NextThemesProvider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
