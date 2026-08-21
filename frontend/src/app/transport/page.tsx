'use client';

import { Section, Container, SectionHeader } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { PageHero } from '@/components/ui/page-hero';
import Link from 'next/link';
import { Car, Bus, Plane, Ship, Clock, Shield, MapPin, Users, ArrowRight } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface TransportItem {
  id: string;
  vehicleType: string;
  operatorName?: string | null;
  title: string;
  originCity: string;
  destinationCity: string;
  departureTime?: string | null;
  arrivalTime?: string | null;
  duration?: string | null;
  price: number | string;
  currency?: string;
  totalSeats?: number;
  availableSeats?: number;
  amenities?: string[];
}

const VEHICLE_ICONS: Record<string, LucideIcon> = {
  car: Car,
  microbus: Car,
  shuttle: Bus,
  bus: Bus,
  ferry: Ship,
};

const features = [
  { icon: Clock, title: 'On-time guarantee', description: 'Real-time flight tracking and 60-minute free wait time on airport pickups.' },
  { icon: Shield, title: 'Vetted drivers', description: 'All drivers are licensed, insured, and trained in hospitality and safety.' },
  { icon: MapPin, title: 'Global coverage', description: 'Available in 200+ cities across 60 countries with consistent service standards.' },
];

export default function TransportPage() {
  const { getTransport } = useApi();
  const [items, setItems] = useState<TransportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchTransport = async () => {
      try {
        const data: any = await getTransport();
        const list = data.data ?? data ?? [];
        if (!cancelled) setItems(Array.isArray(list) ? list : []);
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load transport options');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchTransport();
    return () => {
      cancelled = true;
    };
  }, [getTransport]);

  return (
    <>
      <PageHero
        eyebrow="Ground & Sea"
        title={<>Transport <span className="gradient-text-warm">Services</span></>}
        subtitle="Seamless ground and sea transfers wherever your journey takes you."
      />

      <Section>
        <Container>
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-white/60">Loading transport options...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-400">{error}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/50 text-lg">No transport options available yet. Contact us for a custom transfer.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => {
                const Icon = VEHICLE_ICONS[item.vehicleType?.toLowerCase()] ?? Car;
                return (
                  <Card key={item.id} hover={false}>
                    <div className="w-12 h-12 rounded-xl bg-accent-soft border border-accent-soft flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="font-display text-lg font-bold mb-1 text-on-surface">{item.title}</h3>
                    {item.operatorName && (
                      <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-2">{item.operatorName}</p>
                    )}
                    <p className="text-on-surface-variant text-sm flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                      {item.originCity} → {item.destinationCity}
                    </p>
                    {(item.departureTime || item.arrivalTime) && (
                      <p className="text-on-surface-variant text-sm mt-1">
                        {[item.departureTime, item.arrivalTime].filter(Boolean).join(' – ')}
                        {item.duration ? ` · ${item.duration}` : ''}
                      </p>
                    )}
                    {item.amenities && item.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {item.amenities.slice(0, 4).map((a) => (
                          <span
                            key={a}
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-on-surface-soft text-muted border border-hairline"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-hairline">
                      <div>
                        <span className="text-xs text-on-surface-variant">From</span>
                        <p className="text-lg font-bold text-accent">
                          {formatCurrency(Number(item.price), item.currency || 'BDT')}
                        </p>
                      </div>
                      {item.availableSeats != null && item.availableSeats > 0 && (
                        <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                          <Users className="w-3.5 h-3.5 text-accent" />
                          {item.availableSeats}
                          {item.totalSeats ? ` / ${item.totalSeats}` : ''} seats
                        </span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Container>
      </Section>

      <Section background="subtle">
        <Container>
          <SectionHeader eyebrow="Why Us" title="Why book transport with FlynGo" subtitle="Pre-booked, transparent pricing and support in your language, around the clock." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="text-center rounded-2xl glass p-8 border-hairline">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-accent-soft border border-accent-soft flex items-center justify-center mb-4">
                  <f.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2 text-on-surface">{f.title}</h3>
                <p className="text-on-surface-variant text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container size="narrow">
          <div className="prose mx-auto text-center rounded-2xl glass p-10 border-hairline">
            <h2 className="font-display text-2xl font-bold text-on-surface">Need a custom transfer?</h2>
            <p className="text-on-surface-variant">
              Tell us where, when, and how many travelers. Our team will put together a tailored quote within 2 hours.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all hover:-translate-y-0.5"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-on-primary)',
                boxShadow: '0 12px 28px -8px var(--accent-glow-strong)',
              }}
            >
              Contact us
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
