'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useApi } from '@/hooks/use-api';
import { useFormatCurrency } from '@/lib/utils';
import { MapPin, Compass, Building2, Plane, Briefcase, Car, Globe2 } from 'lucide-react';

type Section = {
  key: 'tours' | 'hotels' | 'hajj' | 'umrah' | 'flights' | 'visa' | 'transport' | 'destinations';
  label: string;
  Icon: typeof Compass;
  items: any[];
};

// href takes the whole item so each section can route to a page that actually
// exists: a slug/id detail page where there is one, otherwise straight into the
// booking flow (flights/transport have no detail page; visa detail is
// country-based, not per-service). Prevents the dead 404 links.
const SECTION_META: Record<Section['key'], { label: string; href: (item: any) => string; Icon: typeof Compass }> = {
  tours: { label: 'Tours', href: (i) => `/tours/${i.slug || i.id}`, Icon: Compass },
  hotels: { label: 'Hotels', href: (i) => `/hotels/${i.slug || i.id}`, Icon: Building2 },
  hajj: { label: 'Hajj packages', href: (i) => `/hajj/${i.slug || i.id}`, Icon: Compass },
  umrah: { label: 'Umrah packages', href: (i) => `/umrah/${i.slug || i.id}`, Icon: Compass },
  flights: { label: 'Flights', href: (i) => `/booking?type=flight&id=${i.id}`, Icon: Plane },
  visa: { label: 'Visa services', href: (i) => `/booking?type=visa&id=${i.id}`, Icon: Briefcase },
  transport: { label: 'Transport', href: (i) => `/booking?type=transport&id=${i.id}`, Icon: Car },
  destinations: { label: 'Destinations', href: (i) => `/destinations/${i.slug || i.id}`, Icon: Globe2 },
};

function ResultCard({ section, item }: { section: Section['key']; item: any }) {
  const fmt = useFormatCurrency();
  const meta = SECTION_META[section];
  const Icon = meta.Icon;
  const title =
    item.title ||
    item.name ||
    `${item.airline ?? ''} ${item.flightNumber ?? ''}`.trim() ||
    'Untitled';
  const extraDest = (item.additionalDestinations || [])
    .map((ad: any) => ad?.destination?.name)
    .filter(Boolean);
  const subtitle =
    item.destination?.name ||
    item.country?.name ||
    item.destinationName ||
    item.originCity ||
    (item.originCode && item.destinationCode ? `${item.originCode} → ${item.destinationCode}` : '') ||
    item.country ||
    '';
  const subtitleWithExtra = extraDest.length
    ? `${subtitle}${subtitle ? ' · ' : ''}${extraDest.join(' · ')}`
    : subtitle;
  const price = typeof item.price === 'number' || typeof item.pricePerNight === 'number'
    ? (item.price ?? item.pricePerNight)
    : null;
  const currency = item.currency || 'USD';
  const href = meta.href(item);

  return (
    <Link
      href={href}
      className="group relative flex flex-col rounded-2xl border p-4 transition-all hover:-translate-y-0.5"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-outline-variant)',
        boxShadow: '0 8px 24px -12px rgba(7,86,184,0.18)',
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
          style={{ backgroundColor: 'color-mix(in oklab, var(--color-primary) 14%, transparent)' }}
        >
          <Icon className="w-4 h-4" style={{ color: 'var(--color-nav-active)' }} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.16em] font-bold mb-1" style={{ color: 'var(--color-header-text-muted)' }}>
            {meta.label}
          </div>
          <div className="text-sm font-semibold truncate" style={{ color: 'var(--color-on-surface)' }}>
            {title}
          </div>
            {subtitleWithExtra && (
            <div className="mt-1 flex items-center gap-1 text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{subtitleWithExtra}</span>
            </div>
            )}
        </div>
      </div>
      {price != null && (
        <div className="mt-3 text-right text-sm font-bold" style={{ color: 'var(--color-nav-active)' }}>
          {fmt(price, currency)}
        </div>
      )}
    </Link>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageInner />
    </Suspense>
  );
}

function SearchPageInner() {
  const params = useSearchParams();
  const { globalSearch } = useApi();
  const q = params.get('q')?.trim() ?? '';
  const checkIn = params.get('checkIn') ?? '';
  const checkOut = params.get('checkOut') ?? '';
  const adults = params.get('adults') ?? '';
  const children = params.get('children') ?? '';
  const rooms = params.get('rooms') ?? '';

  const [results, setResults] = useState<Record<Section['key'], any[]> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) {
      setResults(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    globalSearch(q)
      .then((r) => {
        if (!cancelled) setResults(r);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [q, globalSearch]);

  const sections: Section[] = useMemo(() => {
    if (!results) return [];
    return (Object.keys(SECTION_META) as Section['key'][])
      .map((key) => ({ key, label: SECTION_META[key].label, Icon: SECTION_META[key].Icon, items: results[key] || [] }))
      .filter((s) => s.items.length > 0);
  }, [results]);

  const totalCount = sections.reduce((acc, s) => acc + s.items.length, 0);

  return (
    <div className="min-h-screen pt-12 pb-24 px-4 sm:px-6 lg:px-16 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <div
          className="text-[10px] uppercase tracking-[0.2em] font-bold mb-2"
          style={{ color: 'var(--color-header-text-muted)' }}
        >
          Search results
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold" style={{ color: 'var(--color-on-background)' }}>
          {q ? <>Results for &ldquo;{q}&rdquo;</> : 'Search FlynGo'}
        </h1>
        {(checkIn || adults || rooms) && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
            {checkIn && <span className="px-2 py-1 rounded-full bg-on-surface-soft">{checkIn}{checkOut ? ` → ${checkOut}` : ''}</span>}
            {adults && <span className="px-2 py-1 rounded-full bg-on-surface-soft">{adults} adult{adults === '1' ? '' : 's'}{children ? `, ${children} child${children === '1' ? '' : 'ren'}` : ''}</span>}
            {rooms && <span className="px-2 py-1 rounded-full bg-on-surface-soft">{rooms} room{rooms === '1' ? '' : 's'}</span>}
          </div>
        )}
      </div>

      {!q && (
        <div className="rounded-2xl border p-8 text-center" style={{ borderColor: 'var(--color-outline-variant)', backgroundColor: 'var(--color-surface)' }}>
          <p style={{ color: 'var(--color-on-surface-variant)' }}>
            Type a destination, country, airline, or service in the search bar to see matching tours, hotels, flights, visas, transport, and destinations.
          </p>
        </div>
      )}

      {q && loading && (
        <div className="text-sm" style={{ color: 'var(--color-header-text-muted)' }}>
          Searching tours, hotels, flights, visa, transport…
        </div>
      )}

      {q && !loading && results && totalCount === 0 && (
        <div className="rounded-2xl border p-8 text-center" style={{ borderColor: 'var(--color-outline-variant)', backgroundColor: 'var(--color-surface)' }}>
          <p className="font-semibold mb-1" style={{ color: 'var(--color-on-surface)' }}>No matches</p>
          <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            Try a different keyword, or browse tours, hotels, flights, and visa from the menu.
          </p>
        </div>
      )}

      {sections.map((s) => (
        <section key={s.key} className="mb-10">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-xl font-display font-bold flex items-center gap-2" style={{ color: 'var(--color-on-background)' }}>
              <s.Icon className="w-5 h-5" style={{ color: 'var(--color-nav-active)' }} />
              {s.label}
              <span className="text-sm font-normal" style={{ color: 'var(--color-header-text-muted)' }}>
                ({s.items.length})
              </span>
            </h2>
            <Link
              href={`/${s.key}?q=${encodeURIComponent(q)}`}
              className="text-xs font-semibold tracking-wide hover:underline"
              style={{ color: 'var(--color-nav-active)' }}
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {s.items.map((item) => (
              <ResultCard key={`${s.key}-${item.id}`} section={s.key} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
