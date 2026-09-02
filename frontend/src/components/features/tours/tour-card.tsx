import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { tourImage } from '@/lib/entity-image';
import { DestinationList } from '@/components/features/destination-list';
import Link from 'next/link';
import { Clock, Users, ArrowRight } from 'lucide-react';

interface TourCardProps {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  maxGuests?: number;
  destination?: { name: string; country: string };
  additionalDestinations?: Array<{ destination?: { name: string; country?: string } }>;
  difficulty?: string;
  imageUrl?: string;
  coverImageUrl?: string;
}

export function TourCard({ slug, title, description, price, duration, maxGuests, destination, additionalDestinations, difficulty, imageUrl, coverImageUrl }: TourCardProps) {
  return (
    <Card className="group overflow-hidden flex flex-col" hover={false} premium>
      <div className="relative h-56 overflow-hidden rounded-t-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-tertiary" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tourImage({ coverImageUrl, imageUrl, destination, title })}
          alt={title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 card-image-overlay z-10" />
        <div className="absolute top-4 left-4 z-20">
          <Badge variant="cyan" className="backdrop-blur-md shadow-lg">
            {(difficulty || 'easy').charAt(0).toUpperCase() + (difficulty || 'easy').slice(1)}
          </Badge>
        </div>
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <DestinationList
            primary={destination}
            additions={additionalDestinations}
            className="text-xs font-semibold uppercase tracking-wider text-on-bg/70 mb-1"
          />
          <h3 className="text-xl font-bold text-on-bg leading-tight group-hover:text-accent transition-colors duration-300">{title}</h3>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-2 mb-4 flex-1">{description}</p>
        <div className="flex items-center gap-4 text-sm text-on-surface-variant mb-4">
          <span className="flex items-center gap-1.5">
            <span className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-accent" />
            </span>
            {duration} Days
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-accent" />
            </span>
            {maxGuests ?? '—'} Guests
          </span>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-outline-variant/50">
          <div className="price-tag">
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold block">From</span>
            <p className="text-xl font-bold text-accent">{formatCurrency(price)}</p>
          </div>
          <Link
            href={`/tours/${slug}`}
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
