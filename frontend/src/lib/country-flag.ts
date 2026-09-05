import { COUNTRY_DIALS } from '@/lib/country-dial-codes';

const ALIASES: Record<string, string> = {
  uae: 'united arab emirates',
  usa: 'united states',
  uk: 'united kingdom',
  'u.k.': 'united kingdom',
  'united states of america': 'united states',
  'russian federation': 'russia',
  'czech republic': 'czechia',
  'viet nam': 'vietnam',
  'ivory coast': "côte d'ivoire",
  'macedonia': 'north macedonia',
  'lao': 'laos',
};

function normalize(value?: string | null): string {
  return (value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

const FLAG_BY_NAME = new Map(COUNTRY_DIALS.map((c) => [normalize(c.name), c.flag]));

export function countryFlag(country?: string | null): string {
  const key = normalize(country);
  if (!key) return '';
  return FLAG_BY_NAME.get(key) ?? FLAG_BY_NAME.get(ALIASES[key] ?? '') ?? '';
}