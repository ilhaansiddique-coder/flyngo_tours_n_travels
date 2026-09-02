import { searchTerms, buildSearchOr } from './search.util';

describe('searchTerms', () => {
  // The bug this exists to prevent: the destination autocomplete emits
  // "City, Country", and matched as one substring it hits nothing, because no
  // column holds the combined string.
  it('expands a "City, Country" label into its parts', () => {
    expect(searchTerms('Bangkok, Thailand')).toEqual([
      'Bangkok, Thailand',
      'Bangkok',
      'Thailand',
    ]);
  });

  it('keeps the full phrase first so exact labels still match', () => {
    expect(searchTerms('Bangkok, Thailand')[0]).toBe('Bangkok, Thailand');
  });

  it('does not duplicate a query with no comma', () => {
    expect(searchTerms('Bangkok')).toEqual(['Bangkok']);
  });

  it('drops fragments too short to be meaningful', () => {
    // A stray initial would otherwise match almost every row.
    expect(searchTerms('Dubai, U')).toEqual(['Dubai, U', 'Dubai']);
  });

  it('returns nothing for blank input so callers can skip filtering', () => {
    expect(searchTerms('')).toEqual([]);
    expect(searchTerms('   ')).toEqual([]);
    expect(searchTerms(undefined)).toEqual([]);
    expect(searchTerms(null)).toEqual([]);
  });

  it('trims whitespace around parts', () => {
    expect(searchTerms('  Paris ,  France  ')).toEqual(['Paris ,  France', 'Paris', 'France']);
  });
});

describe('buildSearchOr', () => {
  it('crosses every term with every field', () => {
    const or = buildSearchOr('Bangkok, Thailand', [
      (t) => ({ title: t }),
      (t) => ({ country: t }),
    ]);
    // 3 terms x 2 fields
    expect(or).toHaveLength(6);
    expect(or).toContainEqual({ title: 'Bangkok' });
    expect(or).toContainEqual({ country: 'Thailand' });
  });

  it('returns undefined for an empty query', () => {
    // Not an empty array — Prisma treats `OR: []` as matching nothing, which
    // would blank the listing pages when no search is active.
    expect(buildSearchOr('', [(t) => ({ title: t })])).toBeUndefined();
    expect(buildSearchOr(undefined, [(t) => ({ title: t })])).toBeUndefined();
  });
});
