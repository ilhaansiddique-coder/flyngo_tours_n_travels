'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';

const flights = [
  { id: '1', airline: 'Emirates', number: 'EK501', origin: 'JFK (New York)', destination: 'DXB (Dubai)', price: 899, seats: 120, status: 'active' },
  { id: '2', airline: 'Qatar Airways', number: 'QR702', origin: 'LHR (London)', destination: 'BKK (Bangkok)', price: 749, seats: 85, status: 'active' },
  { id: '3', airline: 'Singapore Airlines', number: 'SQ424', origin: 'SFO (San Francisco)', destination: 'SIN (Singapore)', price: 1099, seats: 45, status: 'active' },
  { id: '4', airline: 'Japan Airlines', number: 'JL5', origin: 'LAX (Los Angeles)', destination: 'NRT (Tokyo)', price: 849, seats: 150, status: 'active' },
  { id: '5', airline: 'Turkish Airlines', number: 'TK81', origin: 'JFK (New York)', destination: 'IST (Istanbul)', price: 679, seats: 200, status: 'inactive' },
];

export default function AdminFlightsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search flights..." className="pl-9 w-64" />
        </div>
        <Button size="md" className="gap-2"><Plus className="w-4 h-4" /> Add Flight</Button>
      </div>

      <Card hover={false} padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                <th className="p-4 font-medium">Airline</th>
                <th className="p-4 font-medium">Flight No.</th>
                <th className="p-4 font-medium">Route</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Seats</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {flights.map((f) => (
                <tr key={f.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="p-4 font-medium">{f.airline}</td>
                  <td className="p-4 font-mono text-xs">{f.number}</td>
                  <td className="p-4 text-gray-500">{f.origin} → {f.destination}</td>
                  <td className="p-4 font-medium">{formatCurrency(f.price)}</td>
                  <td className="p-4">{f.seats}</td>
                  <td className="p-4"><Badge variant={f.status === 'active' ? 'success' : 'warning'}>{f.status}</Badge></td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600"><Pencil className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
