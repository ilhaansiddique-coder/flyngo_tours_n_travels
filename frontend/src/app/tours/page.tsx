'use client';

import { Section, Container } from '@/components/ui/section';
import { TourCard } from '@/components/features/tours/tour-card';
import { useApi } from '@/hooks/use-api';
import { useEffect, useState } from 'react';
import type { Tour } from '@/types';

export default function ToursPage() {
  const { getTours } = useApi();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const data: any = await getTours();
        setTours(data.data ?? data ?? []);
      } catch (err: any) {
        setError(err.message || 'Failed to load tours');
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, [getTours]);

  return (
    <>
      <Section background="brand" className="pt-32 pb-24">
        <Container>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white text-center">Explore Our Tours</h1>
          <p className="mt-4 text-lg text-brand-100 text-center max-w-2xl mx-auto">
            Curated experiences in the world&apos;s most breathtaking destinations
          </p>
        </Container>
      </Section>
      <Section background="white">
        <Container>
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-gray-500">Loading tours...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500">{error}</p>
            </div>
          ) : tours.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No tours available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tours.map((tour) => (
                <TourCard key={tour.id} {...tour} difficulty="easy" />
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
