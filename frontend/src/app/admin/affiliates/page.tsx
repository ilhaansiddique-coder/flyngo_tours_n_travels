'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Search, Download } from 'lucide-react';

const affiliates = [
  { id: '1', name: 'TravelBloggerPro', email: 'blogger@email.com', code: 'TRAVEL10', clicks: 1240, conversions: 85, commission: 4250, status: 'active' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@email.com', code: 'SARAH5', clicks: 340, conversions: 12, commission: 600, status: 'active' },
  { id: '3', name: 'InstagramInfluencer', email: 'influencer@email.com', code: 'INSTA15', clicks: 2890, conversions: 145, commission: 7250, status: 'active' },
  { id: '4', name: 'YouTube Travel', email: 'youtuber@email.com', code: 'YT2025', clicks: 4500, conversions: 200, commission: 10000, status: 'active' },
];

export default function AffiliatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Affiliate Partners</h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search affiliates..." className="pl-9 w-64" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <Card hover={false} padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                <th className="p-4 font-medium">Affiliate</th>
                <th className="p-4 font-medium">Referral Code</th>
                <th className="p-4 font-medium">Clicks</th>
                <th className="p-4 font-medium">Conversions</th>
                <th className="p-4 font-medium">Conversion Rate</th>
                <th className="p-4 font-medium">Commission</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {affiliates.map((a) => (
                <tr key={a.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="p-4">
                    <p className="font-medium">{a.name}</p>
                    <p className="text-xs text-gray-500">{a.email}</p>
                  </td>
                  <td className="p-4 font-mono text-xs">{a.code}</td>
                  <td className="p-4">{a.clicks.toLocaleString()}</td>
                  <td className="p-4">{a.conversions}</td>
                  <td className="p-4">{((a.conversions / a.clicks) * 100).toFixed(1)}%</td>
                  <td className="p-4 font-medium">{formatCurrency(a.commission)}</td>
                  <td className="p-4"><Badge variant="success">{a.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
