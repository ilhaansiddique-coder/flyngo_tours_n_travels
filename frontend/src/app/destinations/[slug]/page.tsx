'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { TourCard } from '@/components/features/tours/tour-card';
import { ShareMenu } from '@/components/shared/share-menu';
import { destinationImage } from '@/lib/entity-image';
import { ArrowLeft, MapPin, Globe2 } from 'lucide-react';

interface DestinationDetail {
  id: string;
  name: string;
  slug: string;
  country: string;
  continent?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  coverImageUrl?: string | null;
}

export default function DestinationDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const [destination, setDestination] = useState<DestinationDetail | null>(null);
  const [relatedTours, setRelatedTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    api
      .get<DestinationDetail>(`/destinations/${slug}`)
      .then(async (data) => {
        setDestination(data ?? null);
        if (data?.id) {
          // Tours list API does not support destinationId filtering; filter client-side.
          try {
            const res: any = await api.get('/tours?limit=100');
            const items = res?.data ?? res?.items ?? [];
            setRelatedTours(items.filter((t: any) => t.destinationId === data.id));
          } catch {
            setRelatedTours([]);
          }
        }
      })
      .catch((err: any) => setError(err?.message || 'Failed to load destination'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background pt-32 pb-20 px-4 sm:px-6 lg:px-16 max-w-[1200px] mx-auto">
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-on-surface-variant">Loading destination...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background pt-32 pb-20 px-4 sm:px-6 lg:px-16 max-w-[1200px] mx-auto">
        <Link href="/destinations" className="inline-flex items-center gap-2 text-sm mb-6 hover:underline text-accent">
          <ArrowLeft className="w-4 h-4" /> Back to destinations
        </Link>
        <div className="glass-deep rounded-2xl p-10 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </main>
    );
  }

  if (!destination) {
    return (
      <main className="min-h-screen bg-background pt-32 pb-20 px-4 sm:px-6 lg:px-16 max-w-[1200px] mx-auto">
        <Link href="/destinations" className="inline-flex items-center gap-2 text-sm mb-6 hover:underline text-accent">
          <ArrowLeft className="w-4 h-4" /> Back to destinations
        </Link>
        <div className="glass-deep rounded-2xl p-10 text-center">
          <h1 className="text-2xl font-display font-bold text-on-surface mb-2">Destination not found</h1>
          <p className="text-on-surface-variant mb-6">
            The destination you are looking for does not exist or is no longer available.
          </p>
          <Button as="a" href="/destinations" variant="primary">
            Browse all destinations
          </Button>
        </div>
      </main>
    );
  }

  const realGallery = Array.from(
    new Set([destination.coverImageUrl, destination.imageUrl].filter(Boolean) as string[]),
  );
  // Fall back to the SAME deterministic photo the destination showcase card uses
  // so the hero is never an empty gradient and matches the list card.
  const gallery = realGallery.length > 0 ? realGallery : [destinationImage(destination, 1200, 700)];
  const mainImage = gallery[activeImage % Math.max(gallery.length, 1)];

  return (
    <main className="min-h-screen bg-background pt-28 pb-20 px-4 sm:px-6 lg:px-16 max-w-[1200px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <Link
          href="/destinations"
          className="inline-flex items-center gap-2 text-sm hover:underline text-accent"
        >
          <ArrowLeft className="w-4 h-4" /> Back to destinations
        </Link>
        <ShareMenu path={`/destinations/${params.slug}`} title={destination.name} />
      </div>

      {/* Hero image gallery */}
      <div className="relative h-72 sm:h-96 overflow-hidden rounded-2xl mb-3 bg-gradient-to-br from-primary to-tertiary">
        {mainImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mainImage} alt={destination.name} className="w-full h-full object-cover" />
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
              <img src={url} alt={`${destination.name} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-accent/10 border border-accent/30 text-accent">
          <MapPin className="w-3.5 h-3.5" /> {destination.country}
        </span>
        {destination.continent && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-accent/10 border border-accent/30 text-accent">
            <Globe2 className="w-3.5 h-3.5" /> {destination.continent}
          </span>
        )}
      </div>

      <h1 className="text-3xl sm:text-4xl font-display font-bold text-on-surface mb-4">{destination.name}</h1>

      {destination.description && (
        <section className="mb-10">
          <h2 className="text-xl font-display font-semibold text-on-surface mb-3">About this destination</h2>
          <p className="text-on-surface-variant leading-relaxed whitespace-pre-line">{destination.description}</p>
        </section>
      )}

      {relatedTours.length > 0 && (
        <section>
          <h2 className="text-xl font-display font-semibold text-on-surface mb-6">Tours in {destination.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedTours.map((tour) => (
              <TourCard key={tour.id} {...tour} difficulty={tour.difficulty ?? 'easy'} />
            ))}
          </div>
        </section>
      )}

      <aside className="mt-12">
        <div className="glass-deep rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-bold text-on-surface">Ready to explore {destination.name}?</h3>
            <p className="text-sm text-on-surface-variant mt-1">
              Start planning your trip with one of our travel experts.
            </p>
          </div>
          <Button as="a" href={`/contact?subject=${encodeURIComponent(`Travel enquiry — ${destination.name}`)}`} size="lg" className="shrink-0">
            Plan my trip
          </Button>
        </div>
      </aside>
    </main>
  );
}
