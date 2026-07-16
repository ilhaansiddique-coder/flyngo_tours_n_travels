'use client';

import Link from 'next/link';
import { MapPin, Star, ArrowRight } from 'lucide-react';

interface DestinationCardProps {
  name: string;
  country: string;
  image: string;
  tours: number;
  rating: number;
  slug: string;
  index?: number;
}

export function DestinationCard({ name, country, image, tours, rating, slug, index = 0 }: DestinationCardProps) {
  return (
    <Link
      href={`/destinations/${slug}`}
      className={`group relative block overflow-hidden rounded-3xl aspect-[3/4] sm:aspect-[4/5] animate-scale-in`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Gradient placeholder */}
      <div className={`absolute inset-0 bg-gradient-to-br ${
        ['from-emerald-500 to-teal-700', 'from-amber-500 to-orange-700', 'from-sky-500 to-blue-700', 'from-rose-500 to-pink-700', 'from-violet-500 to-purple-700', 'from-cyan-500 to-blue-700'][index % 6]
      }`} />

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <div className="transform group-hover:-translate-y-2 transition-transform duration-500">
          <div className="flex items-center gap-1 text-white/80 text-sm mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>{country}</span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">
            {name}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm text-white/90 font-medium">{rating}</span>
              <span className="text-sm text-white/50">· {tours} tours</span>
            </div>
            <span className="flex items-center gap-1 text-sm text-white/80 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Explore <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
