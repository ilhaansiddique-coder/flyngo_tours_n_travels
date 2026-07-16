'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Pencil, Trash2, Tag } from 'lucide-react';

const coupons = [
  { id: '1', code: 'SUMMER25', type: 'percentage', value: 25, minPurchase: 500, maxUses: 100, used: 42, startDate: '2026-06-01', endDate: '2026-08-31', status: 'active' },
  { id: '2', code: 'WELCOME50', type: 'fixed', value: 50, minPurchase: 200, maxUses: 50, used: 15, startDate: '2026-01-01', endDate: '2026-12-31', status: 'active' },
  { id: '3', code: 'FLY10', type: 'percentage', value: 10, minPurchase: 0, maxUses: 0, used: 89, startDate: '2026-04-01', endDate: '2026-12-31', status: 'active' },
  { id: '4', code: 'HONEYMOON', type: 'percentage', value: 15, minPurchase: 1000, maxUses: 30, used: 30, startDate: '2026-05-01', endDate: '2026-07-31', status: 'expired' },
];

export default function CouponsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search coupons..." className="pl-9 w-64" />
        </div>
        <Button size="md" className="gap-2"><Plus className="w-4 h-4" /> Create Coupon</Button>
      </div>

      <Card hover={false} padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                <th className="p-4 font-medium">Code</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Value</th>
                <th className="p-4 font-medium">Min Purchase</th>
                <th className="p-4 font-medium">Usage</th>
                <th className="p-4 font-medium">Validity</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="p-4 font-mono font-bold text-brand-600">{c.code}</td>
                  <td className="p-4 capitalize">{c.type}</td>
                  <td className="p-4">{c.type === 'percentage' ? `${c.value}%` : `$${c.value}`}</td>
                  <td className="p-4">${c.minPurchase}</td>
                  <td className="p-4">{c.used}/{c.maxUses || '∞'}</td>
                  <td className="p-4 text-xs text-gray-500">{c.startDate} — {c.endDate}</td>
                  <td className="p-4"><Badge variant={c.status === 'active' ? 'success' : 'danger'}>{c.status}</Badge></td>
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
