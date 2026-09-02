'use client';

import { useEffect, useRef, useState, useCallback, KeyboardEvent } from 'react';
import { Flag, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { filterNationalities, type Nationality } from '@/lib/nationalities';

interface NationalityAutocompleteProps {
  label: string;
  value: string;
  onChange: (value: string, nationality?: Nationality) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  helperText?: string;
}

export function NationalityAutocomplete({
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  disabled,
  helperText,
}: NationalityAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Nationality[]>([]);
  const [highlight, setHighlight] = useState<number>(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const recompute = useCallback((q: string) => {
    setItems(filterNationalities(q));
  }, []);

  function handleInput(next: string) {
    onChange(next);
    setHighlight(-1);
    recompute(next);
    setOpen(true);
  }

  function handlePick(n: Nationality) {
    onChange(n.name, n);
    setOpen(false);
    setHighlight(-1);
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (!open || items.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => (h + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => (h <= 0 ? items.length - 1 : h - 1));
    } else if (e.key === 'Enter') {
      if (highlight >= 0 && items[highlight]) {
        e.preventDefault();
        handlePick(items[highlight]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  const showEmpty = open && (value || '').trim().length > 0 && items.length === 0;

  return (
    <div ref={wrapperRef} className="w-full relative">
      <label className="block text-sm font-medium text-on-surface mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => {
            recompute(value || '');
            setOpen(true);
          }}
          onKeyDown={handleKey}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="off"
          className={cn(
            'w-full pl-4 pr-10 py-3 rounded-xl border bg-surface-container/60 backdrop-blur-md',
            'text-on-surface placeholder:text-on-surface-variant/60',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50',
            error
              ? 'border-error/70 focus:ring-error/40'
              : 'border-outline-variant hover:border-outline',
          )}
          aria-autocomplete="list"
          aria-controls="nationality-listbox"
          aria-expanded={open}
          role="combobox"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
          {showEmpty ? <Loader2 className="w-4 h-4 animate-spin opacity-0" /> : <Flag className="w-4 h-4" />}
        </div>
      </div>

      {open && items.length > 0 && (
        <ul
          id="nationality-listbox"
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-xl border shadow-lg bg-surface-container text-on-surface"
          style={{ borderColor: 'var(--color-outline-variant)' }}
        >
          {items.map((n, i) => (
            <li
              key={n.code}
              role="option"
              aria-selected={highlight === i}
              onMouseDown={(e) => {
                e.preventDefault();
                handlePick(n);
              }}
              onMouseEnter={() => setHighlight(i)}
              className={cn(
                'px-4 py-2.5 cursor-pointer text-sm flex items-center gap-2 transition-colors',
                highlight === i
                  ? 'bg-primary/15 text-on-surface'
                  : 'hover:bg-surface-container-high',
              )}
            >
              <Flag className="w-3.5 h-3.5 shrink-0 text-muted" />
              <span className="font-medium">{n.name}</span>
              <span className="ml-auto text-[10px] uppercase tracking-widest text-muted">
                {n.code}
              </span>
            </li>
          ))}
        </ul>
      )}

      {showEmpty && (
        <div
          className="absolute z-50 mt-1 w-full rounded-xl border shadow-lg bg-surface-container text-muted text-sm px-4 py-3"
          style={{ borderColor: 'var(--color-outline-variant)' }}
        >
          No nationalities match &ldquo;{value}&rdquo;. You can still type one manually.
        </div>
      )}

      {error && <p className="mt-1 text-sm text-error">{error}</p>}
      {!error && helperText && <p className="mt-1 text-sm text-on-surface-variant">{helperText}</p>}
    </div>
  );
}
