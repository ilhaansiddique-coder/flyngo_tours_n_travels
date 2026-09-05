import type { Lang } from '@/types';

export const LANG_COOKIE = 'vbt_lang';

export function formatDate(date: string, lang: Lang): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTaka(value: string | number, lang: Lang): string {
  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(num)) return String(value);
  const formatted = num.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US');
  return `৳ ${formatted}`;
}

export function pickField(lang: Lang, en?: string | null, bn?: string | null): string {
  return lang === 'bn' && bn ? bn : en || '';
}
