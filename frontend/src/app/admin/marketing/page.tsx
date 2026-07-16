'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Play, Pause, BarChart3, Send } from 'lucide-react';
import { Section, Container } from '@/components/ui/section';

const campaigns = [
  { id: '1', name: 'Summer Sale 2026', type: 'Email', audience: 'All customers', sent: 4580, opened: 2340, clicked: 890, status: 'sent', date: '2026-07-10' },
  { id: '2', name: 'Welcome Series', type: 'Email', audience: 'New users', sent: 1200, opened: 980, clicked: 450, status: 'active', date: '2026-07-01' },
  { id: '3', name: 'Abandoned Cart Reminder', type: 'Email', audience: 'Cart abandoners', sent: 320, opened: 210, clicked: 85, status: 'active', date: '2026-06-15' },
  { id: '4', name: 'Holiday Promo', type: 'SMS', audience: 'All customers', sent: 3200, opened: 0, clicked: 0, status: 'draft', date: '—' },
];

export default function MarketingPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search campaigns..." className="pl-9 w-64" />
        </div>
        <Button size="md" className="gap-2"><Plus className="w-4 h-4" /> New Campaign</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Sent', value: '9,300', color: 'text-brand-600' },
          { label: 'Open Rate', value: '51.2%', color: 'text-green-600' },
          { label: 'Click Rate', value: '15.3%', color: 'text-amber-600' },
          { label: 'Conversions', value: '234', color: 'text-purple-600' },
        ].map((stat) => (
          <Card key={stat.label} hover={false}>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card hover={false} padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                <th className="p-4 font-medium">Campaign</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Audience</th>
                <th className="p-4 font-medium">Sent</th>
                <th className="p-4 font-medium">Opened</th>
                <th className="p-4 font-medium">Clicked</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="p-4 font-medium">{c.name}</td>
                  <td className="p-4"><Badge variant={c.type === 'Email' ? 'info' : 'default'}>{c.type}</Badge></td>
                  <td className="p-4 text-gray-500">{c.audience}</td>
                  <td className="p-4">{c.sent.toLocaleString()}</td>
                  <td className="p-4">{c.opened.toLocaleString()}</td>
                  <td className="p-4">{c.clicked.toLocaleString()}</td>
                  <td className="p-4"><Badge variant={c.status === 'active' ? 'success' : c.status === 'sent' ? 'info' : 'warning'}>{c.status}</Badge></td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {c.status === 'draft' && (
                        <button className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900 text-gray-500 hover:text-green-600"><Send className="w-4 h-4" /></button>
                      )}
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600"><BarChart3 className="w-4 h-4" /></button>
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
