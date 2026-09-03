'use client';

import Link from 'next/link';
import { useApi } from '@/hooks/use-api';
import { useLocale } from '@/contexts/locale-context';
import { MapPin, Clock, Star } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { formatCurrency } from '@/lib/utils';
import { tourImage } from '@/lib/entity-image';
import { useEffect, useState } from 'react';

interface ApiTour {
  id: string;
  title: string;
  slug: string;
  description: string;
  highlights: string[];
  price: number | string;
  salePrice?: number | string | null;
  currency?: string;
  duration: number;
  coverImageUrl?: string | null;
  images?: { url: string; alt?: string | null }[];
  destination?: { name: string; country: string } | null;
  additionalDestinations?: Array<{ destination?: { name: string; country?: string } }>;
}

const num = (v: number | string | null | undefined) => (v == null ? 0 : Number(v));

export function PopularPackages() {
  const { getTours } = useApi();
  const { locale, t } = useLocale();
  const isBn = locale === 'bn';
  const [tours, setTours] = useState<ApiTour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchTours = async () => {
      try {
        const data: any = await getTours({ limit: '6' });
        const items = data.data ?? data ?? [];
        if (!cancelled) setTours(Array.isArray(items) ? items : []);
      } catch {
        if (!cancelled) setTours([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchTours();
    return () => {
      cancelled = true;
    };
  }, [getTours]);

  if (loading) {
    return (
      <section className="px-4 sm:px-6 lg:px-16 max-w-[1600px] mx-auto mb-32">
        <SectionHeading
          eyebrow="Handpicked"
          title={
            <>
              Popular <span className="gradient-text-warm">packages</span>
            </>
          }
          subtitle="Hand-picked journeys — tours, visa bundles, and pilgrimage packages designed around you."
          action={{ label: 'View all packages', href: '/tours' }}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-outline-variant/50 bg-surface-container overflow-hidden animate-pulse">
              <div className="h-60 bg-gradient-to-br from-on-surface-soft/60 to-on-surface-soft/30" />
              <div className="px-5 py-4 space-y-3">
                <div className="h-5 w-3/4 rounded-lg bg-on-surface-soft/60" />
                <div className="h-3 w-1/2 rounded-full bg-on-surface-soft/40" />
                <div className="flex items-end justify-between mt-3 pt-3 border-t border-outline-variant/30">
                  <div className="h-8 w-1/3 rounded-lg bg-on-surface-soft/50" />
                  <div className="h-9 w-24 rounded-full bg-on-surface-soft/40" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (tours.length === 0) return null;

  return (
    <section className="px-4 sm:px-6 lg:px-16 max-w-[1600px] mx-auto mb-32">
      <SectionHeading
        eyebrow="Handpicked"
        title={
          <>
            Popular <span className="gradient-text-warm">packages</span>
          </>
        }
        subtitle="Hand-picked journeys — tours, visa bundles, and pilgrimage packages designed around you."
        action={{ label: 'View all packages', href: '/tours' }}
      />

      <div className="flex items-center gap-3 mb-8 text-sm text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
        <span>
          <span className="text-on-bg font-semibold">{tours.length} featured</span> · Updated weekly by our travel curators
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tours.map((tour) => {
          const price = num(tour.price);
          const salePrice = tour.salePrice != null ? num(tour.salePrice) : null;
          const hasSale = salePrice != null && salePrice > 0 && salePrice < price;
          const currency = tour.currency || 'USD';
          const image = tourImage(tour);
          const highlights = (tour.highlights?.length ? tour.highlights : [tour.description]).filter(Boolean);
          return (
            <Link
              key={tour.id}
              href={`/tours/${tour.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-outline-variant/50 bg-surface-container transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(12,22,40,0.08),0_16px_40px_-6px_rgba(12,22,40,0.12)]"
            >
              <div className="relative h-60 overflow-hidden bg-gradient-to-br from-primary via-primary/80 to-tertiary">
                {image ? (
                  <img
                    src={image}
                    alt={tour.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-grid opacity-40" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {hasSale && (
                  <div className="absolute top-4 left-4 z-20">
                    <span
                      className="px-3 py-1.5 rounded-full text-[10px] tracking-widest uppercase font-bold text-white shadow-lg"
                      style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))' }}
                    >
                      {isBn ? 'অফার' : 'Deal'}
                    </span>
                  </div>
                )}

              </div>

              <div className="px-5 py-4 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-on-bg mb-1.5 line-clamp-1 tracking-tight">
                  {tour.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-3">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  <span className="line-clamp-1">
                    {tour.destination
                      ? `${tour.destination.name}${tour.destination.country && tour.destination.country !== tour.destination.name ? `, ${tour.destination.country}` : ''}${
                          (tour.additionalDestinations || []).length
                            ? ` · ${(tour.additionalDestinations || [])
                                .map((ad) => ad.destination?.name)
                                .filter(Boolean)
                                .join(' · ')}`
                            : ''
                        }`
                      : 'Worldwide'}
                  </span>
                </div>

                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
                  ))}
                  <span className="text-xs text-on-surface-variant ml-1">(4.0)</span>
                </div>

                <div className="mt-auto pt-3 border-t border-outline-variant/40 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">
                      {t('pkg_from')}
                    </p>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <p className="text-2xl font-bold text-accent leading-none">{formatCurrency(hasSale ? salePrice! : price, currency)}</p>
                      {hasSale && (
                        <span className="text-sm font-medium text-on-surface-variant line-through">
                          {formatCurrency(price, currency)}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-on-surface-variant flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {tour.duration} {isBn ? 'দিন' : 'days'}
                    </div>
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-white rounded-full px-5 py-2.5 transition-all duration-300 hover:shadow-lg hover:shadow-accent/20"
                    style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))' }}
                  >
                    {t('pkg_details')}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
