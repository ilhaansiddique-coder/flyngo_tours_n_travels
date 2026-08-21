'use client';

import Link from 'next/link';
import { useApi } from '@/hooks/use-api';
import { useLocale } from '@/contexts/locale-context';
import { MapPin, Clock, ArrowRight, Heart, Sparkles } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { formatCurrency } from '@/lib/utils';
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
          action={{ label: 'View all packages', href: '/booking' }}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl glass border border-hairline overflow-hidden animate-pulse">
              <div className="h-56 bg-on-surface-soft" />
              <div className="p-6 space-y-3">
                <div className="h-5 w-3/4 rounded bg-on-surface-soft" />
                <div className="h-3 w-1/2 rounded bg-on-surface-soft" />
                <div className="h-3 w-full rounded bg-on-surface-soft" />
                <div className="h-8 w-1/3 rounded bg-on-surface-soft mt-4" />
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
        action={{ label: 'View all packages', href: '/booking' }}
      />

      <div className="flex items-center gap-3 mb-8 text-sm text-muted">
        <Sparkles className="w-4 h-4 text-accent" />
        <span>
          <span className="text-on-bg font-semibold">{tours.length} featured</span> · Updated weekly by our travel curators
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tours.map((tour) => {
          const price = num(tour.price);
          const salePrice = tour.salePrice != null ? num(tour.salePrice) : null;
          const hasSale = salePrice != null && salePrice > 0 && salePrice < price;
          const currency = tour.currency || 'USD';
          const image = tour.coverImageUrl || tour.images?.[0]?.url;
          const highlights = (tour.highlights?.length ? tour.highlights : [tour.description]).filter(Boolean);
          return (
            <Link
              key={tour.id}
              href={`/tours/${tour.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl glass border border-hairline-strong hover:border-accent-soft card-elevated transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="relative h-56 overflow-hidden bg-gradient-to-br from-primary to-tertiary">
                {image ? (
                  <img
                    src={image}
                    alt={tour.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 bg-grid opacity-40" />
                )}
                <div className="absolute inset-0 scrim-soft" />
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] tracking-widest uppercase font-bold border backdrop-blur-md ${'text-blue-700 bg-blue-500/10 border-blue-500/30 dark:text-blue-300 dark:border-blue-400/20'}`}>
                    {isBn ? 'ট্যুর' : 'Tour'}
                  </span>
                  {hasSale && (
                    <span
                      className="px-3 py-1 rounded-full text-[10px] tracking-widest uppercase font-bold shadow-lg"
                      style={{
                        backgroundColor: 'var(--color-accent)',
                        color: 'var(--color-on-primary)',
                        boxShadow: '0 12px 28px -8px var(--accent-glow-strong)',
                      }}
                    >
                      {isBn ? 'অফার' : 'Deal'}
                    </span>
                  )}
                </div>
                <button
                  className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: 'color-mix(in oklab, var(--color-background) 40%, transparent)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid color-mix(in oklab, var(--color-on-background) 15%, transparent)',
                    color: 'var(--color-on-background)',
                  }}
                  aria-label="Save"
                  onClick={(e) => e.preventDefault()}
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-display text-xl font-semibold text-on-bg mb-2 line-clamp-1 group-hover:text-accent transition-colors">
                  {tour.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted mb-4">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  <span className="line-clamp-1">
                    {tour.destination ? `${tour.destination.name}${tour.destination.country ? `, ${tour.destination.country}` : ''}` : 'Worldwide'}
                  </span>
                </div>

                <ul className="space-y-1.5 mb-5 text-sm text-muted">
                  {highlights.slice(0, 3).map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-accent flex-shrink-0" />
                      <span className="line-clamp-1">{h}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-4 border-t border-hairline flex items-end justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted font-semibold">
                      {t('pkg_from')}
                    </div>
                    <div className="font-display text-2xl font-bold text-on-bg mt-1">
                      <span className="text-accent">{formatCurrency(hasSale ? salePrice! : price, currency)}</span>
                      {hasSale && (
                        <span className="ml-2 text-sm font-medium text-muted line-through">
                          {formatCurrency(price, currency)}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {tour.duration} {isBn ? 'দিন' : 'days'}
                    </div>
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all"
                    style={{
                      backgroundColor: 'color-mix(in oklab, var(--color-on-background) 10%, transparent)',
                      color: 'var(--color-on-background)',
                      border: '1px solid color-mix(in oklab, var(--color-on-background) 15%, transparent)',
                    }}
                  >
                    {t('pkg_details')}
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
