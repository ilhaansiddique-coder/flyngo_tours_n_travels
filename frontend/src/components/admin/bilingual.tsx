'use client';

import { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { Locale } from '@/lib/i18n';

/**
 * Bilingual (English / Bangla) content authoring for admin forms.
 *
 * A field holds two values — en and bn. A small EN/BN toggle shows only ONE
 * language's input at a time (never both side-by-side). Toggling does not
 * discard the other language's text; both are stored in the form state and
 * submitted together, so admins can fill each language independently.
 *
 * Two usage modes:
 *   1. Grouped (recommended): wrap fields in <BiLangGroup> and use <BiInput> /
 *      <BiTextarea>. One shared toggle switches every field inside the group.
 *   2. Standalone: use <BiInputStandalone> / <BiTextareaStandalone>, each of
 *      which carries its own toggle.
 */

export interface BiLangValue {
  en: string;
  bn: string;
}

export const EMPTY_BILANG: BiLangValue = { en: '', bn: '' };

interface BiLangContextValue {
  lang: Locale;
  setLang: (l: Locale) => void;
}

const BiLangContext = createContext<BiLangContextValue | null>(null);

function useBiLangContext() {
  const ctx = useContext(BiLangContext);
  if (!ctx) throw new Error('BiLang components must be used inside <BiLangGroup>');
  return ctx;
}

/** Shared EN/BN pill toggle. Only highlights the active language. */
export function BiLangToggle({
  lang,
  onChange,
}: {
  lang: Locale;
  onChange: (l: Locale) => void;
}) {
  const options: Locale[] = ['en', 'bn'];
  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex items-center rounded-full p-0.5 border border-outline-variant bg-surface text-[11px]"
    >
      {options.map((opt) => {
        const active = lang === opt;
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt)}
            className={cn(
              'px-2 py-0.5 rounded-full font-bold uppercase tracking-wide transition-colors',
              active ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface',
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Groups one or more Bi* fields under a single shared EN/BN toggle.
 * Only the selected language's inputs are visible inside this group.
 */
export function BiLangGroup({
  label,
  children,
  toggle = true,
  defaultLang = 'en',
}: {
  label: string;
  toggle?: boolean;
  children: ReactNode;
  defaultLang?: Locale;
}) {
  const [lang, setLang] = useState<Locale>(defaultLang);
  const value = useMemo(() => ({ lang, setLang }), [lang]);
  return (
    <BiLangContext.Provider value={value}>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium text-on-surface">{label}</label>
          {toggle && <BiLangToggle lang={lang} onChange={setLang} />}
        </div>
        {children}
      </div>
    </BiLangContext.Provider>
  );
}

const inputBase =
  'w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container text-on-surface placeholder:text-on-surface-variant/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-colors';

function langBadge(bn: boolean) {
  return (
    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase text-on-surface-variant/50 select-none">
      {bn ? 'বাংলা' : 'EN'}
    </span>
  );
}

export interface BiInputProps {
  value: BiLangValue;
  onChange: (next: BiLangValue) => void;
  required?: boolean;
  disabled?: boolean;
  type?: string;
  placeholder?: string;
}

/** Single-line input that follows the nearest <BiLangGroup> language. */
export function BiInput({ value, onChange, required, disabled, type = 'text', placeholder }: BiInputProps) {
  const { lang } = useBiLangContext();
  return (
    <div className="relative">
      <input
        type={type}
        required={required}
        disabled={disabled}
        value={value[lang] ?? ''}
        onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
        placeholder={placeholder ?? (lang === 'bn' ? 'বাংলা লিখুন…' : 'Type in English…')}
        className={cn(inputBase, 'pr-12')}
      />
      {langBadge(lang === 'bn')}
    </div>
  );
}

/** Multi-line textarea that follows the nearest <BiLangGroup> language. */
export function BiTextarea({
  value,
  onChange,
  rows = 3,
  placeholder,
}: BiInputProps & { rows?: number }) {
  const { lang } = useBiLangContext();
  return (
    <div className="relative">
      <textarea
        value={value[lang] ?? ''}
        onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
        placeholder={placeholder ?? (lang === 'bn' ? 'বাংলা লিখুন…' : 'Type in English…')}
        rows={rows}
        className={cn(inputBase, 'resize-none pr-12')}
      />
      {langBadge(lang === 'bn')}
    </div>
  );
}

/** Standalone single-line input with its own EN/BN toggle. */
export function BiInputStandalone({
  label,
  required,
  value,
  onChange,
  placeholder,
  type = 'text',
}: { label: string; required?: boolean } & BiInputProps) {
  return (
    <BiLangGroup label={label}>
      <BiInput value={value} onChange={onChange} required={required} placeholder={placeholder} type={type} />
    </BiLangGroup>
  );
}

/** Standalone textarea with its own EN/BN toggle. */
export function BiTextareaStandalone({
  label,
  required,
  value,
  onChange,
  placeholder,
  rows = 3,
}: { label: string; required?: boolean; rows?: number } & BiInputProps) {
  return (
    <BiLangGroup label={label}>
      <BiTextarea value={value} onChange={onChange} rows={rows} placeholder={placeholder} />
    </BiLangGroup>
  );
}
