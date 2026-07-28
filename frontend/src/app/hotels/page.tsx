'use client';

import { Section, Container } from '@/components/ui/section';
import { HotelCard } from '@/components/features/hotels/hotel-card';
import { useApi } from '@/hooks/use-api';
import { useEffect, useState } from 'react';
import type { Hotel } from '@/types';

export default function HotelsPage() {
  const { getHotels } = useApi();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const data: any = await getHotels();
        setHotels(data.items ?? data ?? []);
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
      <Section background="brand" className="pt-32 pb-24">
        <Container>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white text-center">Find Your Perfect Stay</h1>
          <p className="mt-4 text-lg text-brand-100 text-center max-w-2xl mx-auto">
            From luxury resorts to cozy boutique hotels worldwide
          </p>
        </Container>
      </Section>
      <Section background="white">
        <Container>
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-gray-500">Loading hotels...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500">{error}</p>
            </div>
          ) : hotels.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No hotels available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
