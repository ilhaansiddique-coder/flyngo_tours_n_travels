'use client';

import { useEffect, useRef, useState, useCallback, KeyboardEvent } from 'react';
import { MapPin, Flag, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApi } from '@/hooks/use-api';
import type { Destination } from '@/types';

export interface VisaCountryItem {
  id: string;
  name: string;
  slug: string;
  region?: string | null;
  flagUrl?: string | null;
}

interface DestinationAutocompleteProps {
  label: string;
  value: string;
  onChange: (value: string, item?: Destination | VisaCountryItem) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  helperText?: string;
  mode?: 'city' | 'country';
}

function formatDestination(d: Destination): string {
  return d.country && d.country !== d.name ? `${d.name}, ${d.country}` : d.name;
}

export function DestinationAutocomplete({
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  disabled,
  helperText,
  mode = 'city',
}: DestinationAutocompleteProps) {
  const { getDestinations, getVisaCountries } = useApi();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<(Destination | VisaCountryItem)[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState<number>(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(
    async (q: string) => {
      if (!q || q.trim().length < 1) {
        setItems([]);
        return;
      }
      setLoading(true);
      try {
        if (mode === 'country') {
          const res: any = await getVisaCountries({ q: q.trim(), limit: '8' });
          const list = res?.items ?? res?.data ?? res ?? [];
          setItems(Array.isArray(list) ? list : []);
        } else {
          const res: any = await getDestinations({ q: q.trim(), limit: '8' });
          const list = res?.items ?? res?.data ?? res ?? [];
          setItems(Array.isArray(list) ? list : []);
        }
        setOpen(true);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [getDestinations, getVisaCountries, mode],
  );

  function handleInput(next: string) {
    onChange(next);
    setHighlight(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(next), 250);
  }

  function handlePick(item: Destination | VisaCountryItem) {
    if (mode === 'country') {
      const country = item as VisaCountryItem;
      onChange(country.name, country);
    } else {
      const dest = item as Destination;
      const formatted = formatDestination(dest);
      onChange(formatted, dest);
    }
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

  return (
    <div ref={wrapperRef} className="w-full relative">
      <label className="block text-sm font-medium text-on-surface mb-1.5">
        {label}
        {required && <span className="text-error ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => items.length > 0 && setOpen(true)}
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
          aria-controls="destination-listbox"
          aria-expanded={open}
          role="combobox"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : mode === 'country' ? (
            <Flag className="w-4 h-4" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
        </div>
      </div>

      {open && items.length > 0 && (
        <ul
          id="destination-listbox"
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-xl border shadow-lg bg-surface-container text-on-surface"
          style={{ borderColor: 'var(--color-outline-variant)' }}
        >
          {items.map((item, i) => {
            const isCountry = mode === 'country';
            const name = (item as any).name;
            const region =
              isCountry ? ((item as VisaCountryItem).region ?? '') : ((item as Destination).continent ?? '');
            const sub = isCountry
              ? ''
              : (item as Destination).country && (item as Destination).country !== (item as Destination).name
                ? `, ${(item as Destination).country}`
                : '';
            return (
              <li
                key={(item as any).id}
                role="option"
                aria-selected={highlight === i}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handlePick(item);
                }}
                onMouseEnter={() => setHighlight(i)}
                className={cn(
                  'px-4 py-2.5 cursor-pointer text-sm flex items-center gap-2 transition-colors',
                  highlight === i
                    ? 'bg-primary/15 text-on-surface'
                    : 'hover:bg-surface-container-high',
                )}
              >
                {isCountry ? (
                  <Flag className="w-3.5 h-3.5 shrink-0 text-muted" />
                ) : (
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-muted" />
                )}
                <span className="font-medium">{name}</span>
                {sub && <span className="text-muted">{sub}</span>}
                {region && (
                  <span className="ml-auto text-[10px] uppercase tracking-widest text-muted">
                    {region}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {open && !loading && (value || '').trim().length > 0 && items.length === 0 && (
        <div
          className="absolute z-50 mt-1 w-full rounded-xl border shadow-lg bg-surface-container text-muted text-sm px-4 py-3"
          style={{ borderColor: 'var(--color-outline-variant)' }}
        >
          No {mode === 'country' ? 'countries' : 'destinations'} match &ldquo;{value || ''}&rdquo;. You can
          still type one manually.
        </div>
      )}

      {error && <p className="mt-1 text-sm text-error">{error}</p>}
      {!error && helperText && <p className="mt-1 text-sm text-on-surface-variant">{helperText}</p>}
    </div>
  );
}
