'use client';

import { useEffect, useMemo, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { useSearchQuery } from '@/hooks/use-search-query';
import { SearchResultsBanner } from '@/components/ui/search-results-banner';
import { HotelCard } from '@/components/features/hotels/hotel-card';
import { Building2, Globe, ShieldCheck, Headphones, Sparkles } from 'lucide-react';
import { matchesSearch } from '@/lib/search';
import { getCountryFlagByName } from '@/lib/world-places';
import type { Hotel } from '@/types';

export function HotelsPageClient() {
  const { getHotels } = useApi();
  const q = useSearchQuery();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data: any = await getHotels();
        const list = data?.data ?? data?.items ?? data ?? [];
        setHotels(list.filter((h: any) => h.isActive !== false));
      } catch {
        // handled in empty states
      } finally {
        setLoading(false);
      }
    })();
  }, [getHotels]);

  // Destination quick navigation pills
  const destinations = useMemo(() => {
    const map = new Map<string, { id: string; name: string; slug: string; flagUrl?: string }>();
    for (const h of hotels) {
      const d = h.destination;
      if (d?.name) {
        const slug = d.slug || d.name.toLowerCase().trim().replace(/\s+/g, '-');
        if (!map.has(slug)) {
          map.set(slug, {
            id: d.id || slug,
            name: d.name,
            slug,
            flagUrl: getCountryFlagByName(d.country || d.name),
          });
        }
      }
      for (const ad of h.additionalDestinations || []) {
        const dest = (ad as any).destination;
        if (dest?.name) {
          const slug = dest.slug || dest.name.toLowerCase().trim().replace(/\s+/g, '-');
          if (!map.has(slug)) {
            map.set(slug, {
              id: dest.id || slug,
              name: dest.name,
              slug,
              flagUrl: getCountryFlagByName(dest.country || dest.name),
            });
          }
        }
      }
    }
    return Array.from(map.values());
  }, [hotels]);

  const shownHotels = useMemo(() => {
    let result = hotels;
    if (selectedDestination) {
      result = result.filter((h) => {
        const primaryMatch =
          h.destination?.slug?.toLowerCase() === selectedDestination ||
          h.destination?.name?.toLowerCase().trim().replace(/\s+/g, '-') === selectedDestination;
        const addlMatch = (h.additionalDestinations || []).some((ad: any) => {
          const dest = ad?.destination;
          return (
            dest?.slug?.toLowerCase() === selectedDestination ||
            dest?.name?.toLowerCase().trim().replace(/\s+/g, '-') === selectedDestination
          );
        });
        return primaryMatch || addlMatch;
      });
    }
    if (q) {
      result = result.filter((h) => {
        const extraNames = (h.additionalDestinations || []).map((ad: any) => ad.destination?.name);
        return matchesSearch(
          [h.name, h.description, h.destination?.name, h.destination?.country, h.address, ...extraNames],
          q,
        );
      });
    }
    return result;
  }, [hotels, selectedDestination, q]);

  const activeDestinationName = destinations.find((d) => d.slug === selectedDestination)?.name;

  return (
    <main className="min-h-screen surface-page pt-10">
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-50" />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 50% 40% at 30% 30%, color-mix(in oklab, var(--color-primary) 14%, transparent), transparent 70%)',
            }}
          />
        </div>

        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 pt-1 sm:pt-2 pb-4 sm:pb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full text-[10px] tracking-widest uppercase font-bold text-blue-700 dark:text-blue-300 border border-blue-500/30 bg-blue-500/10">
            <Building2 className="w-3 h-3" />
            Stays & Suites
          </span>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-[-0.02em] text-on-surface mb-6 max-w-3xl">
            Stays <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">made simple</span>
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed">
            Find and book your perfect stay — from luxury beachside resorts to cozy boutique city hotels worldwide with guaranteed best rates.
          </p>
        </div>
      </section>

      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 pt-2 pb-8">
        {loading ? (
          <p className="text-sm text-muted">Loading hotels…</p>
        ) : (
          <>
            {/* Destination filter pills */}
            {destinations.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-10">
                {destinations.slice(0, 20).map((c) => {
                  const isSelected = selectedDestination === c.slug;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedDestination((curr) => (curr === c.slug ? null : c.slug))}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium border glass hover:-translate-y-0.5 transition-all ${
                        isSelected
                          ? 'ring-2 ring-blue-500/60 border-blue-500/80 bg-blue-500/15 text-blue-900 dark:text-blue-200'
                          : ''
                      }`}
                      style={{ borderColor: isSelected ? undefined : 'var(--color-outline-variant)' }}
                    >
                      {c.flagUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.flagUrl} alt={c.name} className="w-5 h-4 object-cover rounded-sm" />
                      ) : (
                        <Globe className="w-4 h-4 text-muted" />
                      )}
                      {c.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Hotels list header */}
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-on-surface mb-6">
              Available hotels
            </h2>

            {hotels.length > 0 && (q || activeDestinationName) && (
              <SearchResultsBanner query={q || activeDestinationName || ''} count={shownHotels.length} noun="hotels" />
            )}

            {hotels.length === 0 ? (
              <div className="rounded-2xl border glass p-12 text-center" style={{ borderColor: 'var(--color-outline-variant)' }}>
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium text-on-surface">No hotels available yet</p>
                <p className="text-sm text-muted mt-1">Properties added by our team will appear here.</p>
              </div>
            ) : shownHotels.length === 0 ? (
              <div className="rounded-2xl border glass p-12 text-center" style={{ borderColor: 'var(--color-outline-variant)' }}>
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium text-on-surface">
                  No hotels match &ldquo;{q || activeDestinationName}&rdquo;.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {shownHotels.map((hotel) => (
                  <HotelCard key={hotel.id} {...hotel} />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 py-12">
        <div className="rounded-2xl border p-8 glass" style={{ borderColor: 'var(--color-outline-variant)' }}>
          <h3 className="font-display text-xl font-semibold text-on-surface mb-3">Why book hotels with FlynGo?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <Sparkles className="w-5 h-5 text-primary mb-2" />
              <div className="font-semibold mb-1">Handpicked luxury & comfort</div>
              <p className="text-on-surface-variant">Carefully inspected rooms and verified guest reviews for a guaranteed premium stay.</p>
            </div>
            <div>
              <ShieldCheck className="w-5 h-5 text-primary mb-2" />
              <div className="font-semibold mb-1">Best rate guarantee</div>
              <p className="text-on-surface-variant">No hidden fees, flexible booking options, and loyalty reward points on every stay.</p>
            </div>
            <div>
              <Headphones className="w-5 h-5 text-primary mb-2" />
              <div className="font-semibold mb-1">24/7 dedicated concierge</div>
              <p className="text-on-surface-variant">Round-the-clock reservation support and special arrangement requests.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
