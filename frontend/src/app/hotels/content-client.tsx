'use client';

import { Section, Container } from '@/components/ui/section';
import { HotelCard } from '@/components/features/hotels/hotel-card';
import { PageHero } from '@/components/ui/page-hero';
import { useApi } from '@/hooks/use-api';
import { useEffect, useState } from 'react';
import type { Hotel } from '@/types';

export function HotelsPageClient() {
  const { getHotels } = useApi();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const data: any = await getHotels();
        setHotels(data.data ?? data ?? []);
      } catch (err: any) {
        setError(err.message || 'Failed to load hotels');
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, [getHotels]);

  return (
    <>
      <PageHero
        eyebrow="Stays & Suites"
        title={<>Find Your <span className="gradient-text-warm">Perfect Stay</span></>}
        subtitle="From luxury resorts to cozy boutique hotels worldwide."
      />
      <Section>
        <Container>
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-white/60">Loading hotels...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-400">{error}</p>
            </div>
          ) : hotels.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/50 text-lg">No hotels available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <HotelCard key={hotel.id} {...hotel} starRating={5} amenities={[]} />
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
