'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';

const visaServices = [
  { id: '1', country: 'Indonesia', title: 'Indonesia Tourist Visa', price: 150, processing: '3-5 days', applications: 45, status: 'active' },
  { id: '2', country: 'UAE', title: 'UAE Tourist Visa', price: 200, processing: '2-4 days', applications: 32, status: 'active' },
  { id: '3', country: 'France', title: 'France Schengen Visa', price: 350, processing: '10-15 days', applications: 28, status: 'active' },
  { id: '4', country: 'Thailand', title: 'Thailand Tourist Visa', price: 100, processing: '3-5 days', applications: 19, status: 'active' },
  { id: '5', country: 'Japan', title: 'Japan Tourist Visa', price: 250, processing: '7-10 days', applications: 15, status: 'inactive' },
];

export default function AdminVisaPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search visa services..." className="pl-9 w-64" />
        </div>
        <Button size="md" className="gap-2"><Plus className="w-4 h-4" /> Add Visa Service</Button>
      </div>

      <Card hover={false} padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                <th className="p-4 font-medium">Service</th>
                <th className="p-4 font-medium">Country</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Processing Time</th>
                <th className="p-4 font-medium">Applications</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visaServices.map((v) => (
                <tr key={v.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="p-4 font-medium">{v.title}</td>
                  <td className="p-4 text-gray-500">{v.country}</td>
                  <td className="p-4 font-medium">{formatCurrency(v.price)}</td>
                  <td className="p-4">{v.processing}</td>
                  <td className="p-4">{v.applications}</td>
                  <td className="p-4"><Badge variant={v.status === 'active' ? 'success' : 'warning'}>{v.status}</Badge></td>
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
