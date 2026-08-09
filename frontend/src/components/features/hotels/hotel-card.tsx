import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Star, MapPin } from 'lucide-react';

interface HotelCardProps {
  id: string;
  slug: string;
  name: string;
  starRating?: number;
  pricePerNight: number;
  destination?: { name: string; country: string };
  amenities?: string[];
}

export function HotelCard({ slug, name, starRating, pricePerNight, destination, amenities }: HotelCardProps) {
  return (
    <Card className="group overflow-hidden flex flex-col" hover={false}>
      <div className="relative h-56 overflow-hidden rounded-xl">
        <div className="absolute inset-0 scrim-soft z-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-tertiary" />
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute top-4 right-4 z-20 flex gap-0.5">
          {Array.from({ length: starRating || 0 }).map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
          ))}
        </div>
        <div className="absolute bottom-4 left-4 z-20">
            <p className="text-sm text-on-bg/85 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {destination?.name && destination?.country ? `${destination.name}, ${destination.country}` : 'View location'}
            </p>
          <h3 className="text-xl font-bold text-on-bg mt-1">{name}</h3>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex flex-wrap gap-2 mb-4">
          {amenities?.slice(0, 3).map((amenity) => (
            <span key={amenity} className="text-xs px-2 py-1 rounded-full bg-accent-soft border border-accent-soft text-accent">
              {amenity}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-hairline">
          <div>
            <span className="text-sm text-on-surface-variant">Per night</span>
            <p className="text-xl font-bold text-accent">{formatCurrency(pricePerNight)}</p>
          </div>
          <Link href={`/hotels/${slug}`} className="text-sm font-semibold text-accent hover:underline">
            View Details
          </Link>
        </div>
      </div>
    </Card>
  );
}
