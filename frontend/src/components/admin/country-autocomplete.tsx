'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
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
  const [query, setQuery] = useState(value || '');
  const [options, setOptions] = useState<CountryOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
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
      onChange(created);
    } catch {
      // fall back to free text so the submit still carries the typed name
      setOpen(false);
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

  return (
    <div className="relative" ref={wrapRef}>
      <input
        type="text"
        className={className || inputClass}
        value={query}
        placeholder={placeholder}
        required={required}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
      />

      {open && (loading || options.length > 0 || showCreate) && (
        <div className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-lg border border-outline-variant bg-surface-container shadow-lg">
          {loading && options.length === 0 && (
            <div className="px-3 py-2 text-xs text-on-surface-variant">Loading…</div>
          )}

          {options.map((o) => (
            <button
              type="button"
              key={o.id || o.name}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-container-high"
              onMouseDown={(e) => {
                e.preventDefault();
                if (blurTimer.current) clearTimeout(blurTimer.current);
                select(o);
              }}
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
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-primary hover:bg-surface-container-high"
              onMouseDown={(e) => {
                e.preventDefault();
                if (blurTimer.current) clearTimeout(blurTimer.current);
                createNew(query);
              }}
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
