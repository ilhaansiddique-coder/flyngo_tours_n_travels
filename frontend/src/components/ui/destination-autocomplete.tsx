'use client';

import { useEffect, useRef, useState, useCallback, KeyboardEvent } from 'react';
import { MapPin, Flag, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApi } from '@/hooks/use-api';
import type { Destination } from '@/types';
import { COUNTRY_DIALS, type CountryDial } from '@/lib/country-dial-codes';

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
  filterForPackages?: boolean;
}

function formatDestination(d: Destination): string {
  return d.country && d.country !== d.name ? `${d.name}, ${d.country}` : d.name;
}

function filterCountriesLocal(q: string): CountryDial[] {
  const term = q.trim().toLowerCase();
  if (!term) return COUNTRY_DIALS;
  const startsWith: CountryDial[] = [];
  const contains: CountryDial[] = [];
  for (const c of COUNTRY_DIALS) {
    const name = c.name.toLowerCase();
    const code = c.code.toLowerCase();
    if (name.startsWith(term) || code.startsWith(term)) {
      startsWith.push(c);
    } else if (name.includes(term) || code.includes(term)) {
      contains.push(c);
    }
  }
  return [...startsWith, ...contains];
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
  filterForPackages = false,
}: DestinationAutocompleteProps) {
  const { getDestinationAutocomplete, getVisaCountries } = useApi();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<(Destination | VisaCountryItem | CountryDial)[]>([]);
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
        if (mode === 'country') {
          setItems(COUNTRY_DIALS);
        } else {
          setItems([]);
        }
        return;
      }
      setLoading(true);
      try {
        if (mode === 'country') {
          // Always include the full local country list so every country in the world
          // shows up, regardless of what the admin has added to visa-countries.
          const local = filterCountriesLocal(q);
          let apiResults: VisaCountryItem[] = [];
          try {
            const res: any = await getVisaCountries({ q: q.trim(), limit: '8' });
            const list = res?.items ?? res?.data ?? res ?? [];
            apiResults = Array.isArray(list) ? list : [];
          } catch {
            // ignore — local list is the source of truth
          }
          // Merge: local first (prefix matches), then any extra API matches that
          // aren't already in the local list by name.
          const localNames = new Set(local.map((c) => c.name.toLowerCase()));
          const extras = apiResults.filter(
            (a) => !localNames.has(a.name.toLowerCase()),
          );
          setItems([...local, ...extras]);
        } else {
          const res: any = await getDestinationAutocomplete(q.trim(), 8, filterForPackages);
          const list = res?.items ?? res?.data ?? res ?? [];
          setItems(Array.isArray(list) ? list : []);
        }
        setOpen(true);
      } catch {
        if (mode === 'country') {
          setItems(filterCountriesLocal(q));
        } else {
          setItems([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [getDestinationAutocomplete, getVisaCountries, mode, filterForPackages],
  );

  function handleInput(next: string) {
    onChange(next);
    setHighlight(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(next), 200);
  }

  function handlePick(item: Destination | VisaCountryItem | CountryDial) {
    if (mode === 'country') {
      const c = item as CountryDial | VisaCountryItem;
      if ('dial' in c) {
        const visaLike: VisaCountryItem = {
          id: (c as CountryDial).code,
          name: (c as CountryDial).name,
          slug: (c as CountryDial).code.toLowerCase(),
          region: null,
          flagUrl: null,
        };
        onChange(visaLike.name, visaLike);
      } else {
        onChange(c.name, c as VisaCountryItem);
      }
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

  // Show the full local list as soon as the input is focused in country mode,
  // before the user has typed anything — so they can scroll the whole world.
  function handleFocus() {
    if (mode === 'country') {
      setItems(COUNTRY_DIALS);
      setOpen(true);
      setHighlight(-1);
    } else if (items.length > 0) {
      setOpen(true);
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
          onFocus={handleFocus}
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
          className="absolute z-50 mt-1 w-full max-h-72 overflow-auto rounded-xl border shadow-lg bg-surface-container text-on-surface"
          style={{ borderColor: 'var(--color-outline-variant)' }}
        >
          {items.map((item, i) => {
            const isCountryMode = mode === 'country';
            const isLocalCountry =
              isCountryMode && (item as CountryDial).dial !== undefined;
            const name = (item as any).name;
            const region =
              isCountryMode && isLocalCountry
                ? ((item as CountryDial).dial ?? '')
                : isCountryMode
                  ? ((item as VisaCountryItem).region ?? '')
                  : ((item as Destination).continent ?? '');
            const sub = isCountryMode
              ? ''
              : (item as Destination).country &&
                  (item as Destination).country !== (item as Destination).name
                ? `, ${(item as Destination).country}`
                : '';
            return (
              <li
                key={(item as any).id ?? (item as any).code ?? name}
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
                {isCountryMode ? (
                  <span className="text-base leading-none w-5 shrink-0">
                    {isLocalCountry ? (
                      (item as CountryDial).flag
                    ) : (
                      <Flag className="w-3.5 h-3.5 text-muted" />
                    )}
                  </span>
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
          {filterForPackages ? (
            <>
              <p>These tour packages aren&apos;t available right now.</p>
              <p className="mt-1">এই টুর প্যাকেজগুলো এখন উপলব্ধ নয়।</p>
            </>
          ) : (
            <>
              No {mode === 'country' ? 'countries' : 'destinations'} match &ldquo;{value || ''}&rdquo;. You can
              still type one manually.
            </>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-error">{error}</p>}
      {!error && helperText && <p className="mt-1 text-sm text-on-surface-variant">{helperText}</p>}
    </div>
  );
}
