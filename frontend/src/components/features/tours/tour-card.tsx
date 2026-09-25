'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, Users, Eye, ArrowRight, Coins } from 'lucide-react';
import { tourImage } from '@/lib/entity-image';
import { useFormatCurrency } from '@/lib/utils';
import { useBookingStore } from '@/stores/booking.store';
import { useLocale } from '@/contexts/locale-context';
import { getCountryFlagByName } from '@/lib/world-places';

export interface TourCardProps {
  id: string;
  slug: string;
  title: string;
  titleBn?: string;
  description?: string;
  descriptionBn?: string;
  price: number | string;
  currency?: string;
  duration: number;
  maxGuests?: number;
  destination?: { id?: string; name: string; country?: string; slug?: string } | null;
  additionalDestinations?: Array<{ destination?: { id?: string; name: string; country?: string; slug?: string } }>;
  difficulty?: string | null;
  imageUrl?: string | null;
  coverImageUrl?: string | null;
  pointsAwarded?: number;
  highlights?: string[];
  highlightsBn?: string[];
}

export function TourCard({
  id,
  slug,
  title,
  titleBn,
  price,
  currency = 'BDT',
  duration,
  maxGuests,
  destination,
  imageUrl,
  coverImageUrl,
  pointsAwarded,
  highlights,
  highlightsBn,
  difficulty,
}: TourCardProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const isBn = locale === 'bn';
  const setSelectedItem = useBookingStore((s) => s.setSelectedItem);
  const fmt = useFormatCurrency();

  const displayTitle = isBn ? titleBn || title : title;
  const destinationName = destination?.name;
  const destinationCountry = destination?.country;
  const destinationSlug =
    destination?.slug || (destinationName ? destinationName.toLowerCase().trim().replace(/\s+/g, '-') : '');
  const flag = getCountryFlagByName(destinationCountry || destinationName);

  const displayHighlights = isBn && highlightsBn && highlightsBn.length > 0 ? highlightsBn : highlights;

  const bookTour = (tourId: string) => {
    setSelectedItem(tourId);
    router.push(`/booking?type=tour&id=${tourId}`);
  };

  return (
    <div
      className="group flex flex-col rounded-2xl border glass overflow-hidden hover:-translate-y-1 transition-all"
      style={{
        borderColor: 'var(--color-outline-variant)',
        boxShadow: '0 8px 24px -12px rgba(245, 158, 11, 0.18)',
      }}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-amber-500/20 to-orange-500/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tourImage({ coverImageUrl, imageUrl, destination, title })}
          alt={destinationName ? `${destinationName} tour` : title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
        {flag ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={flag}
            alt=""
            className="absolute top-3 left-3 h-6 w-9 object-cover rounded shadow ring-1 ring-white/50"
          />
        ) : null}
        {pointsAwarded ? (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold text-amber-900 bg-amber-300/95 shadow">
            <Coins className="w-3.5 h-3.5" /> +{pointsAwarded.toLocaleString()} pts
          </span>
        ) : null}
        {destinationName ? (
          <span className="absolute bottom-2.5 left-3 right-3 truncate text-white font-display font-bold text-lg drop-shadow">
            {destinationName}
          </span>
        ) : null}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 mb-1">
          {destinationName ? (
            <Link
              href={destinationSlug ? `/destinations/${destinationSlug}` : '/destinations'}
              className="text-[11px] uppercase tracking-widest font-bold text-amber-600 dark:text-amber-400 hover:underline"
            >
              {destinationName}
            </Link>
          ) : (
            <span />
          )}
          {difficulty ? (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant">
              {difficulty}
            </span>
          ) : null}
        </div>

        <h3 className="font-display text-lg font-semibold text-on-surface leading-snug line-clamp-2">
          {displayTitle}
        </h3>

        <div className="flex items-center gap-4 text-xs text-muted mt-2">
          {duration ? (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muted" />
              <span>
                {duration} {duration === 1 ? 'Day' : 'Days'}
              </span>
            </div>
          ) : null}
          {maxGuests != null && maxGuests > 0 ? (
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-muted" />
              <span>Up to {maxGuests} guests</span>
            </div>
          ) : null}
        </div>

        {Array.isArray(displayHighlights) && displayHighlights.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {displayHighlights.slice(0, 2).map((h, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container border border-outline-variant text-on-surface-variant truncate max-w-[130px]"
              >
                {h}
              </span>
            ))}
            {displayHighlights.length > 2 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-container border border-outline-variant text-on-surface-variant">
                +{displayHighlights.length - 2}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto pt-4 flex flex-col gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-muted">Starting from</div>
            <div className="font-display text-2xl font-bold text-on-surface">{fmt(Number(price) || 0, currency)}</div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <Link
              href={`/tours/${slug || id}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold border border-outline-variant text-on-surface hover:bg-surface-container-high transition hover:border-primary/50"
            >
              <Eye className="w-3.5 h-3.5 text-muted" />
              View
            </Link>
            <button
              type="button"
              onClick={() => bookTour(id)}
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
}
