'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Section, Container } from '@/components/ui/section';
import { Clock, ArrowRight, Tag } from 'lucide-react';

interface Deal {
  destination: string;
  discount: string;
  originalPrice: number;
  discountedPrice: number;
  slug: string;
  label: string;
}

const deals: Deal[] = [
  { destination: 'Bali, Indonesia', discount: '40% OFF', originalPrice: 1299, discountedPrice: 779, slug: 'bali-special', label: 'Hot Deal' },
  { destination: 'Dubai, UAE', discount: '35% OFF', originalPrice: 999, discountedPrice: 649, slug: 'dubai-special', label: 'Limited' },
  { destination: 'Maldives', discount: '30% OFF', originalPrice: 2499, discountedPrice: 1749, slug: 'maldives-special', label: 'Popular' },
];

export function DealsBanner() {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else if (minutes > 0) { minutes--; seconds = 59; }
        else if (hours > 0) { hours--; minutes = 59; seconds = 59; }
        else return { hours: 23, minutes: 59, seconds: 59 };
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Section background="white">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-violet-950 to-slate-900 p-8 sm:p-12">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />

          <div className="relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-400 font-semibold text-sm uppercase tracking-wider">Limited Time Offers</span>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
                  Exclusive Travel Deals
                </h2>
                <p className="text-gray-400 mt-1">Book now and save big on your dream vacation</p>
              </div>

              {/* Countdown */}
              <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-5 py-3 border border-white/10 backdrop-blur-sm">
                <Clock className="w-5 h-5 text-amber-400" />
                <div className="flex items-center gap-1">
                  {[
                    { value: timeLeft.hours, label: 'h' },
                    { value: timeLeft.minutes, label: 'm' },
                    { value: timeLeft.seconds, label: 's' },
                  ].map((unit, i) => (
                    <span key={unit.label} className="flex items-center gap-1">
                      <span className="font-mono text-xl font-bold text-white tabular-nums">
                        {String(unit.value).padStart(2, '0')}
                      </span>
                      <span className="text-gray-500 text-sm">{unit.label}</span>
                      {i < 2 && <span className="text-gray-600 mx-1">:</span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Deal cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {deals.map((deal) => (
                <Link
                  key={deal.slug}
                  href={`/tours/${deal.slug}`}
                  className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold">
                    {deal.label}
                  </span>
                  <p className="text-3xl font-bold text-amber-400 mb-2">{deal.discount}</p>
                  <h3 className="font-display text-xl font-bold text-white mb-1">{deal.destination}</h3>
                  <div className="flex items-baseline gap-2 mt-3">
                    <span className="text-2xl font-bold text-white">${deal.discountedPrice}</span>
                    <span className="text-sm text-gray-500 line-through">${deal.originalPrice}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-4 text-sm text-gray-400 group-hover:text-white transition-colors">
                    Book Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
