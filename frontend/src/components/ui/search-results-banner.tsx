'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

/**
 * Small banner shown on listing pages when the user arrived via the hero search
 * (`?q=`). Tells them what's being filtered and lets them clear it.
 */
export function SearchResultsBanner({
  query,
  count,
  noun = 'results',
}: {
  query: string;
  count: number;
  noun?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  if (!query) return null;

  // Callers pass a plural noun ("tours"); drop the "s" for a single result so
  // the banner doesn't read "1 tours for …".
  const label = count === 1 && noun.endsWith('s') ? noun.slice(0, -1) : noun;

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-outline-variant bg-surface-container/50 px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-on-surface">
        <Search className="h-4 w-4 text-primary" />
        <span>
          {count} {label} for{' '}
          <span className="font-semibold text-on-surface">&ldquo;{query}&rdquo;</span>
        </span>
      </div>
      <button
        type="button"
        onClick={() => router.push(pathname)}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
      >
        <X className="h-3.5 w-3.5" /> Clear
      </button>
    </div>
  );
}
