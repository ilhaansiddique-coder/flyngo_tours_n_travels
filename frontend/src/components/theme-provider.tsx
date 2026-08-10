'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark' | 'system';

type ResolvedTheme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
  themes: Theme[];
  systemTheme: ResolvedTheme | undefined;
};

const DEFAULT_THEMES: Theme[] = ['light', 'dark', 'system'];

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'theme';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readStoredTheme(storageKey: string, defaultTheme: Theme): Theme {
  if (typeof window === 'undefined') return defaultTheme;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    // ignore
  }
  return defaultTheme;
}

function resolveTheme(theme: Theme, systemTheme: ResolvedTheme, enableSystem: boolean): ResolvedTheme {
  if (theme === 'system') return enableSystem ? systemTheme : 'light';
  return theme;
}

function applyThemeAttribute(
  attribute: 'class' | string,
  themes: readonly Theme[],
  resolved: ResolvedTheme,
  value: Record<string, string> | undefined,
) {
  if (typeof document === 'undefined') return;
  const el = document.documentElement;
  const resolvedClass = value ? value[resolved] : resolved;
  if (attribute === 'class') {
    themes.forEach((t) => {
      if (t !== 'system') {
        const cls = value ? value[t] : t;
        if (cls) el.classList.remove(cls);
      }
    });
    if (resolvedClass) el.classList.add(resolvedClass);
  } else if (resolvedClass) {
    el.setAttribute(attribute, resolvedClass);
  } else {
    el.removeAttribute(attribute);
  }
  el.style.colorScheme = resolved;
}

export type ThemeProviderProps = {
  children: ReactNode;
  attribute?: 'class' | string;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  enableColorScheme?: boolean;
  storageKey?: string;
  themes?: Theme[];
  value?: Record<string, string>;
  forcedTheme?: Theme;
  disableTransitionOnChange?: boolean;
  nonce?: string;
};

export function ThemeProvider({
  children,
  attribute = 'class',
  defaultTheme = 'system',
  enableSystem = true,
  storageKey = STORAGE_KEY,
  themes = DEFAULT_THEMES,
  value,
  forcedTheme,
  disableTransitionOnChange = false,
  nonce,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(
    enableSystem ? getSystemTheme() : 'light',
  );

  useEffect(() => {
    const initial = readStoredTheme(storageKey, defaultTheme);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(initial);
  }, [defaultTheme, storageKey]);

  useEffect(() => {
    if (!enableSystem) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setSystemTheme(getSystemTheme());
    handler();
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [enableSystem]);

  useEffect(() => {
    const resolved = forcedTheme
      ? resolveTheme(forcedTheme, systemTheme, enableSystem)
      : resolveTheme(theme, systemTheme, enableSystem);
    applyThemeAttribute(attribute, themes, resolved, value);
  }, [attribute, enableSystem, forcedTheme, systemTheme, theme, themes, value]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (event: StorageEvent) => {
      if (event.key !== storageKey || !event.newValue) return;
      const next = event.newValue as Theme;
      if (next === 'light' || next === 'dark' || next === 'system') {
        setThemeState(next);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [storageKey]);

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeState(next);
      try {
        window.localStorage.setItem(storageKey, next);
      } catch {
        // ignore
      }
      if (disableTransitionOnChange || nonce) {
        const style = document.createElement('style');
        if (nonce) style.setAttribute('nonce', nonce);
        style.appendChild(
          document.createTextNode(
            '*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}',
          ),
        );
        document.head.appendChild(style);
        window.getComputedStyle(document.body);
        setTimeout(() => document.head.removeChild(style), 1);
      }
    },
    [disableTransitionOnChange, nonce, storageKey],
  );

  const resolvedTheme = forcedTheme
    ? resolveTheme(forcedTheme, systemTheme, enableSystem)
    : resolveTheme(theme, systemTheme, enableSystem);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
      themes: enableSystem ? themes : themes.filter((t) => t !== 'system'),
      systemTheme: enableSystem ? systemTheme : undefined,
    }),
    [theme, setTheme, resolvedTheme, themes, enableSystem, systemTheme],
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) {
    return {
      theme: 'system',
      setTheme: () => undefined,
      resolvedTheme: 'light',
      themes: DEFAULT_THEMES,
      systemTheme: undefined,
    };
  }
  return value;
}
