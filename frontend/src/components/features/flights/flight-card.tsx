import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Plane } from 'lucide-react';

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
  originCity?: string;
  destinationCode: string;
  destinationCity?: string;
  departureTime: string;
  arrivalTime: string;
  duration?: number;
  price: number;
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
  availableSeats,
}: FlightCardProps) {
  const duration = durationProp ?? (() => {
    if (departureTime && arrivalTime) {
      const ms = new Date(arrivalTime).getTime() - new Date(departureTime).getTime();
      return Math.round(ms / (1000 * 60));
    }
    return 0;
  })();

  const hours = Math.floor((duration || 0) / 60);
  const mins = (duration || 0) % 60;

  return (
    <Card hover={false}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-accent-soft border border-accent-soft flex items-center justify-center">
            <Plane className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="font-semibold text-on-surface">{airline}</p>
            <p className="text-sm text-on-surface-variant">{flightNumber}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-lg font-bold text-on-surface">
              {flightTimeFormatter.format(new Date(departureTime))}
            </p>
            <p className="text-sm text-on-surface-variant">{originCity || originCode}</p>
          </div>

          <div className="flex flex-col items-center">
            <p className="text-xs text-on-surface-variant">{hours}h {mins}m</p>
            <div
              className="w-16 h-px my-1 relative"
              style={{ background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)' }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Plane className="w-3 h-3 text-accent rotate-90" />
              </div>
            </div>
            <p className="text-xs text-on-surface-variant">Direct</p>
          </div>

          <div className="text-center">
            <p className="text-lg font-bold text-on-surface">
              {flightTimeFormatter.format(new Date(arrivalTime))}
            </p>
            <p className="text-sm text-on-surface-variant">{destinationCity || destinationCode}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {availableSeats < 10 && (
            <Badge variant="warning">{availableSeats} seats left</Badge>
          )}
          <div className="text-right">
            <p className="text-xl font-bold text-accent">{formatCurrency(price)}</p>
            <Link
              href={`/booking?type=flight&id=${id}`}
              className="inline-block text-sm font-semibold text-accent hover:underline mt-1"
            >
              Book now
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
