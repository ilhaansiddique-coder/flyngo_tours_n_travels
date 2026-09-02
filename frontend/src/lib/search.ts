/**
 * Mirror of the server-side `searchTerms` helper.
 *
 * The destination autocomplete labels places as "City, Country" ("Bangkok,
 * Thailand") and that whole label lands in `?q=`. Matched as one substring it
 * can never hit anything — a package's title is "Bangkok Street Food", its
 * destination is "Bangkok", its country is "Thailand", and no field contains
 * the combined string. So match the full phrase OR any comma-separated part.
 *
 *   "Bangkok, Thailand" -> ["bangkok, thailand", "bangkok", "thailand"]
 */
export function searchTerms(q: string): string[] {
  const full = q.trim().toLowerCase();
  if (!full) return [];
  const parts = full
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length >= 2);
  return [...new Set([full, ...parts])];
}

/**
 * True when any of `fields` contains any of the query's terms.
 *
 * Used by the listing pages whose catalogues are small enough to filter in the
 * browser. Pages backed by a paginated endpoint pass `q` to the API instead —
 * filtering client-side there would only ever search the first page.
 */
export function matchesSearch(fields: unknown[], q: string): boolean {
  const terms = searchTerms(q);
  if (!terms.length) return true;
  const haystack = fields
    .filter(Boolean)
    .map((f) => String(f).toLowerCase());
  return terms.some((term) => haystack.some((h) => h.includes(term)));
}
