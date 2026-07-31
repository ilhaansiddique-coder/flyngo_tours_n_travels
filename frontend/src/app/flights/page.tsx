'use client';

import { Section, Container } from '@/components/ui/section';
import { FlightCard } from '@/components/features/flights/flight-card';
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
        setFlights(data.items ?? data ?? []);
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
      <Section background="brand" className="pt-32 pb-24">
        <Container>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white text-center">Find & Book Flights</h1>
          <p className="mt-4 text-lg text-brand-100 text-center max-w-2xl mx-auto">
            Search hundreds of airlines for the best deals worldwide
          </p>
        </Container>
      </Section>
      <Section background="white">
        <Container>
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-gray-500">Loading flights...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500">{error}</p>
            </div>
          ) : flights.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No flights available yet.</p>
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
