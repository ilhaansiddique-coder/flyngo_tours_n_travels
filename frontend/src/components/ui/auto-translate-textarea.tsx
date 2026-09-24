'use client';

import { useState } from 'react';
import { Sparkles, Languages, Check } from 'lucide-react';
import { autoTranslate, hasBanglaChars } from '@/lib/translations/translator';

interface AutoTranslateTextareaProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
  className?: string;
  helpText?: string;
}

export function AutoTranslateTextarea({
  value,
  onChange,
  label,
  placeholder,
  rows = 3,
  className = '',
  helpText,
}: AutoTranslateTextareaProps) {
  const [translating, setTranslating] = useState(false);
  const [translatedJustNow, setTranslatedJustNow] = useState(false);

  const isCurrentBangla = hasBanglaChars(value);

  const handleTranslate = async () => {
    if (!value.trim()) return;
    try {
      setTranslating(true);
      const targetLang = isCurrentBangla ? 'en' : 'bn';
      const sourceLang = isCurrentBangla ? 'bn' : 'en';
      const result = await autoTranslate(value, sourceLang, targetLang);
      if (result) {
        onChange(result);
        setTranslatedJustNow(true);
        setTimeout(() => setTranslatedJustNow(false), 2000);
      }
    } catch (err) {
      console.error('Failed to translate textarea:', err);
    } finally {
      setTranslating(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        {label ? (
          <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider">
            {label}
          </label>
        ) : <span />}

        {value.trim().length > 0 && (
          <button
            type="button"
            onClick={handleTranslate}
            disabled={translating}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline px-2 py-0.5 rounded-full border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/30 transition-colors disabled:opacity-50"
          >
            {translating ? (
              <Sparkles className="w-3 h-3 animate-spin" />
            ) : translatedJustNow ? (
              <Check className="w-3 h-3 text-emerald-500" />
            ) : (
              <Languages className="w-3 h-3" />
            )}
            <span>
              {translating
                ? 'অনুবাদ হচ্ছে…'
                : isCurrentBangla
                ? 'Auto-Translate to English'
                : 'Auto-Translate to বাংলা'}
            </span>
          </button>
        )}
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={className || "w-full px-4 py-3 rounded-xl text-on-surface placeholder:text-muted outline-none border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all bg-surface-container/60 backdrop-blur-md resize-none text-sm"}
      />

      {helpText && (
        <p className="text-[11px] text-muted flex items-center justify-between">
          <span>{helpText}</span>
          <span className="text-[10px] uppercase font-bold text-muted tracking-wider">
            {isCurrentBangla ? 'বাংলায় লেখা' : 'English'}
          </span>
        </p>
      )}
    </div>
  );
}
