// Deterministic "hardcoded" photo for a country — a stable landmark/travel
// image keyed by the country name. Uses LoremFlickr (free, no API key); the
// `lock` seed keeps the SAME photo for a given country across loads/pages so a
// visa card doesn't flicker to a different picture each render.
//
// This is a placeholder source: if it's ever unreachable the <img> simply fails
// and callers should keep a gradient/flag behind it as a fallback.

function seedFrom(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100000;
}

/** A stable landmark photo URL for a country (e.g. visa card imagery). */
export function countryImage(name?: string | null, width = 800, height = 500): string {
  const country = (name || 'travel')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ',');
  const keywords = country ? `${country},landmark,travel` : 'travel,landmark';
  return `https://loremflickr.com/${width}/${height}/${encodeURIComponent(keywords)}?lock=${seedFrom(country || 'travel')}`;
}
