import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import {
  detectLocale,
  readStoredLocale,
  writeStoredLocale,
  Locale,
  DEFAULT_LOCALE,
} from '@/lib/i18n';
import { en, bn } from '@/messages';

type Messages = typeof en;

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: keyof Messages) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const MESSAGES: Record<Locale, Messages> = { en, bn };

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const initial = readStoredLocale() ?? detectLocale();
    setLocaleState(initial);
    document.documentElement.lang = initial;
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    writeStoredLocale(next);
    document.documentElement.lang = next;
  }, []);

  const t = (key: keyof Messages): string => {
    return MESSAGES[locale][key] ?? MESSAGES[DEFAULT_LOCALE][key] ?? (key as string);
  };

  return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used inside <LocaleProvider>');
  return ctx;
}
