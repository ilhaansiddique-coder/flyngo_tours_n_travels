'use client';

import { Section, Container } from '@/components/ui/section';
import { FlightCard } from '@/components/features/flights/flight-card';
import { PageHero } from '@/components/ui/page-hero';
import { useApi } from '@/hooks/use-api';
import { useEffect, useState } from 'react';
import type { Flight } from '@/types';

export default function FlightsPage() {
  const { getFlights } = useApi();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const data: any = await getFlights();
        setFlights(data.data ?? data ?? []);
      } catch (err: any) {
        setError(err.message || 'Failed to load flights');
      } finally {
        setLoading(false);
      }
    };
    fetchFlights();
  }, [getFlights]);

  return (
    <>
      <PageHero
        eyebrow="Worldwide Routes"
        title={<>Find & Book <span className="gradient-text-warm">Flights</span></>}
        subtitle="Search hundreds of airlines for the best deals worldwide."
      />
      <Section>
        <Container>
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-white/60">Loading flights...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-400">{error}</p>
            </div>
          ) : flights.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/50 text-lg">No flights available yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {flights.map((flight) => (
                <FlightCard key={flight.id} {...flight} />
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
