import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://flyngo.world';
const BACKEND = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Fetch slugs for a given collection from the backend.
 * Handles response shapes: { items: [...] }, { data: [...] }, or a bare array.
 * Returns [] on any failure so a down backend never breaks the sitemap build.
 */
async function fetchSlugs(path: string): Promise<string[]> {
  try {
    const res = await fetch(`${BACKEND}/api/v1/${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    const list: unknown = Array.isArray(json)
      ? json
      : Array.isArray(json?.items)
        ? json.items
        : Array.isArray(json?.data)
          ? json.data
          : [];
    return (list as Array<{ slug?: string }>)
      .map((item) => item?.slug)
      .filter((slug): slug is string => typeof slug === 'string' && slug.length > 0);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static, public pages — landing/marketing pages that should rank
  const staticUrls: MetadataRoute.Sitemap = [
    '',
    '/hajj',
    '/umrah',
    '/tours',
    '/hotels',
    '/flights',
    '/visa',
    '/visa-countries',
    '/destinations',
    '/transport',
    '/blog',
    '/about',
    '/contact',
    '/refer',
    '/frequently-asked-questions',
  ].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1 : p.startsWith('/hajj') || p.startsWith('/umrah') ? 0.9 : 0.7,
  }));

  // Dynamic detail pages — enumerate real slugs from the backend at build/request time.
  const dynamicSources: Array<{ prefix: string; path: string }> = [
    { prefix: '/tours', path: 'tours?limit=200' },
    { prefix: '/hotels', path: 'hotels?limit=200' },
    { prefix: '/visa', path: 'visa-countries?limit=200' },
    { prefix: '/hajj', path: 'hajj-packages?limit=200' },
    { prefix: '/umrah', path: 'umrah-packages?limit=200' },
    { prefix: '/destinations', path: 'destinations?limit=200' },
  ];

  const dynamicResults = await Promise.all(dynamicSources.map((s) => fetchSlugs(s.path)));

  const dynamicUrls: MetadataRoute.Sitemap = dynamicSources.flatMap((source, i) =>
    dynamicResults[i].map((slug) => ({
      url: `${BASE}${source.prefix}/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  );

  return [...staticUrls, ...dynamicUrls];
}
