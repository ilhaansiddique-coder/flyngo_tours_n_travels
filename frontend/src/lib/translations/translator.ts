import {
  MANUAL_BANGLA_WORDS,
  BANGLA_DICTIONARY_MAP,
  ENGLISH_DICTIONARY_MAP,
  translateWithManualDictionary,
  translateWithBanglaToEnglishDictionary,
  TranslationEntry,
} from './bangla-dictionary';

/** Check if text already contains Bengali script (Unicode range 0980-09FF) */
export function hasBanglaChars(text: string): boolean {
  return /[\u0980-\u09FF]/.test(text);
}

/** Translate a single text string bi-directionally (English <-> Bangla) */
export async function autoTranslate(text: string, from = 'en', to = 'bn'): Promise<string> {
  const trimmed = (text || '').trim();
  if (!trimmed) return '';

  // If already in target language, return as is
  if (to === 'bn' && hasBanglaChars(trimmed)) {
    return trimmed;
  }
  if (to === 'en' && !hasBanglaChars(trimmed)) {
    return trimmed;
  }

  // 1. Direct dictionary check first for instant response
  const lower = trimmed.toLowerCase();
  if (to === 'bn' && BANGLA_DICTIONARY_MAP[lower]) {
    return BANGLA_DICTIONARY_MAP[lower];
  }
  if (to === 'en' && ENGLISH_DICTIONARY_MAP[trimmed]) {
    return ENGLISH_DICTIONARY_MAP[trimmed];
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
  if (to === 'bn') {
    return translateWithManualDictionary(trimmed) || trimmed;
  }
  if (to === 'en') {
    return translateWithBanglaToEnglishDictionary(trimmed) || trimmed;
  }
  return trimmed;
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

/**
 * Automatically sync and translate English fields to Bangla.
 * If a Bangla field is empty or force is true, it translates from the English field.
 * If a Bangla field was already manually provided and force is false, it preserves it.
 */
export async function syncEnglishToBangla<T extends Record<string, string>>(
  englishFields: T,
  banglaFields: Partial<T> = {},
  force = false,
): Promise<T> {
  const result: any = { ...banglaFields };
  const toTranslate: Record<string, string> = {};

  for (const [key, val] of Object.entries(englishFields)) {
    if (typeof val === 'string' && val.trim()) {
      const currentBn = banglaFields[key];
      if (force || !currentBn || !currentBn.trim()) {
        toTranslate[key] = val.trim();
      } else {
        result[key] = currentBn;
      }
    } else {
      result[key] = banglaFields[key] || '';
    }
  }

  if (Object.keys(toTranslate).length > 0) {
    const translated = await translateBatch(toTranslate, 'en', 'bn');
    Object.assign(result, translated);
  }

  return result as T;
}

/**
 * Automatically sync and translate Bangla fields to English.
 * If an English field is empty or force is true, it translates from the Bangla field.
 * If an English field was already manually provided and force is false, it preserves it.
 */
export async function syncBanglaToEnglish<T extends Record<string, string>>(
  banglaFields: T,
  englishFields: Partial<T> = {},
  force = false,
): Promise<T> {
  const result: any = { ...englishFields };
  const toTranslate: Record<string, string> = {};

  for (const [key, val] of Object.entries(banglaFields)) {
    if (typeof val === 'string' && val.trim()) {
      const currentEn = englishFields[key];
      if (force || !currentEn || !currentEn.trim()) {
        toTranslate[key] = val.trim();
      } else {
        result[key] = currentEn;
      }
    } else {
      result[key] = englishFields[key] || '';
    }
  }

  if (Object.keys(toTranslate).length > 0) {
    const translated = await translateBatch(toTranslate, 'bn', 'en');
    Object.assign(result, translated);
  }

  return result as T;
}

/**
 * Ensures both English and Bangla contents exist prior to form submission.
 * - If English is provided and Bangla is missing: translates en -> bn.
 * - If Bangla is provided and English is missing: translates bn -> en.
 * - Existing manual translations in either language are strictly preserved!
 */
export async function syncBilingualFields<T extends Record<string, string>>(
  englishFields: T,
  banglaFields: Partial<T> = {},
): Promise<{ english: T; bangla: T }> {
  const finalEn: any = { ...englishFields };
  const finalBn: any = { ...banglaFields };

  const toBn: Record<string, string> = {};
  const toEn: Record<string, string> = {};

  for (const key of Object.keys(englishFields)) {
    const enVal = (englishFields[key] || '').trim();
    const bnVal = (banglaFields[key] || '').trim();

    if (enVal && !bnVal) {
      toBn[key] = enVal;
    } else if (bnVal && !enVal) {
      toEn[key] = bnVal;
    }
  }

  const [translatedBn, translatedEn] = await Promise.all([
    Object.keys(toBn).length > 0 ? translateBatch(toBn, 'en', 'bn') : Promise.resolve({}),
    Object.keys(toEn).length > 0 ? translateBatch(toEn, 'bn', 'en') : Promise.resolve({}),
  ]);

  Object.assign(finalBn, translatedBn);
  Object.assign(finalEn, translatedEn);

  return { english: finalEn as T, bangla: finalBn as T };
}
