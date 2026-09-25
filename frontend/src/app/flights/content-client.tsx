'use client';

import { useEffect, useMemo, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { useSearchQuery } from '@/hooks/use-search-query';
import { SearchResultsBanner } from '@/components/ui/search-results-banner';
import { FlightCard } from '@/components/features/flights/flight-card';
import { Plane, Globe, ShieldCheck, Headphones, Sparkles, CheckCircle2 } from 'lucide-react';
import { matchesSearch } from '@/lib/search';
import type { Flight } from '@/types';

export function FlightsPageClient() {
  const { getFlights } = useApi();
  const q = useSearchQuery();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data: any = await getFlights();
        const list = data?.data ?? data?.items ?? data ?? [];
        setFlights(list.filter((f: any) => f.isActive !== false));
      } catch {
        // handled in empty states
      } finally {
        setLoading(false);
      }
    })();
  }, [getFlights]);

  // Unique destinations/airlines for filter pills
  const destinationCities = useMemo(() => {
    const map = new Map<string, { city: string; code: string }>();
    for (const f of flights) {
      const city = f.destinationCity || f.destinationCode;
      if (city && !map.has(city.toLowerCase())) {
        map.set(city.toLowerCase(), { city, code: f.destinationCode });
      }
    }
    return Array.from(map.values());
  }, [flights]);

  const shownFlights = useMemo(() => {
    let result = flights;
    if (selectedDestination) {
      result = result.filter(
        (f) =>
          (f.destinationCity || '').toLowerCase() === selectedDestination.toLowerCase() ||
          f.destinationCode.toLowerCase() === selectedDestination.toLowerCase(),
      );
    }
    if (q) {
      result = result.filter((f) =>
        matchesSearch(
          [f.airline, f.flightNumber, f.originCity, f.originCode, f.destinationCity, f.destinationCode],
          q,
        ),
      );
    }
    return result;
  }, [flights, selectedDestination, q]);

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
          <span className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full text-[10px] tracking-widest uppercase font-bold text-blue-700 dark:text-blue-300 border border-blue-500/30 bg-blue-500/10">
            <Plane className="w-3 h-3" />
            Flight Bookings
          </span>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-[-0.02em] text-on-surface mb-6 max-w-3xl">
            Flights <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">made simple</span>
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed">
            Search hundreds of trusted airlines for the best airfares worldwide. Instant e-ticket confirmation, 24/7 flight support, and rewards on every route.
          </p>
        </div>
      </section>

      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 pt-2 pb-8">
        {loading ? (
          <p className="text-sm text-muted">Loading flights…</p>
        ) : (
          <>
            {/* Quick route filter pills */}
            {destinationCities.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-10">
                <button
                  type="button"
                  onClick={() => setSelectedDestination(null)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium border glass hover:-translate-y-0.5 transition-all ${
                    selectedDestination === null
                      ? 'ring-2 ring-blue-500/60 border-blue-500/80 bg-blue-500/15 text-blue-900 dark:text-blue-200'
                      : ''
                  }`}
                  style={{ borderColor: selectedDestination === null ? undefined : 'var(--color-outline-variant)' }}
                >
                  <Globe className="w-4 h-4 text-muted" />
                  All Routes
                </button>
                {destinationCities.slice(0, 20).map((d) => {
                  const isSelected = selectedDestination?.toLowerCase() === d.city.toLowerCase();
                  return (
                    <button
                      key={d.city}
                      type="button"
                      onClick={() => setSelectedDestination(isSelected ? null : d.city)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium border glass hover:-translate-y-0.5 transition-all ${
                        isSelected
                          ? 'ring-2 ring-blue-500/60 border-blue-500/80 bg-blue-500/15 text-blue-900 dark:text-blue-200'
                          : ''
                      }`}
                      style={{ borderColor: isSelected ? undefined : 'var(--color-outline-variant)' }}
                    >
                      <Plane className="w-3.5 h-3.5 text-blue-500" />
                      To {d.city} ({d.code})
                    </button>
                  );
                })}
              </div>
            )}

            {/* Flights list */}
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-on-surface mb-6">
              Available flights
            </h2>

            {flights.length > 0 && (q || selectedDestination) && (
              <SearchResultsBanner query={q || `To ${selectedDestination}`} count={shownFlights.length} noun="flights" />
            )}

            {flights.length === 0 ? (
              <div className="rounded-2xl border glass p-12 text-center" style={{ borderColor: 'var(--color-outline-variant)' }}>
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium text-on-surface">No flights available right now</p>
                <p className="text-sm text-muted mt-1">Flight schedules added by our team will appear here.</p>
              </div>
            ) : shownFlights.length === 0 ? (
              <div className="rounded-2xl border glass p-12 text-center" style={{ borderColor: 'var(--color-outline-variant)' }}>
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium text-on-surface">
                  No flights match &ldquo;{q || selectedDestination}&rdquo;.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {shownFlights.map((flight) => (
                  <FlightCard key={flight.id} {...flight} />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 py-12">
        <div className="rounded-2xl border p-8 glass" style={{ borderColor: 'var(--color-outline-variant)' }}>
          <h3 className="font-display text-xl font-semibold text-on-surface mb-3">Why book flights with FlynGo?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <CheckCircle2 className="w-5 h-5 text-primary mb-2" />
              <div className="font-semibold mb-1">Instant confirmation & e-tickets</div>
              <p className="text-on-surface-variant">Immediate PNR generation and official e-tickets sent straight to your email.</p>
            </div>
            <div>
              <ShieldCheck className="w-5 h-5 text-primary mb-2" />
              <div className="font-semibold mb-1">Transparent airfares</div>
              <p className="text-on-surface-variant">All taxes and airline surcharges included upfront with zero hidden fees.</p>
            </div>
            <div>
              <Headphones className="w-5 h-5 text-primary mb-2" />
              <div className="font-semibold mb-1">24/7 flight assistance</div>
              <p className="text-on-surface-variant">Round-the-clock support for seat selection, meal preferences, and re-routing.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
