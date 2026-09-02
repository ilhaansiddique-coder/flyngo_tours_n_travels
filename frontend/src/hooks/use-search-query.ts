'use client';

import { useEffect, useState } from 'react';

/**
 * Reads the `?q=` search term from the URL on mount (client-only).
 *
 * We deliberately read from `window.location.search` in an effect instead of
 * Next's `useSearchParams()` — the latter forces the page into a Suspense
 * boundary and has bitten us with hydration issues. Listing pages are always
 * navigated to fresh (from the hero search), so a mount-time read is enough.
 */
export function useSearchQuery(key = 'q'): string {
  return useSearchQueryState(key).q;
}

/**
 * As above, plus a `ready` flag reporting whether the URL has been read yet.
 *
 * Listing pages now pass the term to the API instead of filtering in the
 * browser. Without this flag they would fire one request with no term —
 * rendering the entire catalogue for a frame — and then a second with it.
 */
export function useSearchQueryState(key = 'q'): { q: string; ready: boolean } {
  const [state, setState] = useState<{ q: string; ready: boolean }>({ q: '', ready: false });
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get(key) ?? '';
    // Intentional: a one-time client-only read of the URL on mount (see above).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ q: v.trim(), ready: true });
  }, [key]);
  return state;
}
