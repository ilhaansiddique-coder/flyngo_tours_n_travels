import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://flyngo.com';

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
    alternates: {
      languages: {
        en: `${BASE}${p}`,
        bn: `${BASE}/bn${p}`,
        ur: `${BASE}/ur${p}`,
        ar: `${BASE}/ar${p}`,
      },
    },
  }));

  return staticUrls;
}
