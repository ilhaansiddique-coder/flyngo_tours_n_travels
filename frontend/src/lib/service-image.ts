// Central high-reliability image resolver for travel services (tours, hajj, umrah, hotels, transport).
// Fast, deterministic Unsplash photography that loads in milliseconds globally and never returns 401.

const SERVICE_THEMES: Record<string, string> = {
  hajj: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a',
  makkah: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a',
  kaaba: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a',
  umrah: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa',
  madinah: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa',
  mosque: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb',
  hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
  resort: 'https://images.unsplash.com/photo-1582719508461-905c673771fd',
  luxury: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb',
  flight: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05',
  airline: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05',
  airplane: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05',
  aviation: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05',
  transport: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341',
  car: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341',
  bus: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e',
  adventure: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6',
  beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
  island: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8',
  mountain: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
  city: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82',
  visa: 'https://images.unsplash.com/photo-1544717305-2782549b5136',
  malaysia: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07',
  thailand: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365',
  dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
  singapore: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
  maldives: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8',
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
  turkey: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200',
  tokyo: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26',
};

const SERVICE_FALLBACKS = [
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

export function serviceImage(query?: string | null, extra = 'travel', width = 800, height = 500): string {
  const combined = `${query || ''} ${extra || ''}`.toLowerCase().replace(/[^a-z0-9]/g, ' ');
  for (const [key, url] of Object.entries(SERVICE_THEMES)) {
    if (combined.includes(key)) {
      return `${url}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;
    }
  }
  const fallback = SERVICE_FALLBACKS[seedIndex(combined || 'travel', SERVICE_FALLBACKS.length)];
  return `${fallback}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;
}
