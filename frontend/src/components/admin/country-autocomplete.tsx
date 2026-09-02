'use client';

import { useEffect, useRef, useState, useCallback, useId } from 'react';
import { useApi } from '@/hooks/use-api';
import { Plus } from 'lucide-react';

export interface CountryOption {
  id?: string;
  name: string;
  slug?: string;
  flagUrl?: string | null;
  country?: string;
  continent?: string | null;
}

interface Props {
  value: string;
  onChange: (next: CountryOption) => void;
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
  onBlur,
  placeholder = 'Type a country…',
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
      if (!q.trim()) {
        setOptions([]);
        return;
      }
      try {
        setLoading(true);
        const res = await getDestinationAutocomplete(q, 25);
        const items = (Array.isArray(res) ? res : (res as any)?.data || []) as CountryOption[];
        setOptions(items);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [getDestinationAutocomplete],
  );

  useEffect(() => {
    const t = setTimeout(() => fetchOptions(query), 200);
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

  const select = (opt: CountryOption) => {
    setQuery(opt.name);
    setOpen(false);
    setActiveIndex(-1);
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
        // Auto-save: create/resolve the typed country so it shows next time.
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
          className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-lg border border-outline-variant bg-surface-container shadow-lg"
        >
          {loading && options.length === 0 && (
            <div className="px-3 py-2 text-xs text-on-surface-variant">Loading…</div>
          )}

          {options.map((o, idx) => (
            <button
              type="button"
              key={o.id || o.name}
              id={`country-option-${idx}`}
              role="option"
              aria-selected={activeIndex === idx}
              data-index={idx}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
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
                <img src={o.flagUrl} alt="" className="h-4 w-6 rounded-sm object-cover" />
              ) : (
                <span className="h-4 w-6 rounded-sm bg-surface-container-high" />
              )}
              <span className="flex-1">{o.name}</span>
              {o.continent && <span className="text-xs text-on-surface-variant">{o.continent}</span>}
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
        </div>
      )}
    </div>
  );
}
