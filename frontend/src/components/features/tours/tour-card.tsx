import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { tourImage } from '@/lib/entity-image';
import Link from 'next/link';
import { Clock, Users, MapPin, Star } from 'lucide-react';

interface TourCardProps {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  maxGuests?: number;
  destination?: { name: string; country: string } | null;
  additionalDestinations?: Array<{ destination?: { name: string; country?: string } }>;
  difficulty?: string;
  imageUrl?: string | null;
  coverImageUrl?: string | null;
}

export function TourCard({ slug, title, price, duration, maxGuests, destination, additionalDestinations, imageUrl, coverImageUrl }: TourCardProps) {
  const destinationBadges = [
    destination?.name ? { name: destination.name, label: destination.country && destination.country !== destination.name ? `${destination.name}, ${destination.country}` : destination.name } : null,
    ...(additionalDestinations || []).map((a) => {
      const d = a && 'destination' in (a as any) ? (a as { destination?: { name: string; country?: string } }).destination : (a as { name: string; country?: string });
      return d && d.name ? { name: d.name, label: d.country && d.country !== d.name ? `${d.name}, ${d.country}` : d.name } : null;
    }),
  ].filter((b): b is { name: string; label: string } => !!b);

  return (
    <Card className="group overflow-hidden flex flex-col" hover={false} premium>
      <div className="relative h-60 overflow-hidden rounded-t-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-tertiary" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tourImage({ coverImageUrl, imageUrl, destination, title })}
          alt={title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="absolute bottom-4 left-4 right-4 z-20">
          <h3 className="text-xl font-bold text-white leading-tight tracking-tight">{title}</h3>
        </div>
      </div>

      <div className="px-5 py-4 flex flex-col flex-1">
        {destinationBadges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {destinationBadges.map((b, i) => (
              <span
                key={`${b.name}-${i}`}
                className="inline-flex items-center gap-1 rounded-full border border-outline-variant bg-surface-container px-2.5 py-1 text-[11px] font-medium text-on-surface"
              >
                <MapPin className="w-3 h-3 text-accent" />
                {b.label}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
            <Clock className="w-4 h-4 text-accent" />
            <span>{duration} Days</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
            <Users className="w-4 h-4 text-accent" />
            <span>{maxGuests ?? '—'} Guests</span>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
          ))}
          <span className="text-xs text-on-surface-variant ml-1">(4.0)</span>
        </div>

        <div className="mt-auto pt-3 border-t border-outline-variant/40 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">From</p>
            <p className="text-2xl font-bold text-accent leading-none mt-0.5">{formatCurrency(price)}</p>
          </div>
          <Link
            href={`/tours/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white rounded-full px-5 py-2.5 transition-all duration-300 hover:shadow-lg hover:shadow-accent/20"
            style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))' }}
          >
            Book Now
          </Link>
        </div>
      </div>
    </Card>
  );
}
