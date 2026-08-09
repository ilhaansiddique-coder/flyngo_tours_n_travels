import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { detectLocale, Locale, DEFAULT_LOCALE } from '@/lib/i18n';
import { en, bn } from '@/messages';

type Messages = typeof en;

interface LocaleContextValue {
  locale: Locale;
  t: (key: keyof Messages) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const MESSAGES: Record<Locale, Messages> = { en, bn };

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocale(detectLocale());
    document.documentElement.lang = detectLocale();
  }, []);

  const t = (key: keyof Messages): string => {
    return MESSAGES[locale][key] ?? MESSAGES[DEFAULT_LOCALE][key] ?? (key as string);
  };

  return <LocaleContext.Provider value={{ locale, t }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used inside <LocaleProvider>');
  return ctx;
}
