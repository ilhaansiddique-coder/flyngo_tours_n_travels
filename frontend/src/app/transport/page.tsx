'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Car, Bus, Ship, Clock, Shield, MapPin, Users, ArrowRight, Eye, Globe } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { useFormatCurrency } from '@/lib/utils';
import { useBookingStore } from '@/stores/booking.store';
import { transportImage } from '@/lib/entity-image';
import { useSearchQueryState } from '@/hooks/use-search-query';
import { SearchResultsBanner } from '@/components/ui/search-results-banner';
import { filtersToParams, type ListFilterState } from '@/components/ui/list-filters';

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
  coverImageUrl?: string | null;
  imageUrl?: string | null;
}

const VEHICLE_ICONS: Record<string, LucideIcon> = {
  car: Car,
  microbus: Car,
  shuttle: Bus,
  bus: Bus,
  ferry: Ship,
};

export default function TransportPage() {
  const router = useRouter();
  const { getTransport } = useApi();
  const setSelectedItem = useBookingStore((s) => s.setSelectedItem);
  const fmt = useFormatCurrency();
  const { q, ready } = useSearchQueryState();
  const [filters] = useState<ListFilterState>({});
  const [items, setItems] = useState<TransportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string | null>(null);

  const bookTransport = (id: string) => {
    setSelectedItem(id);
    router.push(`/booking?type=transport&id=${id}`);
  };

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    setLoading(true);
    const fetchTransport = async () => {
      try {
        const params = { ...filtersToParams(filters), ...(q ? { q } : {}) };
        const data: any = await getTransport(Object.keys(params).length ? params : undefined);
        const list = data.data ?? data ?? [];
        if (!cancelled) setItems(Array.isArray(list) ? list : []);
      } catch {
        // handled in empty states
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchTransport();
    return () => {
      cancelled = true;
    };
  }, [getTransport, filters, q, ready]);

  // Vehicle types for quick navigation filter pills
  const vehicleTypes = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) {
      if (it.vehicleType) set.add(it.vehicleType.trim().toLowerCase());
    }
    return Array.from(set);
  }, [items]);

  const shown = useMemo(() => {
    let result = items;
    if (selectedVehicleType) {
      result = result.filter(
        (it) => (it.vehicleType || '').toLowerCase().trim() === selectedVehicleType.toLowerCase().trim(),
      );
    }
    if (q) {
      const needle = q.toLowerCase();
      result = result.filter((it: any) =>
        [it.title, it.operatorName, it.vehicleType, it.originCity, it.destinationCity]
          .filter(Boolean)
          .some((s: string) => String(s).toLowerCase().includes(needle)),
      );
    }
    return result;
  }, [items, selectedVehicleType, q]);

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
            <Car className="w-3 h-3" />
            Ground & Sea Transfers
          </span>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-[-0.02em] text-on-surface mb-6 max-w-3xl">
            Transport <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">made simple</span>
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed">
            Seamless private and shared airport transfers, city shuttles, intercity transport, and chartered rides with professional vetted chauffeurs.
          </p>
        </div>
      </section>

      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 pt-2 pb-8">
        {loading ? (
          <p className="text-sm text-muted">Loading transport options…</p>
        ) : (
          <>
            {/* Vehicle type filter pills */}
            {vehicleTypes.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-10">
                <button
                  type="button"
                  onClick={() => setSelectedVehicleType(null)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium border glass hover:-translate-y-0.5 transition-all ${
                    selectedVehicleType === null
                      ? 'ring-2 ring-blue-500/60 border-blue-500/80 bg-blue-500/15 text-blue-900 dark:text-blue-200'
                      : ''
                  }`}
                  style={{ borderColor: selectedVehicleType === null ? undefined : 'var(--color-outline-variant)' }}
                >
                  <Globe className="w-4 h-4 text-muted" />
                  All Vehicles
                </button>
                {vehicleTypes.map((vt) => {
                  const Icon = VEHICLE_ICONS[vt] ?? Car;
                  const isSelected = selectedVehicleType?.toLowerCase() === vt.toLowerCase();
                  return (
                    <button
                      key={vt}
                      type="button"
                      onClick={() => setSelectedVehicleType(isSelected ? null : vt)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium border glass hover:-translate-y-0.5 transition-all capitalize ${
                        isSelected
                          ? 'ring-2 ring-blue-500/60 border-blue-500/80 bg-blue-500/15 text-blue-900 dark:text-blue-200'
                          : ''
                      }`}
                      style={{ borderColor: isSelected ? undefined : 'var(--color-outline-variant)' }}
                    >
                      <Icon className="w-3.5 h-3.5 text-blue-500" />
                      {vt}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Transport list header */}
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-on-surface mb-6">
              Available transport services
            </h2>

            {items.length > 0 && (q || selectedVehicleType) && (
              <SearchResultsBanner query={q || selectedVehicleType || ''} count={shown.length} noun="transport" />
            )}

            {items.length === 0 ? (
              <div className="rounded-2xl border glass p-12 text-center" style={{ borderColor: 'var(--color-outline-variant)' }}>
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium text-on-surface">No transport options available yet</p>
                <p className="text-sm text-muted mt-1">Contact our team for customized private transfer bookings.</p>
              </div>
            ) : shown.length === 0 ? (
              <div className="rounded-2xl border glass p-12 text-center" style={{ borderColor: 'var(--color-outline-variant)' }}>
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium text-on-surface">
                  No transport matches &ldquo;{q || selectedVehicleType}&rdquo;.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {shown.map((item) => {
                  const Icon = VEHICLE_ICONS[item.vehicleType?.toLowerCase()] ?? Car;
                  return (
                    <div
                      key={item.id}
                      className="group flex flex-col rounded-2xl border glass overflow-hidden hover:-translate-y-1 transition-all"
                      style={{
                        borderColor: 'var(--color-outline-variant)',
                        boxShadow: '0 8px 24px -12px rgba(7, 86, 184, 0.18)',
                      }}
                    >
                      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-blue-500/20 to-cyan-500/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={transportImage(item)}
                          alt={item.title}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white bg-black/40 backdrop-blur-sm border border-white/20">
                          <Icon className="w-3.5 h-3.5" />
                          {item.vehicleType}
                        </span>
                        <span className="absolute bottom-2.5 left-3 right-3 truncate text-white font-display font-bold text-lg drop-shadow">
                          {item.originCity} → {item.destinationCity}
                        </span>
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[11px] uppercase tracking-widest font-bold text-blue-600 dark:text-blue-300">
                            {item.operatorName || 'FlynGo Chauffeur'}
                          </span>
                        </div>

                        <h3 className="font-display text-lg font-semibold text-on-surface leading-snug line-clamp-2">
                          {item.title}
                        </h3>

                        <div className="flex items-center gap-4 text-xs text-muted mt-2">
                          {item.duration ? (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-muted" />
                              <span>{item.duration}</span>
                            </div>
                          ) : null}
                          {item.availableSeats != null && item.availableSeats > 0 ? (
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-muted" />
                              <span>
                                {item.availableSeats} {item.totalSeats ? `/ ${item.totalSeats}` : ''} seats
                              </span>
                            </div>
                          ) : null}
                        </div>

                        {item.amenities && item.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {item.amenities.slice(0, 2).map((a, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container border border-outline-variant text-on-surface-variant truncate max-w-[130px]"
                              >
                                {a}
                              </span>
                            ))}
                            {item.amenities.length > 2 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-container border border-outline-variant text-on-surface-variant">
                                +{item.amenities.length - 2}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="mt-auto pt-4 flex flex-col gap-3">
                          <div>
                            <div className="text-[10px] uppercase tracking-widest font-bold text-muted">Starting from</div>
                            <div className="font-display text-2xl font-bold text-on-surface">
                              {fmt(Number(item.price) || 0, item.currency || 'BDT')}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-0.5">
                            <Link
                              href="/contact"
                              className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold border border-outline-variant text-on-surface hover:bg-surface-container-high transition hover:border-primary/50"
                            >
                              <Eye className="w-3.5 h-3.5 text-muted" />
                              Enquire
                            </Link>
                            <button
                              type="button"
                              onClick={() => bookTransport(item.id)}
                              className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold text-white transition hover:opacity-90 shadow-sm"
                              style={{ background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary) 100%)' }}
                            >
                              Book Now <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 py-12">
        <div className="rounded-2xl border p-8 glass" style={{ borderColor: 'var(--color-outline-variant)' }}>
          <h3 className="font-display text-xl font-semibold text-on-surface mb-3">Why book transport with FlynGo?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <Clock className="w-5 h-5 text-primary mb-2" />
              <div className="font-semibold mb-1">On-time guarantee</div>
              <p className="text-on-surface-variant">Real-time flight tracking and 60-minute complimentary wait time on airport pickups.</p>
            </div>
            <div>
              <Shield className="w-5 h-5 text-primary mb-2" />
              <div className="font-semibold mb-1">Vetted professional drivers</div>
              <p className="text-on-surface-variant">All drivers are licensed, insured, background-checked, and trained in hospitality.</p>
            </div>
            <div>
              <MapPin className="w-5 h-5 text-primary mb-2" />
              <div className="font-semibold mb-1">Global coverage</div>
              <p className="text-on-surface-variant">Reliable private and group transfers available across 200+ cities in 60 countries.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
