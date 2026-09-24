'use client';

import { useEffect, useRef, useState, useCallback, useMemo, useId } from 'react';
import { useApi } from '@/hooks/use-api';
import { Plus, X } from 'lucide-react';
import type { CountryOption } from './country-autocomplete';
import { searchWorldPlaces } from '@/lib/world-places';

interface Props {
  value: CountryOption[];
  onChange: (next: CountryOption[]) => void;
  placeholder?: string;
  className?: string;
  allowCreate?: boolean;
  disabled?: CountryOption[];
}

const inputClass =
  'w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container text-on-surface placeholder:text-on-surface-variant/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-colors';

export function MultiCountryAutocomplete({
  value,
  onChange,
  placeholder = 'Type to add any country or city…',
  className,
  allowCreate = true,
  disabled,
}: Props) {
  const { getDestinationAutocomplete, resolveDestination } = useApi();
  const listboxId = useId();
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<CountryOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const listRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const disabledKeys = useMemo(
    () =>
      new Set(
        (disabled || [])
          .map((d) => d.id || d.name?.toLowerCase())
          .filter((k): k is string => typeof k === 'string' && k.length > 0),
      ),
    [disabled],
  );

  const selectedKeys = useMemo(
    () =>
      new Set(
        value
          .map((d) => d.id || d.name?.toLowerCase())
          .filter((k): k is string => typeof k === 'string' && k.length > 0),
      ),
    [value],
  );

  const fetchOptions = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) {
        setOptions([]);
        return;
      }

      // 1. Instant local world places
      const localMatches: CountryOption[] = searchWorldPlaces(trimmed, 30).map((p) => ({
        name: p.name,
        country: p.country,
        continent: p.continent,
        flagUrl: p.flagUrl,
        slug: p.slug,
        cityName: p.cityName,
        isCity: p.isCity,
        isAirport: p.isAirport,
        iata: p.iata,
        airportName: p.airportName,
      }));

      setOptions(localMatches.filter((o) => !selectedKeys.has(o.id || o.name?.toLowerCase())));

      // 2. Query server
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

          for (const s of serverItems) {
            const key = s.name.toLowerCase();
            if (!seen.has(key) && !selectedKeys.has(s.id || key)) {
              seen.add(key);
              merged.push(s);
            }
          }

          for (const loc of localMatches) {
            const key = loc.name.toLowerCase();
            if (!seen.has(key) && !selectedKeys.has(loc.id || key)) {
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
    [getDestinationAutocomplete, selectedKeys],
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

  useEffect(() => {
    setActiveIndex(-1);
  }, [query, options]);

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-index="${activeIndex}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const add = async (opt: CountryOption) => {
    if (selectedKeys.has(opt.id || opt.name?.toLowerCase())) return;
    setQuery('');
    setOpen(false);
    setActiveIndex(-1);

    // If option has no id, resolve in backend so it gets saved
    let optToAdd = opt;
    if (!opt.id) {
      try {
        const resolved = (await resolveDestination(opt.name)) as CountryOption;
        if (resolved?.id) {
          optToAdd = { ...opt, id: resolved.id };
        }
      } catch {
        // fallback
      }
    }
    onChange([...value, optToAdd]);
  };

  const remove = (opt: CountryOption) => {
    onChange(
      value.filter(
        (d) => !(d.id && opt.id && d.id === opt.id) && d.name?.toLowerCase() !== opt.name?.toLowerCase(),
      ),
    );
  };

  const createNew = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || selectedKeys.has(trimmed.toLowerCase())) {
      setQuery('');
      setOpen(false);
      return;
    }
    try {
      setCreating(true);
      const created = (await resolveDestination(trimmed)) as CountryOption;
      add(created);
    } catch {
      add({ name: trimmed });
    } finally {
      setCreating(false);
    }
  };

  const handleBlur = () => {
    blurTimer.current = setTimeout(() => {
      setOpen(false);
    }, 120);
  };

  const filteredAvailable = options.filter((o) => !disabledKeys.has(o.id || o.name?.toLowerCase()));
  const trimmedQuery = query.trim();
  const exactMatch = filteredAvailable.some((o) => o.name.toLowerCase() === trimmedQuery.toLowerCase());
  const showCreate =
    allowCreate &&
    trimmedQuery.length > 0 &&
    !exactMatch &&
    !selectedKeys.has(trimmedQuery.toLowerCase());
  const listOpen = open && (loading || filteredAvailable.length > 0 || showCreate);
  const listLength = filteredAvailable.length + (showCreate ? 1 : 0);

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
      e.preventDefault();
      if (activeIndex >= 0) {
        const isCreate = showCreate && activeIndex === filteredAvailable.length;
        const opt = isCreate ? null : filteredAvailable[activeIndex];
        if (opt) {
          add(opt);
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
    <div className={className}>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((opt) => (
            <span
              key={opt.id || opt.name}
              className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-high border border-outline-variant px-3 py-1 text-sm"
            >
              {opt.flagUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={opt.flagUrl} alt="" className="h-3.5 w-5 rounded-sm object-cover" />
              ) : (
                <span className="h-3.5 w-5 rounded-sm bg-surface-container" />
              )}
              <span>{opt.cityName || opt.name}</span>
              {opt.cityName && opt.country && (
                <span className="text-xs text-on-surface-variant font-normal">
                  ({opt.country})
                </span>
              )}
              <button
                type="button"
                title={`Remove ${opt.name}`}
                aria-label={`Remove ${opt.name}`}
                className="text-on-surface-variant hover:text-error ml-1"
                onClick={() => remove(opt)}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative" ref={wrapRef}>
        <div className="relative">
          <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            role="combobox"
            aria-expanded={listOpen}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeIndex >= 0 ? `multi-country-option-${activeIndex}` : undefined}
            className={`${inputClass} pl-9`}
            value={query}
            placeholder={placeholder}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
          />
        </div>

        {listOpen && (
          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            className="absolute z-50 mt-1 w-full max-h-72 overflow-auto rounded-lg border border-outline-variant bg-surface-container shadow-xl"
          >
            {loading && filteredAvailable.length === 0 && (
              <div className="px-3 py-2 text-xs text-on-surface-variant">Searching world places…</div>
            )}

            {filteredAvailable.map((o, idx) => (
              <button
                type="button"
                key={o.id || `${o.name}-${idx}`}
                id={`multi-country-option-${idx}`}
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
                  add(o);
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
                  <span className="font-medium text-on-surface">{o.cityName || o.name}</span>
                  {o.isAirport && o.iata && (
                    <span className="text-xs font-semibold text-primary ml-1.5">
                      ({o.iata})
                    </span>
                  )}
                  {o.country && (
                    <span className="text-xs text-on-surface-variant ml-1.5 font-normal">
                      • {o.country}
                    </span>
                  )}
                </div>
                {o.isAirport ? (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    ✈️ {o.iata || 'Airport'}
                  </span>
                ) : o.isCity ? (
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
                id={`multi-country-option-${filteredAvailable.length}`}
                role="option"
                aria-selected={activeIndex === filteredAvailable.length}
                data-index={filteredAvailable.length}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-primary ${
                  activeIndex === filteredAvailable.length
                    ? 'bg-surface-container-high'
                    : 'hover:bg-surface-container-high'
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (blurTimer.current) clearTimeout(blurTimer.current);
                  createNew(query);
                }}
                onMouseEnter={() => setActiveIndex(filteredAvailable.length)}
              >
                <Plus className="h-4 w-4" />
                {creating ? 'Creating…' : `Create "${query.trim()}"`}
              </button>
            )}

            {!loading && filteredAvailable.length === 0 && !showCreate && (
              <div className="px-3 py-2 text-xs text-on-surface-variant">No matches</div>
            )}

            <div className="sticky bottom-0 border-t border-outline-variant/60 bg-surface-container-low px-3 py-1.5 text-[11px] text-on-surface-variant flex items-center justify-between">
              <span>🌍 8,290+ countries, cities & airport hubs</span>
              {filteredAvailable.length > 0 && (
                <span>{filteredAvailable.length} {filteredAvailable.length === 1 ? 'match' : 'matches'}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
