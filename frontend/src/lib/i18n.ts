export type Locale = 'en' | 'bn';

export const SUPPORTED_LOCALES: Locale[] = ['en', 'bn'];
export const DEFAULT_LOCALE: Locale = 'en';

export function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const lang of langs) {
    const code = lang.toLowerCase().split('-')[0];
    if ((SUPPORTED_LOCALES as string[]).includes(code)) return code as Locale;
  }
  return DEFAULT_LOCALE;
}
