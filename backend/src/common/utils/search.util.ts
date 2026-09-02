/**
 * Expand a search query into the terms worth matching.
 *
 * The destination autocomplete labels places as "City, Country" ("Bangkok,
 * Thailand"), and that whole label is what ends up in `?q=`. Matched as a
 * single substring it can never hit anything: a tour's title is "Bangkok
 * Street Food & Culture", its destination name is "Bangkok" and its country is
 * "Thailand" — no column contains the combined string. Searching for a real
 * place therefore returned zero results every time.
 *
 * So match the full phrase OR any comma-separated part of it:
 *   "Bangkok, Thailand" -> ["Bangkok, Thailand", "Bangkok", "Thailand"]
 *
 * The full phrase stays first so an exact label match still works for records
 * that genuinely store it that way. Parts shorter than two characters are
 * dropped to avoid matching essentially everything.
 */
export function searchTerms(q?: string | null): string[] {
  const full = String(q ?? '').trim();
  if (!full) return [];

  const parts = full
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length >= 2);

  // Set keeps order and removes the duplicate when the query has no comma.
  return [...new Set([full, ...parts])];
}

/**
 * Build a Prisma `OR` array from a query and a set of field-matchers.
 *
 * Each matcher receives one term and returns a where-fragment, so a caller
 * lists its searchable columns once and gets the cross-product with every
 * term. Returns undefined when there is nothing to search, letting the caller
 * leave `where.OR` unset rather than passing an empty array (which would match
 * nothing).
 */
// Deliberately not generic: inference would pin the array's type to whatever
// the FIRST matcher returns, and every later matcher (a different column, so a
// different shape) would then fail to typecheck.
export function buildSearchOr(
  q: string | null | undefined,
  matchers: ((term: string) => Record<string, unknown>)[],
): Record<string, unknown>[] | undefined {
  const terms = searchTerms(q);
  if (!terms.length) return undefined;
  return terms.flatMap((term) => matchers.map((m) => m(term)));
}
