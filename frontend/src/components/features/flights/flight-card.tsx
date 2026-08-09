import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Plane } from 'lucide-react';

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
    <Card className="hover:border-brand-300 dark:hover:border-brand-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
            <Plane className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{airline}</p>
            <p className="text-sm text-gray-500">{flightNumber}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {new Date(departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-sm text-gray-500">{originCity || originCode}</p>
          </div>

          <div className="flex flex-col items-center">
            <p className="text-xs text-gray-400">{hours}h {mins}m</p>
            <div className="w-16 h-px bg-gray-300 dark:bg-gray-600 my-1 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Plane className="w-3 h-3 text-gray-400 rotate-90" />
              </div>
            </div>
            <p className="text-xs text-gray-400">Direct</p>
          </div>

          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {new Date(arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-sm text-gray-500">{destinationCity || destinationCode}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {availableSeats < 10 && (
            <Badge variant="warning">{availableSeats} seats left</Badge>
          )}
          <div className="text-right">
            <p className="text-xl font-bold text-brand-600 dark:text-brand-400">{formatCurrency(price)}</p>
            <button className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline mt-1">
              Select
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
