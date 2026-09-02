// Deterministic "hardcoded" fallback photo for any service card (tour, hotel,
// hajj, umrah, transport…) keyed by a descriptive string, so a card always
// shows relevant imagery even when no photo has been uploaded. Same input →
// same photo across loads/pages (no flicker). Uses LoremFlickr (free, no key);
// if it's ever unreachable the <img> simply fails and the gradient behind it
// shows through — always keep a gradient/icon fallback in the markup.
//
// Sibling of country-image.ts (which is visa-specific); this one is general.

function seedFrom(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100000;
}

/**
 * A stable, relevant photo URL for a service card.
 * @param query  descriptive keywords (e.g. a destination, package name)
 * @param extra  category keywords appended to bias the photo (e.g. 'hotel,resort')
 */
export function serviceImage(query?: string | null, extra = 'travel', width = 800, height = 500): string {
  const base = (query || extra)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ',');
  const keywords = [base, extra].filter(Boolean).join(',');
  return `https://loremflickr.com/${width}/${height}/${encodeURIComponent(keywords)}?lock=${seedFrom(base || extra)}`;
}
