import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { tourImage } from '@/lib/entity-image';
import Link from 'next/link';
import { Clock, Users } from 'lucide-react';

interface TourCardProps {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  maxGuests?: number;
  destination?: { name: string; country: string };
  difficulty?: string;
  imageUrl?: string;
  coverImageUrl?: string;
}

export function TourCard({ slug, title, description, price, duration, maxGuests, destination, difficulty, imageUrl, coverImageUrl }: TourCardProps) {
  return (
    <Card className="group overflow-hidden flex flex-col" hover={false}>
      <div className="relative h-56 overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-tertiary" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tourImage({ coverImageUrl, imageUrl, destination, title })}
          alt={title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 scrim-soft z-10" />
        <div className="absolute top-4 left-4 z-20">
          <Badge variant="cyan">{(difficulty || 'easy').charAt(0).toUpperCase() + (difficulty || 'easy').slice(1)}</Badge>
        </div>
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <p className="text-sm text-on-bg/85">
            {destination?.name && destination?.country
              ? `${destination.name}, ${destination.country}`
              : 'Explore destination'}
          </p>
          <h3 className="text-xl font-bold text-on-bg mt-1">{title}</h3>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <p className="text-on-surface-variant text-sm line-clamp-2 mb-4 flex-1">{description}</p>
        <div className="flex items-center gap-4 text-sm text-on-surface-variant mb-4">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-accent" /> {duration} Days</span>
          <span className="flex items-center gap-1"><Users className="w-4 h-4 text-accent" /> {maxGuests ?? '—'} Guests</span>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-hairline">
          <div>
            <span className="text-sm text-on-surface-variant">From</span>
            <p className="text-xl font-bold text-accent">{formatCurrency(price)}</p>
          </div>
          <Link href={`/tours/${slug}`} className="text-sm font-semibold text-accent hover:underline">
            View Details
          </Link>
        </div>
      </div>
    </Card>
  );
}
