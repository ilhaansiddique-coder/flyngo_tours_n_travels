import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { hotelImage } from '@/lib/entity-image';
import Link from 'next/link';
import { Star, MapPin, ArrowRight } from 'lucide-react';

interface HotelCardProps {
  id: string;
  slug: string;
  name: string;
  starRating?: number;
  pricePerNight: number;
  destination?: { name: string; country: string };
  amenities?: string[];
  imageUrl?: string;
  coverImageUrl?: string;
}

export function HotelCard({ slug, name, starRating, pricePerNight, destination, amenities, imageUrl, coverImageUrl }: HotelCardProps) {
  return (
    <Card className="group overflow-hidden flex flex-col" hover={false} premium>
      <div className="relative h-56 overflow-hidden rounded-t-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-tertiary" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hotelImage({ coverImageUrl, imageUrl, destination, name })}
          alt={name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 card-image-overlay z-10" />
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center gap-0.5 bg-background/40 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20 shadow-lg">
            {Array.from({ length: starRating || 0 }).map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400 star-glow" />
            ))}
            <span className="ml-1 text-xs font-bold text-on-bg">{starRating}★</span>
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <p className="text-xs font-semibold uppercase tracking-wider text-on-bg/70 flex items-center gap-1 mb-1">
            <MapPin className="w-3 h-3" /> {destination?.name && destination?.country ? `${destination.name}, ${destination.country}` : 'View location'}
          </p>
          <h3 className="text-xl font-bold text-on-bg leading-tight group-hover:text-accent transition-colors duration-300">{name}</h3>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex flex-wrap gap-1.5 mb-4">
          {amenities?.slice(0, 3).map((amenity) => (
            <span key={amenity} className="amenity-pill">
              {amenity}
            </span>
          ))}
          {amenities && amenities.length > 3 && (
            <span className="text-xs text-on-surface-variant self-center ml-1">+{amenities.length - 3}</span>
          )}
        </div>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/50">
          <div className="price-tag">
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold block">Per night</span>
            <p className="text-xl font-bold text-accent">{formatCurrency(pricePerNight)}</p>
          </div>
          <Link
            href={`/hotels/${slug}`}
            className="group/cta inline-flex items-center gap-2 text-sm font-bold text-accent hover:text-primary transition-colors cta-glow rounded-full px-4 py-2 border border-accent/20 hover:border-accent/40 hover:bg-accent/5"
          >
            View Details
            <ArrowRight className="w-3.5 h-3.5 group-hover/cta:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
