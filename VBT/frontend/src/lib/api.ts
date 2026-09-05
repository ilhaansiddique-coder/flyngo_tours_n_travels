const USE_BASE_PATH = process.env.NEXT_PUBLIC_VBT_USE_BASEPATH !== 'false';
export const BASE_PATH = USE_BASE_PATH
  ? process.env.NEXT_PUBLIC_VBT_BASE_PATH || '/VBT'
  : '';

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

/**
 * Server-side fetch helper. Pages are server components that talk to the
 * backend directly via BACKEND_URL (no client round-trip).
 */
export async function serverFetch<T>(
  path: string,
  options: { lang?: string; revalidate?: number } = {},
): Promise<T> {
  const backend = process.env.BACKEND_URL || 'http://localhost:4000';
  const url = `${backend}/api/v1${path}`;
  const res = await fetch(url, {
    cache: options.revalidate !== undefined ? 'default' : 'no-store',
    next: options.revalidate ? { revalidate: options.revalidate } : undefined,
    headers: options.lang ? { 'Accept-Language': options.lang } : undefined,
  });
  if (!res.ok) {
    if (res.status === 404) {
      throw new Response('Not found', { status: 404 });
    }
    throw new Error(`API ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Client-side fetch helper. Calls go through the Next.js rewrite
 * (/VBT/api/v1/* -> backend) so no CORS or public backend URL is needed.
 */
export async function clientApi<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_PATH}/api/v1${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (body.message) {
        message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

/**
 * Prefix a stored asset path (e.g. "/images/activities/qurbani.svg") with the
 * base path so absolute client URLs resolve under /VBT.
 */
export function assetUrl(path?: string | null): string {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  if (path.startsWith('/') && BASE_PATH) return `${BASE_PATH}${path}`;
  return path;
}