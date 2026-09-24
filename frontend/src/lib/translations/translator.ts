import { MANUAL_BANGLA_WORDS, BANGLA_DICTIONARY_MAP, translateWithManualDictionary, TranslationEntry } from './bangla-dictionary';

/** Check if text already contains Bengali script (Unicode range 0980-09FF) */
export function hasBanglaChars(text: string): boolean {
  return /[\u0980-\u09FF]/.test(text);
}

/** Translate a single text string from English to Bangla */
export async function autoTranslate(text: string, from = 'en', to = 'bn'): Promise<string> {
  const trimmed = (text || '').trim();
  if (!trimmed) return '';

  // If already in target language, return as is
  if (to === 'bn' && hasBanglaChars(trimmed)) {
    return trimmed;
  }

  // 1. Direct dictionary check first for instant response
  const lower = trimmed.toLowerCase();
  if (to === 'bn' && BANGLA_DICTIONARY_MAP[lower]) {
    return BANGLA_DICTIONARY_MAP[lower];
  }

  // 2. Query our internal translation API
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: trimmed, from, to }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.translated) {
        return data.translated;
      }
    }
  } catch (err) {
    console.warn('Auto-translate API error, falling back to manual dictionary:', err);
  }

  // 3. Fallback to manual dictionary phrase replacement
  const fallback = to === 'bn' ? translateWithManualDictionary(trimmed) : null;
  return fallback || trimmed;
}

/** Translate multiple fields concurrently (e.g. title, description, requirements) */
export async function translateBatch<T extends Record<string, string>>(
  fields: T,
  from = 'en',
  to = 'bn',
): Promise<T> {
  const keys = Object.keys(fields) as (keyof T)[];
  const promises = keys.map(async (key) => {
    const val = fields[key];
    if (typeof val === 'string' && val.trim()) {
      const translated = await autoTranslate(val, from, to);
      return [key, translated] as const;
    }
    return [key, val] as const;
  });

  const results = await Promise.all(promises);
  const output = { ...fields };
  for (const [k, v] of results) {
    (output as any)[k] = v;
  }
  return output;
}

/** Get list of manual translated words for UI picker / auto-complete */
export function getManualBanglaWords(category?: TranslationEntry['category']): TranslationEntry[] {
  if (!category) return MANUAL_BANGLA_WORDS;
  return MANUAL_BANGLA_WORDS.filter((item) => item.category === category);
}
