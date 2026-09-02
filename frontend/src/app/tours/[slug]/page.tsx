'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { tourImage } from '@/lib/entity-image';
import { Button } from '@/components/ui/button';
import { ReviewsSection } from '@/components/features/reviews/reviews-section';
import { ArrowLeft, Clock, Users, MapPin, Check, X, CalendarDays } from 'lucide-react';

interface TourImage {
  id: string;
  url: string;
  alt?: string | null;
}

interface ItineraryDay {
  id: string;
  day: number;
  title: string;
  description: string;
  activities: string[];
}

interface TourDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  price: number | string;
  salePrice?: number | string | null;
  currency: string;
  duration: number;
  maxGuests: number;
  difficulty?: string | null;
  tourType?: string | null;
  startLocation?: string | null;
  endLocation?: string | null;
  coverImageUrl?: string | null;
  destination?: { id: string; name: string; country: string; slug: string } | null;
  additionalDestinations?: Array<{ destination?: { id?: string; name: string; country?: string } }>;
  images: TourImage[];
  itinerary: ItineraryDay[];
}

export default function TourDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const [tour, setTour] = useState<TourDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    api
      .get<TourDetail>(`/tours/${slug}`)
      .then((data) => setTour(data ?? null))
      .catch((err: any) => setError(err?.message || 'Failed to load tour'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background pt-32 pb-20 px-4 sm:px-6 lg:px-16 max-w-[1200px] mx-auto">
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-on-surface-variant">Loading tour...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background pt-32 pb-20 px-4 sm:px-6 lg:px-16 max-w-[1200px] mx-auto">
        <Link href="/tours" className="inline-flex items-center gap-2 text-sm mb-6 hover:underline text-accent">
          <ArrowLeft className="w-4 h-4" /> Back to tours
        </Link>
        <div className="glass-deep rounded-2xl p-10 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </main>
    );
  }

  if (!tour) {
    return (
      <main className="min-h-screen bg-background pt-32 pb-20 px-4 sm:px-6 lg:px-16 max-w-[1200px] mx-auto">
        <Link href="/tours" className="inline-flex items-center gap-2 text-sm mb-6 hover:underline text-accent">
          <ArrowLeft className="w-4 h-4" /> Back to tours
        </Link>
        <div className="glass-deep rounded-2xl p-10 text-center">
          <h1 className="text-2xl font-display font-bold text-on-surface mb-2">Tour not found</h1>
          <p className="text-on-surface-variant mb-6">
            The tour you are looking for does not exist or is no longer available.
          </p>
          <Button as="a" href="/tours" variant="primary">
            Browse all tours
          </Button>
        </div>
      </main>
    );
  }

  const realGallery = Array.from(
    new Set([tour.coverImageUrl, ...(tour.images ?? []).map((i) => i.url)].filter(Boolean) as string[]),
  );
  // Always have imagery: fall back to the SAME deterministic photo the list card
  // uses when a tour has no uploaded cover/gallery, so the detail hero is never
  // an empty gradient and matches the list card exactly.
  const gallery = realGallery.length > 0 ? realGallery : [tourImage(tour, 1200, 700)];
  const mainImage = gallery[activeImage % Math.max(gallery.length, 1)];
  const price = Number(tour.salePrice ?? tour.price);
  const basePrice = tour.salePrice != null ? Number(tour.price) : null;

  return (
    <main className="min-h-screen bg-background pt-28 pb-20 px-4 sm:px-6 lg:px-16 max-w-[1200px] mx-auto">
      <Link href="/tours" className="inline-flex items-center gap-2 text-sm mb-6 hover:underline text-accent">
        <ArrowLeft className="w-4 h-4" /> Back to tours
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div>
          {/* Hero image gallery */}
          <div className="relative h-72 sm:h-96 overflow-hidden rounded-2xl mb-3 bg-gradient-to-br from-primary to-tertiary">
            {mainImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mainImage} alt={tour.title} className="w-full h-full object-cover" />
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
                  <img src={url} alt={`${tour.title} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-3">
            {tour.destination && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-accent/10 border border-accent/30 text-accent">
                <MapPin className="w-3.5 h-3.5" />
                {tour.destination.name}
                {tour.destination.country ? `, ${tour.destination.country}` : ''}
              </span>
            )}
            {(tour.additionalDestinations || [])
              .map((ad) => ad.destination)
              .filter((d): d is { name: string; country?: string } => !!d?.name)
              .map((d) => (                <span key={d.name} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-accent/10 border border-accent/30 text-accent">
                  <MapPin className="w-3.5 h-3.5" />
                  {d.name}
                </span>
              ))}
            {tour.tourType && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold capitalize bg-accent/10 border border-accent/30 text-accent">
                {tour.tourType}
              </span>
            )}
            {tour.difficulty && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold capitalize bg-accent/10 border border-accent/30 text-accent">
                {tour.difficulty}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-bold text-on-surface mb-4">{tour.title}</h1>

          <div className="flex items-center gap-4 text-sm text-on-surface-variant mb-6">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-accent" /> {tour.duration} Days
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-accent" /> Up to {tour.maxGuests} Guests
            </span>
            {tour.startLocation && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-accent" /> {tour.startLocation}
              </span>
            )}
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-display font-semibold text-on-surface mb-3">About this tour</h2>
            <p className="text-on-surface-variant leading-relaxed whitespace-pre-line">{tour.description}</p>
          </section>

          {tour.highlights?.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-display font-semibold text-on-surface mb-4">Highlights</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {tour.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
                    <span className="text-on-surface text-sm">{h}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(tour.inclusions?.length > 0 || tour.exclusions?.length > 0) && (
            <section className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {tour.inclusions?.length > 0 && (
                <div className="glass-deep rounded-2xl p-6">
                  <h3 className="text-lg font-display font-semibold text-on-surface mb-3">What&apos;s included</h3>
                  <ul className="space-y-2">
                    {tour.inclusions.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
                        <span className="text-on-surface-variant text-sm">{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {tour.exclusions?.length > 0 && (
                <div className="glass-deep rounded-2xl p-6">
                  <h3 className="text-lg font-display font-semibold text-on-surface mb-3">Not included</h3>
                  <ul className="space-y-2">
                    {tour.exclusions.map((exc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <X className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                        <span className="text-on-surface-variant text-sm">{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {tour.itinerary?.length > 0 && (
            <section>
              <h2 className="text-xl font-display font-semibold text-on-surface mb-6 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-accent" /> Day-by-day itinerary
              </h2>
              <ol className="relative border-l border-hairline ml-3 space-y-8">
                {tour.itinerary.map((day) => (
                  <li key={day.id} className="pl-8 relative">
                    <span
                      className="absolute -left-[15px] top-0 w-7 h-7 rounded-full inline-flex items-center justify-center shrink-0 text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary) 100%)' }}
                    >
                      {day.day}
                    </span>
                    <h3 className="font-display font-semibold text-on-surface mb-1">Day {day.day}: {day.title}</h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed mb-2">{day.description}</p>
                    {day.activities?.length > 0 && (
                      <ul className="flex flex-wrap gap-2">
                        {day.activities.map((a, i) => (
                          <li
                            key={i}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-accent/10 border border-accent/30 text-accent"
                          >
                            {a}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 self-start">
          <div className="glass-deep rounded-2xl p-6">
            <div className="text-[10px] uppercase tracking-widest font-bold text-muted">From</div>
            <div className="flex items-baseline gap-2 my-1">
              <span className="text-3xl font-display font-bold text-accent">{formatCurrency(price, tour.currency)}</span>
              {basePrice != null && (
                <span className="text-sm line-through text-on-surface-variant">{formatCurrency(basePrice, tour.currency)}</span>
              )}
            </div>
            <div className="text-xs text-muted">per person</div>

            <div className="mt-4 pt-4 border-t border-hairline space-y-3">
              <div className="flex items-center gap-2 text-sm text-on-surface">
                <Clock className="w-4 h-4 text-accent" />
                <span>{tour.duration} days</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-on-surface">
                <Users className="w-4 h-4 text-accent" />
                <span>Max {tour.maxGuests} guests</span>
              </div>
            </div>

            <Button as="a" href={`/booking?type=tour&id=${tour.id}`} size="lg" className="mt-6 w-full">
              Book Now
            </Button>
          </div>
        </aside>
      </div>

      <ReviewsSection itemType="tour" itemId={tour.id} />
    </main>
  );
}
