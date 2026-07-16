'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Search, Filter, Download, Eye, X, Check } from 'lucide-react';
import { useState } from 'react';

const bookings = [
  { id: '1', code: 'FLY-L5G7-X9K2', customer: 'Sarah Johnson', email: 'sarah@email.com', type: 'Tour', item: 'Bali Paradise Explorer', amount: 1299, status: 'confirmed', date: '2026-07-15' },
  { id: '2', code: 'FLY-M8F2-W3P4', customer: 'Ahmed Khan', email: 'ahmed@email.com', type: 'Hotel', item: 'Dubai Marina Luxury Hotel', amount: 2495, status: 'pending', date: '2026-07-14' },
  { id: '3', code: 'FLY-N1D6-H7Q8', customer: 'Emily Chen', email: 'emily@email.com', type: 'Flight', item: 'SFO → SIN', amount: 849, status: 'confirmed', date: '2026-07-14' },
  { id: '4', code: 'FLY-P4R9-B5M1', customer: 'Michael Rodriguez', email: 'michael@email.com', type: 'Visa', item: 'Turkey E-Visa', amount: 80, status: 'in_progress', date: '2026-07-13' },
  { id: '5', code: 'FLY-Q2S5-V6L3', customer: 'Lisa Wang', email: 'lisa@email.com', type: 'Tour', item: 'Maldives Honeymoon', amount: 3499, status: 'completed', date: '2026-07-12' },
  { id: '6', code: 'FLY-R8T3-C4D7', customer: 'John Smith', email: 'john@email.com', type: 'Tour', item: 'Paris Romantic Getaway', amount: 1899, status: 'cancelled', date: '2026-07-11' },
];

const statusBadge = (status: string) => {
  const map: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'default'> = {
    confirmed: 'success', pending: 'warning', in_progress: 'info', completed: 'info', cancelled: 'danger',
  };
  return <Badge variant={map[status] || 'default'}>{status.replace('_', ' ')}</Badge>;
};

export default function BookingsPage() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}>{f.replace('_', ' ')}</button>
          ))}
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search bookings..." className="pl-9 w-64" />
          </div>
          <Button variant="outline" size="md" className="gap-2"><Download className="w-4 h-4" /> Export</Button>
        </div>
      </div>

      <Card hover={false} padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                <th className="p-4 font-medium">Booking Code</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Item</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="p-4 font-mono text-xs">{b.code}</td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{b.customer}</p>
                      <p className="text-xs text-gray-500">{b.email}</p>
                    </div>
                  </td>
                  <td className="p-4">{b.type}</td>
                  <td className="p-4 text-gray-500">{b.item}</td>
                  <td className="p-4 font-medium">{formatCurrency(b.amount)}</td>
                  <td className="p-4">{statusBadge(b.status)}</td>
                  <td className="p-4 text-gray-500">{b.date}</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      {b.status === 'pending' && (
                        <>
                          <button className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900 text-gray-500 hover:text-green-600" title="Confirm">
                            <Check className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 text-gray-500 hover:text-red-600" title="Cancel">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500">Showing {filtered.length} of {bookings.length} bookings</p>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">Prev</button>
            <button className="px-3 py-1 rounded-lg text-sm bg-brand-600 text-white">1</button>
            <button className="px-3 py-1 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">2</button>
            <button className="px-3 py-1 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">Next</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
