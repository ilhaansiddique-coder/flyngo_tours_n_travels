'use client';

import { useEffect, useMemo, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { useSearchQuery } from '@/hooks/use-search-query';
import { SearchResultsBanner } from '@/components/ui/search-results-banner';
import { TourCard } from '@/components/features/tours/tour-card';
import { Compass, Globe, ShieldCheck, Headphones } from 'lucide-react';
import { matchesSearch } from '@/lib/search';
import { getCountryFlagByName } from '@/lib/world-places';
import type { Tour } from '@/types';

export function ToursPageClient() {
  const { getTours } = useApi();
  const q = useSearchQuery();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getTours({ limit: '100' });
        const list: Tour[] = Array.isArray(res)
          ? res
          : ((res as any)?.data ?? (res as any)?.items ?? []);
        setTours(list.filter((t) => t.isActive !== false));
      } catch {
        // empty state handled below
      } finally {
        setLoading(false);
      }
    })();
  }, [getTours]);

  // Destination quick navigation pills (with flags)
  const destinations = useMemo(() => {
    const map = new Map<string, { id: string; name: string; slug: string; flagUrl?: string }>();
    for (const t of tours) {
      const d = t.destination;
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
      for (const ad of t.additionalDestinations || []) {
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
  }, [tours]);

  const shownTours = useMemo(() => {
    let result = tours;
    if (selectedDestination) {
      result = result.filter((t) => {
        const primaryMatch =
          t.destination?.slug?.toLowerCase() === selectedDestination ||
          t.destination?.name?.toLowerCase().trim().replace(/\s+/g, '-') === selectedDestination;
        const addlMatch = (t.additionalDestinations || []).some((ad: any) => {
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
      result = result.filter((t) => {
        const extraNames = (t.additionalDestinations || []).map((ad: any) => ad.destination?.name);
        return matchesSearch(
          [t.title, t.titleBn, t.description, t.descriptionBn, t.destination?.name, t.destination?.country, ...extraNames],
          q,
        );
      });
    }
    return result;
  }, [tours, selectedDestination, q]);

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
          <span className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full text-[10px] tracking-widest uppercase font-bold text-amber-700 dark:text-amber-300 border border-amber-500/30 bg-amber-500/10">
            <Compass className="w-3 h-3" />
            Curated Experiences
          </span>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-[-0.02em] text-on-surface mb-6 max-w-3xl">
            Tours <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">curated for you</span>
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed">
            Curated experiences in the world&apos;s most breathtaking destinations. Handcrafted itineraries, expert guides, seamless bookings — earn points on every journey.
          </p>
        </div>
      </section>

      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 pt-2 pb-8">
        {loading ? (
          <p className="text-sm text-muted">Loading tours…</p>
        ) : (
          <>
            {/* Destination quick navigation pills */}
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
                          ? 'ring-2 ring-amber-500/60 border-amber-500/80 bg-amber-500/15 text-amber-900 dark:text-amber-200'
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

            {/* Tours list */}
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-on-surface mb-6">
              Available tours
            </h2>

            {tours.length > 0 && (q || activeDestinationName) && (
              <SearchResultsBanner query={q || activeDestinationName || ''} count={shownTours.length} noun="tours" />
            )}

            {tours.length === 0 ? (
              <div className="rounded-2xl border glass p-12 text-center" style={{ borderColor: 'var(--color-outline-variant)' }}>
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium text-on-surface">No tours available yet</p>
                <p className="text-sm text-muted mt-1">Tour packages added by our team will appear here.</p>
              </div>
            ) : shownTours.length === 0 ? (
              <div className="rounded-2xl border glass p-12 text-center" style={{ borderColor: 'var(--color-outline-variant)' }}>
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium text-on-surface">
                  No tours match &ldquo;{q || activeDestinationName}&rdquo;.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {shownTours.map((tour) => (
                  <TourCard key={tour.id} {...tour} />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 py-12">
        <div className="rounded-2xl border p-8 glass" style={{ borderColor: 'var(--color-outline-variant)' }}>
          <h3 className="font-display text-xl font-semibold text-on-surface mb-3">Why choose our tours?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <Compass className="w-5 h-5 text-primary mb-2" />
              <div className="font-semibold mb-1">Handpicked experiences</div>
              <p className="text-on-surface-variant">Carefully crafted itineraries led by certified local guides and travel experts.</p>
            </div>
            <div>
              <ShieldCheck className="w-5 h-5 text-primary mb-2" />
              <div className="font-semibold mb-1">Best price guarantee</div>
              <p className="text-on-surface-variant">Transparent pricing with no hidden charges, flexible bookings, and points on every tour.</p>
            </div>
            <div>
              <Headphones className="w-5 h-5 text-primary mb-2" />
              <div className="font-semibold mb-1">24/7 dedicated support</div>
              <p className="text-on-surface-variant">White-glove concierge support before, during, and after your trip.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
