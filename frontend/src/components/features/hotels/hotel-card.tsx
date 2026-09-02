import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { hotelImage } from '@/lib/entity-image';
import { DestinationList } from '@/components/features/destination-list';
import Link from 'next/link';
import { Star, MapPin } from 'lucide-react';

interface HotelCardProps {
  id: string;
  slug: string;
  name: string;
  starRating?: number;
  pricePerNight: number;
  destination?: { name: string; country: string };
  additionalDestinations?: Array<{ destination?: { name: string; country?: string } }>;
  amenities?: string[];
  imageUrl?: string;
  coverImageUrl?: string;
}

export function HotelCard({ slug, name, starRating, pricePerNight, destination, additionalDestinations, imageUrl, coverImageUrl }: HotelCardProps) {
  return (
    <Card className="group overflow-hidden flex flex-col" hover={false} premium>
      <div className="relative h-60 overflow-hidden rounded-t-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-tertiary" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hotelImage({ coverImageUrl, imageUrl, destination, name })}
          alt={name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="absolute top-4 left-4 z-20 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1">
          {Array.from({ length: starRating || 0 }).map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
          ))}
        </div>

        <div className="absolute bottom-4 left-4 right-4 z-20">
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin className="w-3.5 h-3.5 text-white/80" />
            <DestinationList
              primary={destination}
              additions={additionalDestinations}
              emptyLabel="View location"
              className="text-xs font-medium text-white/90"
            />
          </div>
          <h3 className="text-xl font-bold text-white leading-tight tracking-tight">{name}</h3>
        </div>
      </div>

      <div className="px-5 py-4 flex flex-col flex-1">
        <div className="flex items-center gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < (starRating || 0) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
          ))}
          <span className="text-xs text-on-surface-variant ml-1">({starRating || 0}.0)</span>
        </div>

        <div className="mt-auto pt-3 border-t border-outline-variant/40 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">Per night</p>
            <p className="text-2xl font-bold text-accent leading-none mt-0.5">{formatCurrency(pricePerNight)}</p>
          </div>
          <Link
            href={`/hotels/${slug}`}
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
