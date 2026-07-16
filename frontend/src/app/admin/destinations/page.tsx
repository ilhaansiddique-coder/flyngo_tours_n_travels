'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Pencil, Trash2, Globe } from 'lucide-react';

const destinations = [
  { id: '1', name: 'Bali', country: 'Indonesia', continent: 'Asia', tours: 12, hotels: 25, status: 'featured' },
  { id: '2', name: 'Dubai', country: 'UAE', continent: 'Asia', tours: 8, hotels: 40, status: 'featured' },
  { id: '3', name: 'Paris', country: 'France', continent: 'Europe', tours: 15, hotels: 35, status: 'featured' },
  { id: '4', name: 'Bangkok', country: 'Thailand', continent: 'Asia', tours: 10, hotels: 20, status: 'active' },
  { id: '5', name: 'Singapore', country: 'Singapore', continent: 'Asia', tours: 6, hotels: 15, status: 'inactive' },
];

export default function AdminDestinationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search destinations..." className="pl-9 w-64" />
        </div>
        <Button size="md" className="gap-2"><Plus className="w-4 h-4" /> Add Destination</Button>
      </div>

      <Card hover={false} padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                <th className="p-4 font-medium">Destination</th>
                <th className="p-4 font-medium">Country</th>
                <th className="p-4 font-medium">Continent</th>
                <th className="p-4 font-medium">Tours</th>
                <th className="p-4 font-medium">Hotels</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {destinations.map((d) => (
                <tr key={d.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="p-4 font-medium flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    {d.name}
                  </td>
                  <td className="p-4 text-gray-500">{d.country}</td>
                  <td className="p-4">{d.continent}</td>
                  <td className="p-4">{d.tours}</td>
                  <td className="p-4">{d.hotels}</td>
                  <td className="p-4"><Badge variant={d.status === 'featured' ? 'info' : d.status === 'active' ? 'success' : 'warning'}>{d.status}</Badge></td>
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
