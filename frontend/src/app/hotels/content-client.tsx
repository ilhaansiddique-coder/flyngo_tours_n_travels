'use client';

import { useEffect, useMemo, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { useSearchQuery } from '@/hooks/use-search-query';
import { SearchResultsBanner } from '@/components/ui/search-results-banner';
import { HotelCard } from '@/components/features/hotels/hotel-card';
import {
  Building2,
  Globe,
  ShieldCheck,
  Headphones,
  Sparkles,
  Search,
  Star,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  CheckCircle2,
} from 'lucide-react';
import { matchesSearch } from '@/lib/search';
import { getCountryFlagByName } from '@/lib/world-places';
import type { Hotel } from '@/types';

type SortOption = 'recommended' | 'price-asc' | 'price-desc' | 'rating-desc';

export function HotelsPageClient() {
  const { getHotels } = useApi();
  const qParam = useSearchQuery();

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(qParam || '');
  const [selectedStar, setSelectedStar] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');

  useEffect(() => {
    if (qParam) setSearchQuery(qParam);
  }, [qParam]);

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

  // Filter & sort logic
  const shownHotels = useMemo(() => {
    let result = hotels;

    // Filter by destination
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

    // Filter by search query
    if (searchQuery.trim()) {
      result = result.filter((h) => {
        const extraNames = (h.additionalDestinations || []).map((ad: any) => ad.destination?.name);
        return matchesSearch(
          [h.name, h.description, h.destination?.name, h.destination?.country, h.address, ...(h.amenities || []), ...extraNames],
          searchQuery.trim(),
        );
      });
    }

    // Filter by star rating
    if (selectedStar !== 'all') {
      result = result.filter((h) => h.starRating === selectedStar);
    }

    // Sort results
    const sorted = [...result];
    if (sortBy === 'price-asc') {
      sorted.sort((a, b) => Number(a.pricePerNight) - Number(b.pricePerNight));
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => Number(b.pricePerNight) - Number(a.pricePerNight));
    } else if (sortBy === 'rating-desc') {
      sorted.sort((a, b) => Number(b.starRating) - Number(a.starRating));
    }

    return sorted;
  }, [hotels, selectedDestination, searchQuery, selectedStar, sortBy]);

  const activeDestinationName = destinations.find((d) => d.slug === selectedDestination)?.name;
  const isFiltering = Boolean(selectedDestination || searchQuery || selectedStar !== 'all' || sortBy !== 'recommended');

  const clearAllFilters = () => {
    setSelectedDestination(null);
    setSearchQuery('');
    setSelectedStar('all');
    setSortBy('recommended');
  };

  return (
    <main className="min-h-screen surface-page pt-10 pb-20">
      {/* Hero Section */}
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

        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 pt-2 pb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full text-[10px] tracking-widest uppercase font-bold text-blue-700 dark:text-blue-300 border border-blue-500/30 bg-blue-500/10">
            <Building2 className="w-3 h-3" />
            Verified Stays &amp; Luxury Resorts
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-[-0.02em] text-on-surface mb-4 max-w-3xl">
            Find your perfect stay <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">worldwide</span>
          </h1>
          <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed mb-8">
            Handpicked 3 to 5-star hotels, luxury suites, and boutique resorts with transparent pricing, instant booking confirmation, and dedicated concierge support.
          </p>

          {/* Integrated Modern Search Bar */}
          <div className="max-w-2xl p-2 rounded-2xl border border-outline-variant/60 bg-surface/90 backdrop-blur-md shadow-lg flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2.5 px-3">
              <Search className="w-5 h-5 text-accent shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by hotel name, city, landmark, or amenities…"
                className="w-full text-sm bg-transparent outline-none text-on-surface placeholder:text-muted"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-muted hover:text-on-surface"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Filter Toolbar & Grid */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 pt-6">
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted mt-3">Loading luxury stays…</p>
          </div>
        ) : (
          <>
            {/* Destination Quick Filters */}
            {destinations.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setSelectedDestination(null)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    selectedDestination === null
                      ? 'bg-primary text-on-primary border-primary shadow-xs'
                      : 'border-outline-variant glass text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" /> All Destinations
                </button>
                {destinations.slice(0, 15).map((c) => {
                  const isSelected = selectedDestination === c.slug;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedDestination((curr) => (curr === c.slug ? null : c.slug))}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-primary text-on-primary border-primary shadow-xs'
                          : 'border-outline-variant glass text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      {c.flagUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.flagUrl} alt="" className="w-4 h-3 object-cover rounded-xs" />
                      ) : null}
                      {c.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Advanced Filters & Sorting Strip */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container border border-outline-variant/40 mb-8">
              {/* Star Rating Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
                <span className="text-xs font-semibold text-muted mr-1 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Stars:
                </span>
                {(['all', 5, 4, 3] as const).map((starVal) => {
                  const isSelected = selectedStar === starVal;
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setSelectedStar(starVal)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-accent text-on-accent border-accent'
                          : 'border-outline-variant bg-surface text-on-surface hover:bg-surface-container-high'
                      }`}
                    >
                      {starVal === 'all' ? 'All Stars' : `${starVal} Stars`}
                    </button>
                  );
                })}
              </div>

              {/* Sorting and Results Count */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-on-surface-variant font-medium">
                  {shownHotels.length} {shownHotels.length === 1 ? 'hotel' : 'hotels'} available
                </span>

                <div className="flex items-center gap-1.5 bg-surface border border-outline-variant rounded-xl px-2.5 py-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-muted" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="text-xs bg-transparent text-on-surface font-medium outline-none cursor-pointer"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating-desc">Star Rating: High to Low</option>
                  </select>
                </div>

                {isFiltering && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs text-accent font-semibold hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Results Grid */}
            {shownHotels.length === 0 ? (
              <div className="rounded-2xl border glass p-12 text-center" style={{ borderColor: 'var(--color-outline-variant)' }}>
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-40 text-accent" />
                <h3 className="text-lg font-bold text-on-surface">No hotels found</h3>
                <p className="text-sm text-muted mt-1 max-w-md mx-auto">
                  We couldn&apos;t find any properties matching your current filters. Try changing your search query or reset the filters.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-accent text-on-accent"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {shownHotels.map((hotel) => (
                  <HotelCard key={hotel.id} {...hotel} />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* World-Class Trust & Assurance Section */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 pt-16">
        <div className="rounded-3xl border p-8 sm:p-10 glass bg-surface-container-low" style={{ borderColor: 'var(--color-outline-variant)' }}>
          <h2 className="font-display text-2xl font-bold text-on-surface mb-2">Why book your stays with FlynGo?</h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mb-8 max-w-2xl">
            We partner directly with leading hospitality groups worldwide to deliver the most comfortable, hassle-free booking experience.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            <div className="p-4 rounded-2xl bg-surface border border-outline-variant/40 space-y-2">
              <div className="p-2 rounded-xl bg-accent/10 text-accent w-fit">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="font-bold text-on-surface">Inspected Properties</div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Handpicked resorts and city hotels inspected for hygiene, comfort, and service excellence.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-outline-variant/40 space-y-2">
              <div className="p-2 rounded-xl bg-accent/10 text-accent w-fit">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="font-bold text-on-surface">Guaranteed Best Rates</div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Transparent pricing with no surprise service charges and exclusive loyalty points on each stay.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-outline-variant/40 space-y-2">
              <div className="p-2 rounded-xl bg-accent/10 text-accent w-fit">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="font-bold text-on-surface">Flexible Cancellation</div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Plans change — enjoy free cancellations up to 48 hours before check-in on most standard rates.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-outline-variant/40 space-y-2">
              <div className="p-2 rounded-xl bg-accent/10 text-accent w-fit">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="font-bold text-on-surface">24/7 Concierge Support</div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Our support team is available day and night to assist with early check-ins, upgrades, or special requests.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
