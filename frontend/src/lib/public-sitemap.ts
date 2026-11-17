import type { MetadataRoute } from 'next';

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://flyngo.world').replace(/\/+$/, '');
const BACKEND = (process.env.BACKEND_URL || 'http://localhost:4000').replace(/\/+$/, '');
export const PUBLIC_ROUTES = ['', '/hajj', '/umrah', '/tours', '/hotels', '/flights', '/visa', '/destinations', '/transport', '/blog', '/about', '/contact', '/refer', '/frequently-asked-questions'];

export async function fetchSlugs(path: string): Promise<string[]> {
  const slugs = new Set<string>();
  for (let page = 1; page <= 50; page++) {
    try {
      const res = await fetch(`${BACKEND}/api/v1/${path}?limit=100&page=${page}`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
      if (!res.ok) break;
      const json = await res.json();
      const data = json?.data ?? json;
      const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
      for (const item of list) {
        if (item?.isActive === false || item?.deletedAt) continue;
        if (typeof item?.slug === 'string' && /^[\p{L}\p{N}][\p{L}\p{N}_-]*$/u.test(item.slug)) slugs.add(item.slug);
      }
      const totalPages = Number(data?.meta?.totalPages ?? json?.meta?.totalPages);
      if (Array.isArray(data) || list.length === 0 || (Number.isFinite(totalPages) ? page >= totalPages : list.length < 100)) break;
    } catch { break; }
  }
  return [...slugs];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sources = [
    { prefix: '/tours', path: 'tours' }, { prefix: '/hotels', path: 'hotels' },
    { prefix: '/visa', path: 'visa-countries' }, { prefix: '/hajj', path: 'hajj-packages' },
    { prefix: '/umrah', path: 'umrah-packages' }, { prefix: '/destinations', path: 'destinations' },
  ];
  const results = await Promise.all(sources.map((source) => fetchSlugs(source.path)));
  return [
    ...PUBLIC_ROUTES.map((path) => ({ url: `${BASE}${path}`, changeFrequency: 'weekly' as const, priority: path === '' ? 1 : 0.7 })),
    ...sources.flatMap((source, index) => results[index].map((slug) => ({ url: `${BASE}${source.prefix}/${encodeURIComponent(slug)}`, changeFrequency: 'weekly' as const, priority: 0.6 }))),
  ];
}
