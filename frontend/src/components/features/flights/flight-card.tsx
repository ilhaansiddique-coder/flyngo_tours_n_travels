'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plane, ArrowRight, Eye, Clock } from 'lucide-react';
import { useFormatCurrency } from '@/lib/utils';
import { useBookingStore } from '@/stores/booking.store';

// Pin the timeZone so the server (SSR) and browser render identical strings and
// avoid React hydration mismatches from differing locale/timezone.
const flightTimeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
});

interface FlightCardProps {
  id: string;
  airline: string;
  flightNumber: string;
  originCode: string;
  originCity?: string | null;
  destinationCode: string;
  destinationCity?: string | null;
  departureTime: string;
  arrivalTime: string;
  duration?: number | null;
  price: number | string;
  currency?: string;
  availableSeats: number;
}

export function FlightCard({
  id,
  airline,
  flightNumber,
  originCode,
  originCity,
  destinationCode,
  destinationCity,
  departureTime,
  arrivalTime,
  duration: durationProp,
  price,
  currency = 'BDT',
  availableSeats,
}: FlightCardProps) {
  const router = useRouter();
  const setSelectedItem = useBookingStore((s) => s.setSelectedItem);
  const fmt = useFormatCurrency();

  const duration =
    durationProp ??
    (() => {
      if (departureTime && arrivalTime) {
        const ms = new Date(arrivalTime).getTime() - new Date(departureTime).getTime();
        return Math.round(ms / (1000 * 60));
      }
      return 0;
    })();

  const hours = Math.floor((duration || 0) / 60);
  const mins = (duration || 0) % 60;

  const bookFlight = (flightId: string) => {
    setSelectedItem(flightId);
    router.push(`/booking?type=flight&id=${flightId}`);
  };

  return (
    <div
      className="group flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 p-5 sm:p-6 rounded-2xl border glass hover:-translate-y-0.5 transition-all"
      style={{
        borderColor: 'var(--color-outline-variant)',
        boxShadow: '0 8px 24px -12px rgba(7, 86, 184, 0.18)',
      }}
    >
      {/* Airline Info */}
      <div className="flex items-center gap-4 min-w-[200px]">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/15 to-cyan-500/15 border border-blue-500/20 flex items-center justify-center shadow-xs flex-shrink-0">
          <Plane className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="font-display font-semibold text-lg text-on-surface leading-tight">{airline}</p>
          <p className="text-xs text-muted font-medium mt-0.5">{flightNumber}</p>
        </div>
      </div>

      {/* Flight Timeline */}
      <div className="flex items-center justify-center gap-4 sm:gap-8 flex-1">
        <div className="text-center min-w-[70px]">
          <p className="text-xl sm:text-2xl font-bold font-display text-on-surface tabular-nums">
            {departureTime ? flightTimeFormatter.format(new Date(departureTime)) : '--:--'}
          </p>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5 truncate max-w-[100px]">
            {originCity || originCode}
          </p>
          <span className="text-[10px] uppercase tracking-wider text-muted font-bold">{originCode}</span>
        </div>

        <div className="flex flex-col items-center min-w-[100px] sm:min-w-[140px] px-2">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-muted">
            <Clock className="w-3 h-3" />
            <span>
              {hours}h {mins}m
            </span>
          </div>
          <div className="w-full h-px my-2 relative bg-outline-variant/60">
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)' }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center">
              <Plane className="w-3 h-3 text-primary rotate-90" />
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Non-stop
          </span>
        </div>

        <div className="text-center min-w-[70px]">
          <p className="text-xl sm:text-2xl font-bold font-display text-on-surface tabular-nums">
            {arrivalTime ? flightTimeFormatter.format(new Date(arrivalTime)) : '--:--'}
          </p>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5 truncate max-w-[100px]">
            {destinationCity || destinationCode}
          </p>
          <span className="text-[10px] uppercase tracking-wider text-muted font-bold">{destinationCode}</span>
        </div>
      </div>

      {/* Pricing & Actions */}
      <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-outline-variant/50">
        <div>
          <div className="text-[10px] uppercase tracking-widest font-bold text-muted">Starting from</div>
          <div className="font-display text-2xl font-bold text-on-surface">
            {fmt(Number(price) || 0, currency)}
          </div>
          {availableSeats < 10 && availableSeats > 0 && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
              Only {availableSeats} seats left
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => bookFlight(id)}
            className="inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition hover:opacity-90 shadow-sm"
            style={{ background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary) 100%)' }}
          >
            Book Now <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
