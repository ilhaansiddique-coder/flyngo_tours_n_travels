import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Clock, Users, Star } from 'lucide-react';

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
}

export function TourCard({ slug, title, description, price, duration, maxGuests, destination, difficulty }: TourCardProps) {
  return (
    <Card className="group overflow-hidden flex flex-col">
      <div className="relative h-56 overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-brand-700" />
        <div className="absolute top-4 left-4 z-20">
          <Badge variant="default">{(difficulty || 'easy').charAt(0).toUpperCase() + (difficulty || 'easy').slice(1)}</Badge>
        </div>
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <p className="text-sm text-white/80">
            {destination?.name && destination?.country
              ? `${destination.name}, ${destination.country}`
              : 'Explore destination'}
          </p>
          <h3 className="text-xl font-bold text-white mt-1">{title}</h3>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4 flex-1">{description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {duration} Days</span>
          <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {maxGuests ?? '—'} Guests</span>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
          <div>
            <span className="text-sm text-gray-500">From</span>
            <p className="text-xl font-bold text-brand-600 dark:text-brand-400">{formatCurrency(price)}</p>
          </div>
          <Link href={`/tours/${slug}`} className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline">
            View Details
          </Link>
        </div>
      </div>
    </Card>
  );
}
