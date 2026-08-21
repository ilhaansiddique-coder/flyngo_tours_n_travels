import { NextRequest } from 'next/server';
import { api } from '@/lib/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Generates a dynamic Open Graph / share image as inline SVG.
 *
 * Usage: /api/og?title=Hajj%202026&subtitle=From%20BDT%20450%2C000&badge=Hot%20Deal
 *        /api/og?package=hajj (auto-resolves title/subtitle from a package)
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const title = url.searchParams.get('title') || 'FlynGo — Tours & Travels';
  const subtitle = url.searchParams.get('subtitle') || 'Hajj · Umrah · Tours · Visa';
  const badge = url.searchParams.get('badge') || '';
  const packageSlug = url.searchParams.get('package');

  let resolvedTitle = title;
  let resolvedSubtitle = subtitle;
  let resolvedBadge = badge;

  if (packageSlug) {
    try {
      const res = await fetch(`${BASE_URL}/hajj-packages/slug/${packageSlug}`, {
        headers: { 'x-tenant-id': '00000000-0000-0000-0000-000000000001' },
        cache: 'no-store',
      });
      if (res.ok) {
        const pkg = await res.json();
        resolvedTitle = pkg.metaTitle || pkg.title;
        resolvedSubtitle = pkg.metaDescription
          || `${pkg.durationDays} days · ${pkg.makkahNights} Makkah · ${pkg.madinahNights} Madinah nights`;
        if (pkg.totalSeats > 0 && pkg.seatsBooked < pkg.totalSeats) {
          const left = pkg.totalSeats - pkg.seatsBooked;
          resolvedBadge = left <= 10 ? `Only ${left} seats left!` : `${left} seats available`;
        }
      }
    } catch { /* fall back to query params */ }
  }

  const svg = renderOgSvg(resolvedTitle, resolvedSubtitle, resolvedBadge);
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

function renderOgSvg(title: string, subtitle: string, badge: string): string {
  const wrap = (s: string, n: number) => s.length > n ? s.slice(0, n - 1) + '…' : s;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0B0B0F"/>
      <stop offset="100%" stop-color="#1a1a24"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#EF4444"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#F59E0B" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="950" cy="100" r="280" fill="url(#glow)"/>
  <circle cx="200" cy="600" r="280" fill="url(#glow)"/>

  ${badge ? `<g>
    <rect x="80" y="80" width="${Math.max(badge.length * 12, 160)}" height="50" rx="25" fill="url(#accent)"/>
    <text x="${80 + Math.max(badge.length * 12, 160) / 2}" y="113" font-family="system-ui,sans-serif" font-size="22" font-weight="700" fill="#fff" text-anchor="middle">${escapeXml(badge)}</text>
  </g>` : ''}

  <text x="80" y="330" font-family="system-ui,sans-serif" font-size="78" font-weight="800" fill="#fff">${escapeXml(wrap(title, 30))}</text>
  <text x="80" y="410" font-family="system-ui,sans-serif" font-size="32" font-weight="400" fill="#9ca3af">${escapeXml(wrap(subtitle, 80))}</text>

  <g transform="translate(80, 480)">
    <rect width="280" height="56" rx="12" fill="#F59E0B"/>
    <text x="140" y="37" font-family="system-ui,sans-serif" font-size="22" font-weight="700" fill="#0B0B0F" text-anchor="middle">Book on FlynGo.com →</text>
  </g>

  <text x="1120" y="600" font-family="system-ui,sans-serif" font-size="18" font-weight="600" fill="#6b7280" text-anchor="end">FlynGo · flyngo.com</text>
</svg>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
