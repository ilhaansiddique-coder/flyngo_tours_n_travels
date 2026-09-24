// Central high-reliability image resolver for countries and destinations.
// Uses fast, curated Unsplash photography keyed deterministically to country names.
// Never flickers, loads in milliseconds globally, and never returns 401.

const COUNTRY_PHOTOS: Record<string, string> = {
  malaysia: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07',
  thailand: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365',
  bangkok: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365',
  phuket: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5',
  uae: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
  dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
  singapore: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd',
  saudi: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a',
  saudiarabia: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a',
  makkah: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a',
  madinah: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa',
  turkey: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200',
  istanbul: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200',
  uk: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad',
  unitedkingdom: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad',
  london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad',
  usa: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74',
  unitedstates: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74',
  canada: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce',
  australia: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9',
  japan: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26',
  tokyo: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26',
  maldives: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8',
  indonesia: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
  india: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da',
  france: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
  italy: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5',
  rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5',
  nepal: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa',
  qatar: 'https://images.unsplash.com/photo-1578895210405-907db486c111',
  doha: 'https://images.unsplash.com/photo-1578895210405-907db486c111',
  jordan: 'https://images.unsplash.com/photo-1579606032833-2a70d8299b45',
  egypt: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368',
  bangladesh: 'https://images.unsplash.com/photo-1608958435020-e8a7109ba809',
};

const GLOBAL_TRAVEL_FALLBACKS = [
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
  'https://images.unsplash.com/photo-1500835556837-99ac94a94552',
  'https://images.unsplash.com/photo-1503220317375-aaad61436b1b',
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
];

function seedIndex(s: string, max: number): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % max;
}

/** A stable, high-resolution landmark photo URL for a country or destination. */
export function countryImage(name?: string | null, width = 800, height = 500): string {
  const clean = (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean && COUNTRY_PHOTOS[clean]) {
    return `${COUNTRY_PHOTOS[clean]}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;
  }
  for (const [key, url] of Object.entries(COUNTRY_PHOTOS)) {
    if (clean.includes(key) || key.includes(clean)) {
      return `${url}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;
    }
  }
  const fallback = GLOBAL_TRAVEL_FALLBACKS[seedIndex(clean || 'travel', GLOBAL_TRAVEL_FALLBACKS.length)];
  return `${fallback}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;
}
