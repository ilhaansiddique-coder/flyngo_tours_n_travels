'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, MoreVertical } from 'lucide-react';

const customers = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@email.com', phone: '+1-555-0101', bookings: 5, spent: 12450, joined: '2024-03-15', status: 'active' },
  { id: '2', name: 'Ahmed Khan', email: 'ahmed@email.com', phone: '+880-1712-3456', bookings: 3, spent: 6890, joined: '2024-06-22', status: 'active' },
  { id: '3', name: 'Emily Chen', email: 'emily@email.com', phone: '+65-9123-4567', bookings: 2, spent: 3849, joined: '2025-01-10', status: 'active' },
  { id: '4', name: 'Michael Rodriguez', email: 'michael@email.com', phone: '+34-612-3456', bookings: 1, spent: 480, joined: '2025-12-05', status: 'inactive' },
  { id: '5', name: 'Lisa Wang', email: 'lisa@email.com', phone: '+86-138-1234', bookings: 4, spent: 9890, joined: '2024-09-30', status: 'active' },
];

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search customers..." className="pl-9 w-64" />
        </div>
        <Button size="md" className="gap-2"><Plus className="w-4 h-4" /> Add Customer</Button>
      </div>

      <Card hover={false} padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Contact</th>
                <th className="p-4 font-medium">Bookings</th>
                <th className="p-4 font-medium">Total Spent</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium" />
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center font-bold text-brand-600 dark:text-brand-400">
                        {c.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-gray-500">{c.email}</p>
                    <p className="text-xs text-gray-400">{c.phone}</p>
                  </td>
                  <td className="p-4 font-medium">{c.bookings}</td>
                  <td className="p-4 font-medium">${c.spent.toLocaleString()}</td>
                  <td className="p-4 text-gray-500">{c.joined}</td>
                  <td className="p-4"><Badge variant={c.status === 'active' ? 'success' : 'warning'}>{c.status}</Badge></td>
                  <td className="p-4">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
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
