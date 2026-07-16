'use client';

import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';

const reportCards = [
  { label: 'Total Revenue', value: formatCurrency(245890), change: '+23%', trend: 'up' },
  { label: 'Total Bookings', value: '1,234', change: '+12%', trend: 'up' },
  { label: 'Avg Order Value', value: formatCurrency(199), change: '+5%', trend: 'up' },
  { label: 'Cancellation Rate', value: '3.2%', change: '-0.8%', trend: 'down' },
];

const monthlyData = [
  { month: 'Jan', revenue: 18500, bookings: 95 },
  { month: 'Feb', revenue: 16200, bookings: 82 },
  { month: 'Mar', revenue: 21300, bookings: 110 },
  { month: 'Apr', revenue: 19800, bookings: 102 },
  { month: 'May', revenue: 24500, bookings: 128 },
  { month: 'Jun', revenue: 27800, bookings: 145 },
  { month: 'Jul', revenue: 32890, bookings: 172 },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Reports & Analytics</h2>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
          <Download className="w-4 h-4" /> Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {reportCards.map((card) => (
          <Card key={card.label} hover={false}>
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold mt-1">{card.value}</p>
            <div className="flex items-center gap-1 mt-1">
              {card.trend === 'up' ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
              <span className={card.trend === 'up' ? 'text-green-600' : 'text-red-600'}>{card.change}</span>
            </div>
          </Card>
        ))}
      </div>

      <Card hover={false}>
        <h3 className="font-display text-lg font-bold mb-4">Monthly Revenue</h3>
        <div className="h-80">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                <th className="p-3 font-medium">Month</th>
                <th className="p-3 font-medium">Revenue</th>
                <th className="p-3 font-medium">Bookings</th>
                <th className="p-3 font-medium">Avg Order</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((m) => (
                <tr key={m.month} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="p-3 font-medium">{m.month} 2026</td>
                  <td className="p-3">{formatCurrency(m.revenue)}</td>
                  <td className="p-3">{m.bookings}</td>
                  <td className="p-3">{formatCurrency(Math.round(m.revenue / m.bookings))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
