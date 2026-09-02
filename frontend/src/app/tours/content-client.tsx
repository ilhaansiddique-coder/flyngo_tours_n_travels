'use client';

import { Section, Container } from '@/components/ui/section';
import { TourCard } from '@/components/features/tours/tour-card';
import { PageHero } from '@/components/ui/page-hero';
import { useApi } from '@/hooks/use-api';
import { useEffect, useState } from 'react';
import type { Tour } from '@/types';

export function ToursPageClient() {
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
      <PageHero
        eyebrow="Curated Experiences"
        title={<>Explore Our <span className="gradient-text-warm">Tours</span></>}
        subtitle="Curated experiences in the world's most breathtaking destinations."
      />
      <Section>
        <Container>
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-white/60">Loading tours...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-400">{error}</p>
            </div>
          ) : tours.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/50 text-lg">No tours available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
