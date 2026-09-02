'use client';

import { Section, Container } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { PageHero } from '@/components/ui/page-hero';
import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { useEffect, useState } from 'react';

interface ApiDestination {
  id: string;
  name: string;
  slug: string;
  country: string;
  imageUrl?: string | null;
  coverImageUrl?: string | null;
  _count?: { tours?: number; hotels?: number };
}

export function DestinationsPageClient() {
  const { getDestinations } = useApi();
  const [destinations, setDestinations] = useState<ApiDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchDestinations = async () => {
      try {
        const data: any = await getDestinations();
        const items = data.data ?? data ?? [];
        if (!cancelled) setDestinations(Array.isArray(items) ? items : []);
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load destinations');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchDestinations();
    return () => {
      cancelled = true;
    };
  }, [getDestinations]);

  return (
    <>
      <PageHero
        eyebrow="Worldwide"
        title={<>Explore <span className="gradient-text-warm">Destinations</span></>}
        subtitle="Choose from hundreds of incredible destinations worldwide — curated for the luxury traveller."
      />
      <Section>
        <Container>
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-white/60">Loading destinations...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-400">{error}</p>
            </div>
          ) : destinations.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/50 text-lg">No destinations available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {destinations.map((dest) => {
                const image = dest.coverImageUrl || dest.imageUrl;
                return (
                  <Link key={dest.id} href={`/destinations/${dest.slug}`} className="group block">
                    <Card className="group h-full" hover={false}>
                      <div className="relative h-48 rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-primary to-tertiary">
                        {image && (
                          <img
                            src={image}
                            alt={dest.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                        {!image && (
                          <>
                            <div className="absolute inset-0 bg-grid opacity-50" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="font-display text-5xl font-extrabold text-on-bg/30 group-hover:text-on-bg/60 transition-colors">
                                {dest.name[0]}{dest.country[0]}
                              </span>
                            </div>
                          </>
                        )}
                        <div className="absolute inset-0 scrim-soft" />
                        <div
                          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                          style={{
                            backgroundColor: 'color-mix(in oklab, var(--color-on-background) 10%, transparent)',
                            border: '1px solid color-mix(in oklab, var(--color-on-background) 20%, transparent)',
                            color: 'var(--color-on-background)',
                          }}
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-display text-lg font-bold text-on-surface group-hover:text-accent transition-colors">
                            {dest.name}
                          </h3>
                          <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {dest.country}
                          </p>
                        </div>
                      </div>
                      {(dest._count?.tours != null || dest._count?.hotels != null) && (
                        <div className="flex gap-4 mt-4 pt-4 border-t border-hairline text-sm">
                          {dest._count?.tours != null && (
                            <span className="text-on-surface-variant">
                              <span className="text-accent font-semibold">{dest._count.tours}</span> Tours
                            </span>
                          )}
                          {dest._count?.hotels != null && (
                            <span className="text-on-surface-variant">
                              <span className="text-accent font-semibold">{dest._count.hotels}</span> Hotels
                            </span>
                          )}
                        </div>
                      )}
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
