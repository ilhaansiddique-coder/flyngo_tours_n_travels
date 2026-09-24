'use client';

import { useState, useCallback, useRef } from 'react';
import {
  autoTranslate,
  syncEnglishToBangla,
  syncBanglaToEnglish,
  syncBilingualFields,
} from '@/lib/translations/translator';

export function useAutoTranslateSync() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatingMessage, setTranslatingMessage] = useState<string | null>(null);
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const lastAutoTranslations = useRef<Record<string, string>>({});

  /**
   * Bi-directional debounced translation when user types in English or Bangla.
   * - When user types in English (fromLang: 'en', toLang: 'bn'): auto-translates to Bangla.
   * - When user types in Bangla (fromLang: 'bn', toLang: 'en'): auto-translates to English.
   * Doesn't require pressing any button.
   * If target field was already manually customized, it won't overwrite unless target is empty
   * or matches previous auto-translation.
   */
  const debouncedAutoTranslate = useCallback(
    (
      fieldKey: string,
      sourceText: string,
      currentTargetText: string,
      fromLang: 'en' | 'bn',
      toLang: 'en' | 'bn',
      onSetTarget: (translated: string) => void,
      delayMs = 650
    ) => {
      const timerKey = `${fieldKey}_${fromLang}_to_${toLang}`;
      if (debounceTimers.current[timerKey]) {
        clearTimeout(debounceTimers.current[timerKey]);
      }

      const trimmedSource = (sourceText || '').trim();
      const trimmedTarget = (currentTargetText || '').trim();

      // If source is empty, no translation needed
      if (!trimmedSource) {
        return;
      }

      // Check if user already typed a manual translation that isn't from auto-translate
      const previousTranslation = lastAutoTranslations.current[timerKey] || '';
      const isTargetManuallySet = trimmedTarget.length > 0 && trimmedTarget !== previousTranslation;

      if (isTargetManuallySet) {
        return;
      }

      debounceTimers.current[timerKey] = setTimeout(async () => {
        try {
          setIsTranslating(true);
          setTranslatingMessage(
            toLang === 'bn' ? 'Auto-translating to বাংলা...' : 'Auto-translating to English...'
          );
          const translated = await autoTranslate(trimmedSource, fromLang, toLang);
          if (translated) {
            lastAutoTranslations.current[timerKey] = translated.trim();
            onSetTarget(translated);
          }
        } catch (err) {
          console.warn(`Auto-translation error for ${fieldKey} (${fromLang}->${toLang}):`, err);
        } finally {
          setIsTranslating(false);
          setTranslatingMessage(null);
        }
      }, delayMs);
    },
    []
  );

  /**
   * Translates an individual field on blur if the counterpart is empty.
   */
  const handleFieldBlur = useCallback(
    async (
      sourceText: string,
      currentTargetText: string,
      fromLang: 'en' | 'bn',
      toLang: 'en' | 'bn',
      onSetTarget: (translated: string) => void
    ) => {
      const trimmedSource = (sourceText || '').trim();
      const trimmedTarget = (currentTargetText || '').trim();
      if (!trimmedSource || trimmedTarget.length > 0) {
        return;
      }
      try {
        setIsTranslating(true);
        setTranslatingMessage(
          toLang === 'bn' ? 'Auto-translating to বাংলা...' : 'Auto-translating to English...'
        );
        const translated = await autoTranslate(trimmedSource, fromLang, toLang);
        if (translated) {
          const timerKey = `blur_${fromLang}_to_${toLang}`;
          lastAutoTranslations.current[timerKey] = translated.trim();
          onSetTarget(translated);
        }
      } catch (err) {
        console.warn(`Auto-translation on blur error (${fromLang}->${toLang}):`, err);
      } finally {
        setIsTranslating(false);
        setTranslatingMessage(null);
      }
    },
    []
  );

  /**
   * Ensures all fields have both English and Bangla translations right before form submission.
   * Guarantees that any English content gets Bangla and any Bangla content gets English,
   * while completely preserving manual translations.
   */
  const ensureBilingualOnSubmit = useCallback(
    async <T extends Record<string, string>>(
      englishFields: T,
      banglaFields: Partial<T>
    ): Promise<{ english: T; bangla: T }> => {
      setIsTranslating(true);
      setTranslatingMessage('Finalizing bilingual translations...');
      try {
        return await syncBilingualFields(englishFields, banglaFields);
      } finally {
        setIsTranslating(false);
        setTranslatingMessage(null);
      }
    },
    []
  );

  /**
   * Backward-compatible helper for existing calls.
   */
  const ensureBanglaOnSubmit = useCallback(
    async <T extends Record<string, string>>(
      englishFields: T,
      currentBanglaFields: Partial<T>
    ): Promise<T> => {
      const { bangla } = await ensureBilingualOnSubmit(englishFields, currentBanglaFields);
      return bangla;
    },
    [ensureBilingualOnSubmit]
  );

  /**
   * Force sync all fields in either direction (e.g. when user clicks "Re-translate All").
   */
  const forceSyncAll = useCallback(
    async <T extends Record<string, string>>(
      fields: T,
      fromLang: 'en' | 'bn',
      toLang: 'en' | 'bn',
      onApply: (translated: T) => void
    ) => {
      setIsTranslating(true);
      setTranslatingMessage(
        toLang === 'bn' ? 'Translating all to বাংলা...' : 'Translating all to English...'
      );
      try {
        let synced: T;
        if (fromLang === 'en' && toLang === 'bn') {
          synced = await syncEnglishToBangla(fields, {}, true);
        } else {
          synced = await syncBanglaToEnglish(fields, {}, true);
        }
        onApply(synced);
        return synced;
      } finally {
        setIsTranslating(false);
        setTranslatingMessage(null);
      }
    },
    []
  );

  return {
    isTranslating,
    translatingMessage,
    debouncedAutoTranslate,
    handleFieldBlur,
    ensureBilingualOnSubmit,
    ensureBanglaOnSubmit,
    forceSyncAll,
  };
}
