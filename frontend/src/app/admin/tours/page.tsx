'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';

const tours = [
  { id: '1', title: 'Bali Paradise Explorer', destination: 'Bali, Indonesia', price: 1299, duration: 7, bookings: 42, status: 'active' },
  { id: '2', title: 'Dubai Luxury Experience', destination: 'Dubai, UAE', price: 2499, duration: 5, bookings: 28, status: 'active' },
  { id: '3', title: 'Paris Romantic Getaway', destination: 'Paris, France', price: 1899, duration: 5, bookings: 35, status: 'active' },
  { id: '4', title: 'Bangkok Street Food & Culture', destination: 'Bangkok, Thailand', price: 899, duration: 5, bookings: 18, status: 'draft' },
  { id: '5', title: 'Tokyo Tech & Tradition', destination: 'Tokyo, Japan', price: 2199, duration: 8, bookings: 22, status: 'active' },
];

export default function AdminToursPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search tours..." className="pl-9 w-64" />
        </div>
        <Button size="md" className="gap-2"><Plus className="w-4 h-4" /> Add Tour</Button>
      </div>

      <Card hover={false} padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                <th className="p-4 font-medium">Tour</th>
                <th className="p-4 font-medium">Destination</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Duration</th>
                <th className="p-4 font-medium">Bookings</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tours.map((t) => (
                <tr key={t.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="p-4 font-medium">{t.title}</td>
                  <td className="p-4 text-gray-500">{t.destination}</td>
                  <td className="p-4 font-medium">{formatCurrency(t.price)}</td>
                  <td className="p-4">{t.duration} days</td>
                  <td className="p-4">{t.bookings}</td>
                  <td className="p-4"><Badge variant={t.status === 'active' ? 'success' : 'warning'}>{t.status}</Badge></td>
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
