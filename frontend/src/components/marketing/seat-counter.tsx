'use client';

import { useEffect, useState } from 'react';
import { Users, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

interface Availability {
  totalSeats: number;
  seatsBooked: number;
  seatsRemaining: number;
  isSoldOut: boolean;
  isLowStock: boolean;
  departureDate?: string | null;
  returnDate?: string | null;
  departureCities?: string[];
  depositAmount?: number;
  visaAmount?: number;
  finalAmount?: number;
  currency?: string;
}

export function SeatCounter({ packageId, slug, currency = 'USD' }: { packageId?: string; slug?: string; currency?: string }) {
  const [data, setData] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!packageId) return;
    let mounted = true;
    (async () => {
      try {
        const res = (await api.get(`/hajj-packages/${packageId}/availability`)) as Availability;
        if (mounted) setData(res);
      } catch {
        // Fallback: try umrah-packages if not hajj
        if (slug) {
          try {
            const r2 = (await api.get(`/umrah-packages`)) as any;
            const found = (r2?.items ?? []).find((p: any) => p.slug === slug);
            if (found && mounted) {
              setData({
                totalSeats: found.totalSeats ?? 0,
                seatsBooked: found.seatsBooked ?? 0,
                seatsRemaining: Math.max(0, (found.totalSeats ?? 0) - (found.seatsBooked ?? 0)),
                isSoldOut: found.totalSeats > 0 && (found.totalSeats - found.seatsBooked) <= 0,
                isLowStock: (found.totalSeats - found.seatsBooked) > 0 && (found.totalSeats - found.seatsBooked) <= 10,
                departureDate: found.departureDate,
                returnDate: found.returnDate,
                departureCities: found.departureCities ?? [],
                depositAmount: Number(found.depositAmount ?? 0),
                visaAmount: Number(found.visaAmount ?? 0),
                finalAmount: Number(found.finalAmount ?? 0),
                currency: found.currency ?? currency,
              });
            }
          } catch { /* ignore */ }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [packageId, slug, currency]);

  if (loading) return null;
  if (!data) return null;
  if (data.totalSeats === 0) return null; // package not configured for seat tracking

  if (data.isSoldOut) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-sm">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span className="font-bold">Sold out</span>
        <span className="text-rose-600/80">— join the waitlist and we'll notify you when seats reopen.</span>
      </div>
    );
  }

  const colorClass = data.isLowStock
    ? 'bg-amber-500/10 border-amber-500/30 text-amber-700'
    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700';

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${colorClass}`}>
      <div className="w-10 h-10 rounded-full bg-current/10 flex items-center justify-center">
        <Users className="w-5 h-5" />
      </div>
      <div>
        <p className="font-bold leading-tight">
          {data.isLowStock && 'Only '}
          {data.seatsRemaining} {data.seatsRemaining === 1 ? 'seat' : 'seats'} left
        </p>
        <p className="text-xs opacity-80">
          {data.seatsBooked}/{data.totalSeats} booked · {data.isLowStock ? 'Selling fast!' : 'Reserve yours now'}
        </p>
      </div>
    </div>
  );
}
