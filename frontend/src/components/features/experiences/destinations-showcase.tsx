'use client';

import { ArrowUpRight, MapPin } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { useApi } from '@/hooks/use-api';
import { destinationImage } from '@/lib/entity-image';
import { countryFlag } from '@/lib/country-flag';
import { useEffect, useMemo, useState } from 'react';

interface ApiDestination {
  id: string;
  name: string;
  slug: string;
  country: string;
  continent?: string | null;
  imageUrl?: string | null;
  coverImageUrl?: string | null;
  _count?: { tours?: number; hotels?: number };
}

export function DestinationsShowcase() {
  const { getDestinations } = useApi();
  const [destinations, setDestinations] = useState<ApiDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRegion, setActiveRegion] = useState<string>('All');

  useEffect(() => {
    let cancelled = false;
    const fetchDestinations = async () => {
      try {
        const data: any = await getDestinations({ featured: 'true' });
        const items = data.data ?? data ?? [];
        if (!cancelled) setDestinations(Array.isArray(items) ? items : []);
      } catch {
        if (!cancelled) setDestinations([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchDestinations();
    return () => {
      cancelled = true;
    };
  }, [getDestinations]);

  const regions = useMemo(
    () => ['All', ...Array.from(new Set(destinations.map((d) => d.continent).filter((c): c is string => !!c))).sort()],
    [destinations],
  );

  const filtered =
    loading || destinations.length === 0
      ? []
      : activeRegion === 'All'
        ? destinations
        : destinations.filter((d) => d.continent === activeRegion);

  if (!loading && destinations.length === 0) return null;

  return (
    <section className="relative px-4 sm:px-6 lg:px-16 max-w-[1600px] mx-auto mb-32">
      <SectionHeading
        eyebrow="Featured Destinations"
        title={
          <>
            Where to <span className="gradient-text-warm">next?</span>
          </>
        }
        subtitle="A curated selection of destinations our travelers are booking this season."
        action={{ label: 'View all destinations', href: '/destinations' }}
      />

      {!loading && regions.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setActiveRegion(r)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide border transition-all ${
                activeRegion === r
                  ? 'shadow-lg'
                  : 'bg-on-surface-soft text-muted border-hairline-strong hover:border-soft hover:text-on-bg'
              }`}
              style={
                activeRegion === r
                  ? {
                      backgroundColor: 'var(--color-accent)',
                      color: 'var(--color-on-accent)',
                      borderColor: 'var(--color-accent)',
                      boxShadow: '0 12px 28px -8px var(--accent-glow-strong)',
                    }
                  : undefined
              }
            >
              {r}
              <span className="ml-1.5 text-[10px] opacity-60">
                {r === 'All'
                  ? destinations.length
                  : destinations.filter((d) => d.continent === r).length}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-outline-variant/50 bg-surface-container overflow-hidden animate-pulse">
                <div className="h-72 bg-on-surface-soft" />
                <div className="px-5 py-4 space-y-2">
                  <div className="h-3 w-1/3 rounded bg-on-surface-soft" />
                  <div className="h-5 w-1/2 rounded bg-on-surface-soft" />
                </div>
              </div>
            ))
          : filtered.map((d) => {
              const image = destinationImage(d);
              return (
                <a
                  key={d.id}
                  href={`/destinations/${d.slug}`}
                  className="group relative overflow-hidden rounded-3xl border border-outline-variant/50 bg-surface-container transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(12,22,40,0.08),0_16px_40px_-6px_rgba(12,22,40,0.12)]"
                >
                  <div className="relative h-72 overflow-hidden bg-gradient-to-br from-primary to-tertiary">
                    {image ? (
                      <img
                        src={image}
                        alt={d.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-grid opacity-50" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute top-4 right-4 z-10">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.85)',
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <ArrowUpRight className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 z-10">
                      <div className="flex items-center gap-1.5 text-xs text-white/80 mb-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-medium">
                          <span className="mr-1">{countryFlag(d.country)}</span>
                          {d.country}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">
                        {d.name}
                      </h3>
                    </div>
                  </div>
                  {(d._count?.tours != null || d._count?.hotels != null) && (
                    <div className="flex items-center gap-4 px-5 py-3.5">
                      {d._count?.tours != null && (
                        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                          <span className="font-semibold text-on-bg">{d._count.tours}</span>
                          <span>tours</span>
                        </div>
                      )}
                      {d._count?.hotels != null && (
                        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                          <span className="font-semibold text-on-bg">{d._count.hotels}</span>
                          <span>hotels</span>
                        </div>
                      )}
                    </div>
                  )}
                </a>
              );
            })}
      </div>
    </section>
  );
}
