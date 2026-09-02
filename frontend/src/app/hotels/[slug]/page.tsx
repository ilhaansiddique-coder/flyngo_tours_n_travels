'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { hotelImage } from '@/lib/entity-image';
import { Button } from '@/components/ui/button';
import { ReviewsSection } from '@/components/features/reviews/reviews-section';
import { ArrowLeft, MapPin, Star, Clock, Sparkles } from 'lucide-react';

interface HotelImage {
  id: string;
  url: string;
  alt?: string | null;
}

interface HotelDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  starRating: number;
  address?: string | null;
  pricePerNight: number | string;
  currency: string;
  amenities: string[];
  checkInTime?: string | null;
  checkOutTime?: string | null;
  coverImageUrl?: string | null;
  destination?: { id: string; name: string; country: string; slug: string } | null;
  images: HotelImage[];
}

export default function HotelDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    api
      .get<HotelDetail>(`/hotels/${slug}`)
      .then((data) => setHotel(data ?? null))
      .catch((err: any) => setError(err?.message || 'Failed to load hotel'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background pt-32 pb-20 px-4 sm:px-6 lg:px-16 max-w-[1200px] mx-auto">
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-on-surface-variant">Loading hotel...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background pt-32 pb-20 px-4 sm:px-6 lg:px-16 max-w-[1200px] mx-auto">
        <Link href="/hotels" className="inline-flex items-center gap-2 text-sm mb-6 hover:underline text-accent">
          <ArrowLeft className="w-4 h-4" /> Back to hotels
        </Link>
        <div className="glass-deep rounded-2xl p-10 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </main>
    );
  }

  if (!hotel) {
    return (
      <main className="min-h-screen bg-background pt-32 pb-20 px-4 sm:px-6 lg:px-16 max-w-[1200px] mx-auto">
        <Link href="/hotels" className="inline-flex items-center gap-2 text-sm mb-6 hover:underline text-accent">
          <ArrowLeft className="w-4 h-4" /> Back to hotels
        </Link>
        <div className="glass-deep rounded-2xl p-10 text-center">
          <h1 className="text-2xl font-display font-bold text-on-surface mb-2">Hotel not found</h1>
          <p className="text-on-surface-variant mb-6">
            The hotel you are looking for does not exist or is no longer available.
          </p>
          <Button as="a" href="/hotels" variant="primary">
            Browse all hotels
          </Button>
        </div>
      </main>
    );
  }

  const realGallery = Array.from(
    new Set([hotel.coverImageUrl, ...(hotel.images ?? []).map((i) => i.url)].filter(Boolean) as string[]),
  );
  // Fall back to the SAME deterministic photo the list card uses so the hero is
  // never an empty gradient and matches the hotel's list card.
  const gallery = realGallery.length > 0 ? realGallery : [hotelImage(hotel, 1200, 700)];
  const mainImage = gallery[activeImage % Math.max(gallery.length, 1)];

  return (
    <main className="min-h-screen bg-background pt-28 pb-20 px-4 sm:px-6 lg:px-16 max-w-[1200px] mx-auto">
      <Link href="/hotels" className="inline-flex items-center gap-2 text-sm mb-6 hover:underline text-accent">
        <ArrowLeft className="w-4 h-4" /> Back to hotels
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div>
          {/* Hero image gallery */}
          <div className="relative h-72 sm:h-96 overflow-hidden rounded-2xl mb-3 bg-gradient-to-br from-primary to-tertiary">
            {mainImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mainImage} alt={hotel.name} className="w-full h-full object-cover" />
            )}
          </div>
          {gallery.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1 mb-8">
              {gallery.map((url, i) => (
                <button
                  key={url}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-24 h-16 shrink-0 overflow-hidden rounded-lg border transition-all ${
                    i === activeImage ? 'border-accent ring-2 ring-accent/40' : 'border-hairline opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`View image ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`${hotel.name} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${i < hotel.starRating ? 'text-amber-400 fill-amber-400' : 'text-on-surface-variant/30'}`}
              />
            ))}
            <span className="ml-2 text-sm font-semibold text-on-surface">{hotel.starRating}-star hotel</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-bold text-on-surface mb-4">{hotel.name}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-on-surface-variant mb-6">
            {(hotel.address || hotel.destination) && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-accent" />
                {[hotel.address, hotel.destination?.name, hotel.destination?.country].filter(Boolean).join(', ')}
              </span>
            )}
            {hotel.checkInTime && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-accent" /> Check-in {hotel.checkInTime}
              </span>
            )}
            {hotel.checkOutTime && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-accent" /> Check-out {hotel.checkOutTime}
              </span>
            )}
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-display font-semibold text-on-surface mb-3">About this hotel</h2>
            <p className="text-on-surface-variant leading-relaxed whitespace-pre-line">{hotel.description}</p>
          </section>

          {hotel.amenities?.length > 0 && (
            <section>
              <h2 className="text-xl font-display font-semibold text-on-surface mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" /> Amenities
              </h2>
              <div className="flex flex-wrap gap-2">
                {hotel.amenities.map((a, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full text-sm font-medium capitalize bg-accent/10 border border-accent/30 text-accent"
                  >
                    {a.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 self-start">
          <div className="glass-deep rounded-2xl p-6">
            <div className="text-[10px] uppercase tracking-widest font-bold text-muted">From</div>
            <div className="text-3xl font-display font-bold text-accent my-1">
              {formatCurrency(Number(hotel.pricePerNight), hotel.currency)}
            </div>
            <div className="text-xs text-muted">per night, taxes may apply</div>

            <div className="mt-4 pt-4 border-t border-hairline space-y-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < hotel.starRating ? 'text-amber-400 fill-amber-400' : 'text-on-surface-variant/30'}`}
                  />
                ))}
              </div>
              {hotel.checkInTime && (
                <div className="flex items-center gap-2 text-sm text-on-surface">
                  <Clock className="w-4 h-4 text-accent" />
                  <span>Check-in from {hotel.checkInTime}</span>
                </div>
              )}
            </div>

            <Button as="a" href={`/booking?type=hotel&id=${hotel.id}`} size="lg" className="mt-6 w-full">
              Book Now
            </Button>
          </div>
        </aside>
      </div>

      <ReviewsSection itemType="hotel" itemId={hotel.id} />
    </main>
  );
}
