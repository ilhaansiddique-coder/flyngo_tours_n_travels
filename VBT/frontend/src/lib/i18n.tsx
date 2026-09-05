'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { messages } from '@/messages';
import type { Lang } from '@/types';

const LANG_COOKIE = 'vbt_lang';

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function getDict(lang: Lang) {
  return messages[lang];
}

function tFromDict(key: string, lang: Lang): string {
  const dict = getDict(lang) as unknown as Record<string, unknown>;
  const path = key.split('.');
  let node: unknown = dict;
  for (const part of path) {
    if (typeof node !== 'object' || node === null) return key;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' ? node : key;
}

export function I18nProvider({
  initialLang,
  children,
}: {
  initialLang: Lang;
  children: ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem('vbt_lang', next);
      document.cookie = `${LANG_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
    } catch {
      // ignore
    }
    document.documentElement.lang = next;
    window.location.reload();
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <I18nContext.Provider
      value={{
        lang,
        setLang,
        toggleLang: () => setLang(lang === 'en' ? 'bn' : 'en'),
        t: (key: string) => tFromDict(key, lang),
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within <I18nProvider />');
  return ctx;
}