'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Search, Plus, Pencil, Trash2, Star } from 'lucide-react';

const hotels = [
  { id: '1', name: 'Bali Beach Resort & Spa', destination: 'Bali, Indonesia', price: 299, rating: 5, bookings: 38, status: 'active' },
  { id: '2', name: 'Dubai Marina Luxury Hotel', destination: 'Dubai, UAE', price: 499, rating: 5, bookings: 24, status: 'active' },
  { id: '3', name: 'Paris Boutique Hotel Le Marais', destination: 'Paris, France', price: 249, rating: 4, bookings: 31, status: 'active' },
  { id: '4', name: 'Maldives Overwater Villa Resort', destination: 'Maldives', price: 899, rating: 5, bookings: 15, status: 'active' },
  { id: '5', name: 'Tokyo Shinjuku Business Hotel', destination: 'Tokyo, Japan', price: 149, rating: 3, bookings: 20, status: 'inactive' },
];

export default function AdminHotelsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search hotels..." className="pl-9 w-64" />
        </div>
        <Button size="md" className="gap-2"><Plus className="w-4 h-4" /> Add Hotel</Button>
      </div>

      <Card hover={false} padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                <th className="p-4 font-medium">Hotel</th>
                <th className="p-4 font-medium">Destination</th>
                <th className="p-4 font-medium">Price/Night</th>
                <th className="p-4 font-medium">Rating</th>
                <th className="p-4 font-medium">Bookings</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hotels.map((h) => (
                <tr key={h.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="p-4 font-medium">{h.name}</td>
                  <td className="p-4 text-gray-500">{h.destination}</td>
                  <td className="p-4 font-medium">{formatCurrency(h.price)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      {h.rating}
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    </div>
                  </td>
                  <td className="p-4">{h.bookings}</td>
                  <td className="p-4"><Badge variant={h.status === 'active' ? 'success' : 'warning'}>{h.status}</Badge></td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 text-gray-500 hover:text-red-600" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
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
