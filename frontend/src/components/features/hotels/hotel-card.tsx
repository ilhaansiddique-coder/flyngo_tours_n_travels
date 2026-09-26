'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { hotelImage } from '@/lib/entity-image';
import { useFormatCurrency } from '@/lib/utils';
import { useBookingStore } from '@/stores/booking.store';
import { getCountryFlagByName } from '@/lib/world-places';
import { Star, Eye, ArrowRight, Images } from 'lucide-react';

interface HotelCardProps {
  id: string;
  slug: string;
  name: string;
  starRating?: number;
  pricePerNight: number | string;
  currency?: string;
  destination?: { name: string; country?: string; slug?: string } | null;
  additionalDestinations?: Array<{ destination?: { name: string; country?: string; slug?: string } }>;
  amenities?: string[];
  imageUrl?: string | null;
  coverImageUrl?: string | null;
  images?: Array<{ id?: string; url: string; alt?: string | null } | string>;
}

export function HotelCard({
  id,
  slug,
  name,
  starRating = 5,
  pricePerNight,
  currency = 'BDT',
  destination,
  amenities = [],
  imageUrl,
  coverImageUrl,
  images,
}: HotelCardProps) {
  const router = useRouter();
  const setSelectedItem = useBookingStore((s) => s.setSelectedItem);
  const fmt = useFormatCurrency();

  const destinationName = destination?.name;
  const destinationCountry = destination?.country;
  const destinationSlug =
    destination?.slug || (destinationName ? destinationName.toLowerCase().trim().replace(/\s+/g, '-') : '');
  const flag = getCountryFlagByName(destinationCountry || destinationName);

  const bookHotel = (hotelId: string) => {
    setSelectedItem(hotelId);
    router.push(`/booking?type=hotel&id=${hotelId}`);
  };

  return (
    <div
      className="group flex flex-col rounded-2xl border glass overflow-hidden hover:-translate-y-1 transition-all"
      style={{
        borderColor: 'var(--color-outline-variant)',
        boxShadow: '0 8px 24px -12px rgba(7, 86, 184, 0.18)',
      }}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-blue-500/20 to-cyan-500/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hotelImage({ coverImageUrl, imageUrl, destination, name })}
          alt={name}
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
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-amber-900 bg-amber-300/95 shadow">
          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
          {starRating}.0 Star
        </span>
        {images && images.length > 0 && (
          <span className="absolute bottom-2.5 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white bg-black/60 backdrop-blur-xs border border-white/10 shadow">
            <Images className="w-3 h-3 text-accent" />
            {images.length + 1} photos
          </span>
        )}
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
              className="text-[11px] uppercase tracking-widest font-bold text-blue-600 dark:text-blue-300 hover:underline"
            >
              {destinationName}
            </Link>
          ) : (
            <span />
          )}
        </div>

        <h3 className="font-display text-lg font-semibold text-on-surface leading-snug line-clamp-2">
          {name}
        </h3>

        {Array.isArray(amenities) && amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {amenities.slice(0, 3).map((a, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container border border-outline-variant text-on-surface-variant truncate max-w-[130px]"
              >
                {a}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-container border border-outline-variant text-on-surface-variant">
                +{amenities.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto pt-4 flex flex-col gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-muted">Per night</div>
            <div className="font-display text-2xl font-bold text-on-surface">
              {fmt(Number(pricePerNight) || 0, currency)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <Link
              href={`/hotels/${slug || id}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold border border-outline-variant text-on-surface hover:bg-surface-container-high transition hover:border-primary/50"
            >
              <Eye className="w-3.5 h-3.5 text-muted" />
              View
            </Link>
            <button
              type="button"
              onClick={() => bookHotel(id)}
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
