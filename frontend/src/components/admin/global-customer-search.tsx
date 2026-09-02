'use client';

import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/use-api';
import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';

interface CustomerResult {
  id: string;
  fullName: string;
  email?: string | null;
  phone?: string;
  nationalId?: string | null;
  passportNumber?: string | null;
}

/**
 * Global customer search shown in the admin top bar. Lets an admin find a
 * customer from anywhere in the panel; selecting a result jumps to the
 * Customers page with that customer's edit modal pre-opened.
 */
export function GlobalCustomerSearch() {
  const router = useRouter();
  const { getUsers } = useApi();

  const [term, setTerm] = useState('');
  const [results, setResults] = useState<CustomerResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const runSearch = (raw: string) => {
    const q = raw.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q || q.length < 2) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = (await getUsers({ q, limit: '8' })) as any;
        const items = Array.isArray(res) ? res : res?.data ?? [];
        setResults(items);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
  };

  const select = (c: CustomerResult) => {
    setTerm('');
    setResults([]);
    setOpen(false);
    router.push(`/admin/customers?edit=${encodeURIComponent(c.id)}`);
  };

  const initials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  return (
    <div className="relative" ref={boxRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
        <input
          type="text"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            runSearch(e.target.value);
          }}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
          }}
          placeholder="Search customers..."
          className="w-56 rounded-lg border border-outline-variant bg-surface-container/60 py-2 pl-9 pr-3 text-sm text-on-surface placeholder:text-on-surface-variant/60 transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute right-0 z-50 mt-1 w-80 overflow-y-auto rounded-lg border border-outline-variant bg-surface shadow-xl max-h-96">
          {results.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => select(c)}
              className="flex w-full items-center gap-3 border-b border-outline-variant px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-surface-container-high"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {initials(c.fullName)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-on-surface">{c.fullName}</span>
                <span className="block truncate text-xs text-on-surface-variant">
                  {[c.phone, c.email, c.nationalId ? `NID ${c.nationalId}` : '', c.passportNumber ? `Passport ${c.passportNumber}` : '']
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
