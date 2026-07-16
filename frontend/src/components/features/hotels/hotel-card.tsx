import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Star, MapPin, Wifi, Coffee, Dumbbell } from 'lucide-react';

interface HotelCardProps {
  id: string;
  slug: string;
  name: string;
  starRating: number;
  pricePerNight: number;
  destination: { name: string; country: string };
  amenities: string[];
}

export function HotelCard({ slug, name, starRating, pricePerNight, destination, amenities }: HotelCardProps) {
  return (
    <Card className="group overflow-hidden flex flex-col">
      <div className="relative h-56 overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-700" />
        <div className="absolute top-4 right-4 z-20 flex gap-0.5">
          {Array.from({ length: starRating }).map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <div className="absolute bottom-4 left-4 z-20">
          <p className="text-sm text-white/80 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {destination.name}, {destination.country}
          </p>
          <h3 className="text-xl font-bold text-white mt-1">{name}</h3>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex gap-3 mb-4">
          {amenities?.slice(0, 3).map((amenity) => (
            <span key={amenity} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              {amenity}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
          <div>
            <span className="text-sm text-gray-500">Per night</span>
            <p className="text-xl font-bold text-brand-600 dark:text-brand-400">{formatCurrency(pricePerNight)}</p>
          </div>
          <Link href={`/hotels/${slug}`} className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline">
            View Details
          </Link>
        </div>
      </div>
    </Card>
  );
}
