'use client';

import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { ChevronDown, Search, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  COUNTRY_DIALS,
  DEFAULT_COUNTRY_CODE,
  findDialByCode,
  type CountryDial,
} from '@/lib/country-dial-codes';

interface PhoneInputProps {
  label?: string;
  countryCode: string;
  number: string;
  onCountryCodeChange: (code: string) => void;
  onNumberChange: (number: string) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  helperText?: string;
  placeholder?: string;
  name?: string;
  id?: string;
}

export function PhoneInput({
  label,
  countryCode,
  number,
  onCountryCodeChange,
  onNumberChange,
  required,
  error,
  disabled,
  helperText,
  placeholder,
  name,
  id,
}: PhoneInputProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState<number>(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected: CountryDial =
    findDialByCode(countryCode) ?? findDialByCode(DEFAULT_COUNTRY_CODE)!;

  const filtered: CountryDial[] = (() => {
    const term = query.trim().toLowerCase();
    if (!term) return COUNTRY_DIALS;
    const startsWith: CountryDial[] = [];
    const contains: CountryDial[] = [];
    for (const c of COUNTRY_DIALS) {
      const name = c.name.toLowerCase();
      const code = c.code.toLowerCase();
      const dial = c.dial;
      if (name.startsWith(term) || code.startsWith(term) || dial.includes(term)) {
        startsWith.push(c);
      } else if (name.includes(term) || code.includes(term)) {
        contains.push(c);
      }
    }
    return [...startsWith, ...contains];
  })();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function pick(c: CountryDial) {
    onCountryCodeChange(c.code);
    setOpen(false);
    setQuery('');
    setHighlight(-1);
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (!open || filtered.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => (h + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => (h <= 0 ? filtered.length - 1 : h - 1));
    } else if (e.key === 'Enter') {
      if (highlight >= 0 && filtered[highlight]) {
        e.preventDefault();
        pick(filtered[highlight]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  }

  const inputId = id ?? `phone-${name ?? 'input'}`;

  return (
    <div className="w-full" ref={wrapperRef}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-on-surface mb-1.5">
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      <div
        className={cn(
          'flex w-full overflow-hidden rounded-xl border bg-surface-container/60 backdrop-blur-md',
          'transition-all duration-200',
          error
            ? 'border-error/70 focus-within:ring-2 focus-within:ring-error/40'
            : 'border-outline-variant hover:border-outline focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary/50',
        )}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setOpen((o) => !o);
            setQuery('');
            setHighlight(-1);
          }}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex items-center gap-1.5 px-3 py-3 border-r border-outline-variant bg-surface-container/40 hover:bg-surface-container transition-colors disabled:opacity-50"
        >
          <span className="text-base leading-none">{selected.flag}</span>
          <span className="text-sm font-medium text-on-surface">{selected.dial}</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted" />
        </button>

        <div className="relative flex-1">
          <input
            id={inputId}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            value={number || ''}
            onChange={(e) => onNumberChange(e.target.value)}
            placeholder={placeholder ?? 'Phone number'}
            required={required}
            disabled={disabled}
            name={name}
            className="w-full pl-10 pr-4 py-3 bg-transparent text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none"
            aria-invalid={!!error}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
            <Phone className="w-4 h-4" />
          </div>
        </div>
      </div>

      {open && (
        <div
          className="absolute z-50 mt-1 w-full max-w-sm rounded-xl border shadow-lg bg-surface-container text-on-surface"
          style={{ borderColor: 'var(--color-outline-variant)' }}
        >
          <div className="relative border-b border-outline-variant/40">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlight(-1);
              }}
              onKeyDown={handleKey}
              placeholder="Search country or code"
              className="w-full pl-9 pr-3 py-2.5 bg-transparent text-sm focus:outline-none"
            />
          </div>
          <ul role="listbox" className="max-h-64 overflow-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-muted">No country matches &ldquo;{query}&rdquo;.</li>
            ) : (
              filtered.map((c, i) => (
                <li
                  key={c.code}
                  role="option"
                  aria-selected={c.code === countryCode}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(c);
                  }}
                  onMouseEnter={() => setHighlight(i)}
                  className={cn(
                    'px-4 py-2.5 cursor-pointer text-sm flex items-center gap-2 transition-colors',
                    highlight === i || c.code === countryCode
                      ? 'bg-primary/15 text-on-surface'
                      : 'hover:bg-surface-container-high',
                  )}
                >
                  <span className="text-base leading-none">{c.flag}</span>
                  <span className="font-medium">{c.name}</span>
                  <span className="ml-auto text-xs text-muted">{c.dial}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-error">{error}</p>}
      {!error && helperText && <p className="mt-1 text-sm text-on-surface-variant">{helperText}</p>}
    </div>
  );
}

export default PhoneInput;
