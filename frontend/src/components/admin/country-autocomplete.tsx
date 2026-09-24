'use client';

import { useEffect, useRef, useState, useCallback, useId } from 'react';
import { useApi } from '@/hooks/use-api';
import { Plus } from 'lucide-react';
import { searchWorldPlaces } from '@/lib/world-places';

export interface CountryOption {
  id?: string;
  name: string;
  slug?: string;
  flagUrl?: string | null;
  country?: string;
  continent?: string | null;
  cityName?: string;
  isCity?: boolean;
}

interface Props {
  value: string;
  onChange: (next: CountryOption) => void;
  onQueryChange?: (q: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  allowCreate?: boolean;
}

const inputClass =
  'w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container text-on-surface placeholder:text-on-surface-variant/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-colors';

export function CountryAutocomplete({
  value,
  onChange,
  onQueryChange,
  onBlur,
  placeholder = 'Type a country or city (e.g. Paris, Tokyo, Dhaka)…',
  required,
  className,
  allowCreate = true,
}: Props) {
  const { getDestinationAutocomplete, resolveDestination } = useApi();
  const listboxId = useId();
  const [query, setQuery] = useState(value || '');
  const [options, setOptions] = useState<CountryOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const fetchOptions = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) {
        setOptions([]);
        return;
      }

      // 1. Instant local world places search (countries + cities)
      const localMatches: CountryOption[] = searchWorldPlaces(trimmed, 30).map((p) => ({
        name: p.name,
        country: p.country,
        continent: p.continent,
        flagUrl: p.flagUrl,
        slug: p.slug,
        cityName: p.cityName,
        isCity: p.isCity,
      }));

      setOptions(localMatches);

      // 2. Fetch server destinations to attach database IDs
      try {
        setLoading(true);
        const res = await getDestinationAutocomplete(trimmed, 30);
        const serverItems = (Array.isArray(res) ? res : (res as any)?.data || []) as CountryOption[];

        if (serverItems.length > 0) {
          const serverMap = new Map<string, CountryOption>();
          for (const s of serverItems) {
            serverMap.set(s.name.toLowerCase(), s);
            if (s.slug) serverMap.set(s.slug.toLowerCase(), s);
          }

          const merged: CountryOption[] = [];
          const seen = new Set<string>();

          // Priority to server items that already have IDs
          for (const s of serverItems) {
            const key = s.name.toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              merged.push(s);
            }
          }

          // Merge local matches
          for (const loc of localMatches) {
            const key = loc.name.toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              const serverMatch = serverMap.get(key) || (loc.slug ? serverMap.get(loc.slug.toLowerCase()) : undefined);
              merged.push(serverMatch ? { ...loc, id: serverMatch.id } : loc);
            }
          }

          setOptions(merged.slice(0, 30));
        }
      } catch {
        // Keep local matches
      } finally {
        setLoading(false);
      }
    },
    [getDestinationAutocomplete],
  );

  useEffect(() => {
    const t = setTimeout(() => fetchOptions(query), 150);
    return () => clearTimeout(t);
  }, [query, fetchOptions]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const select = async (opt: CountryOption) => {
    setQuery(opt.name);
    setOpen(false);
    setActiveIndex(-1);

    // If item doesn't have a DB id, auto-resolve in backend so it's stored in database
    if (!opt.id) {
      try {
        const resolved = (await resolveDestination(opt.name)) as CountryOption;
        onChange({ ...opt, id: resolved?.id || opt.id });
        return;
      } catch {
        // fallback
      }
    }
    onChange(opt);
  };

  const createNew = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      setCreating(true);
      const created = (await resolveDestination(trimmed)) as CountryOption;
      setQuery(created.name);
      setOpen(false);
      setActiveIndex(-1);
      onChange(created);
    } catch {
      // fall back to free text so the submit still carries the typed name
      setOpen(false);
      setActiveIndex(-1);
      onChange({ name: trimmed });
    } finally {
      setCreating(false);
    }
  };

  const handleBlur = () => {
    blurTimer.current = setTimeout(() => {
      setOpen(false);
      const trimmed = query.trim();
      if (trimmed && trimmed !== value) {
        // Auto-save: create/resolve the typed country/city so it shows next time.
        createNew(trimmed);
      }
      onBlur?.();
    }, 120);
  };

  const exactMatch = options.some((o) => o.name.toLowerCase() === query.trim().toLowerCase());
  const showCreate = allowCreate && query.trim().length > 0 && !exactMatch;
  const listOpen = open && (loading || options.length > 0 || showCreate);
  const listLength = options.length + (showCreate ? 1 : 0);

  useEffect(() => {
    setActiveIndex(-1);
  }, [query, options]);

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-index="${activeIndex}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setOpen(true);
        setActiveIndex(e.key === 'ArrowDown' ? 0 : listLength - 1);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (listLength === 0) return;
      setActiveIndex((i) => (i + 1) % listLength);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (listLength === 0) return;
      setActiveIndex((i) => (i <= 0 ? listLength - 1 : i - 1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0) {
        e.preventDefault();
        const isCreate = showCreate && activeIndex === options.length;
        const opt = isCreate ? null : options[activeIndex];
        if (opt) {
          select(opt);
        } else if (isCreate) {
          createNew(query);
        }
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="relative" ref={wrapRef}>
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={listOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `country-option-${activeIndex}` : undefined}
        className={className || inputClass}
        value={query}
        placeholder={placeholder}
        required={required}
        onChange={(e) => {
          setQuery(e.target.value);
          onQueryChange?.(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />

      {listOpen && (
        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-72 overflow-auto rounded-lg border border-outline-variant bg-surface-container shadow-xl"
        >
          {loading && options.length === 0 && (
            <div className="px-3 py-2 text-xs text-on-surface-variant">Searching world places…</div>
          )}

          {options.map((o, idx) => (
            <button
              type="button"
              key={o.id || `${o.name}-${idx}`}
              id={`country-option-${idx}`}
              role="option"
              aria-selected={activeIndex === idx}
              data-index={idx}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                activeIndex === idx
                  ? 'bg-surface-container-high text-on-surface'
                  : 'hover:bg-surface-container-high'
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                if (blurTimer.current) clearTimeout(blurTimer.current);
                select(o);
              }}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              {o.flagUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={o.flagUrl} alt="" className="h-4 w-6 rounded-sm object-cover flex-shrink-0" />
              ) : (
                <span className="h-4 w-6 rounded-sm bg-surface-container-highest flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <span className="font-medium text-on-surface">
                  {o.cityName || o.name}
                </span>
                {o.cityName && o.country && (
                  <span className="text-xs text-on-surface-variant ml-1.5 font-normal">
                    ({o.country})
                  </span>
                )}
              </div>
              {o.isCity ? (
                <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant">
                  City
                </span>
              ) : (
                <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                  Country
                </span>
              )}
              {o.continent && (
                <span className="text-xs text-on-surface-variant/80 hidden sm:inline">{o.continent}</span>
              )}
            </button>
          ))}

          {showCreate && (
            <button
              type="button"
              id={`country-option-${options.length}`}
              role="option"
              aria-selected={activeIndex === options.length}
              data-index={options.length}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-primary ${
                activeIndex === options.length ? 'bg-surface-container-high' : 'hover:bg-surface-container-high'
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                if (blurTimer.current) clearTimeout(blurTimer.current);
                createNew(query);
              }}
              onMouseEnter={() => setActiveIndex(options.length)}
            >
              <Plus className="h-4 w-4" />
              {creating ? 'Creating…' : `Create "${query.trim()}"`}
            </button>
          )}

          {!loading && options.length === 0 && !showCreate && (
            <div className="px-3 py-2 text-xs text-on-surface-variant">No matches</div>
          )}

          <div className="sticky bottom-0 border-t border-outline-variant/60 bg-surface-container-low px-3 py-1.5 text-[11px] text-on-surface-variant flex items-center justify-between">
            <span>🌍 2,190+ countries & cities worldwide</span>
            {options.length > 0 && <span>{options.length} {options.length === 1 ? 'match' : 'matches'}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
