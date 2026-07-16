'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { BookOpen, Users, DollarSign, TrendingUp, Calendar, Activity } from 'lucide-react';

const stats = [
  { label: 'Total Bookings', value: '1,234', change: '+12%', icon: BookOpen, color: 'text-brand-600' },
  { label: 'Total Customers', value: '5,678', change: '+8%', icon: Users, color: 'text-green-600' },
  { label: 'Revenue', value: formatCurrency(245890), change: '+23%', icon: DollarSign, color: 'text-amber-600' },
  { label: 'Conversion Rate', value: '4.2%', change: '+0.5%', icon: TrendingUp, color: 'text-purple-600' },
];

const recentBookings = [
  { id: 'FLY-L5G7-X9K2', customer: 'Sarah Johnson', type: 'Tour', destination: 'Bali, Indonesia', amount: 1299, status: 'confirmed', date: '2026-07-15' },
  { id: 'FLY-M8F2-W3P4', customer: 'Ahmed Khan', type: 'Hotel', destination: 'Dubai, UAE', amount: 2495, status: 'pending', date: '2026-07-14' },
  { id: 'FLY-N1D6-H7Q8', customer: 'Emily Chen', type: 'Flight', destination: 'Tokyo, Japan', amount: 849, status: 'confirmed', date: '2026-07-14' },
  { id: 'FLY-P4R9-B5M1', customer: 'Michael Rodriguez', type: 'Visa', destination: 'Turkey', amount: 80, status: 'in_progress', date: '2026-07-13' },
  { id: 'FLY-Q2S5-V6L3', customer: 'Lisa Wang', type: 'Tour', destination: 'Maldives', amount: 3499, status: 'completed', date: '2026-07-12' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} hover={false}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <span className="text-sm text-green-600 font-medium">{stat.change} this month</span>
              </div>
              <div className={cn('w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center', stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card hover={false}>
          <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-600" /> Revenue Overview
          </h3>
          <div className="h-64 flex items-end gap-2">
            {[40, 65, 45, 80, 55, 90, 75, 85, 95, 60, 70, 50].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-brand-200 dark:bg-brand-900 rounded-t-lg transition-all hover:bg-brand-400 dark:hover:bg-brand-600" style={{ height: `${h}%` }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </Card>

        <Card hover={false}>
          <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-600" /> Upcoming Bookings
          </h3>
          <div className="space-y-3">
            {[
              { date: 'Jul 18', event: 'Bali Paradise Explorer', guests: 12 },
              { date: 'Jul 21', event: 'Dubai Luxury Experience', guests: 6 },
              { date: 'Jul 25', event: 'Paris Romantic Getaway', guests: 4 },
              { date: 'Aug 01', event: 'Tokyo Tech & Tradition', guests: 8 },
              { date: 'Aug 05', event: 'Maldives Honeymoon Special', guests: 2 },
            ].map((evt) => (
              <div key={evt.event} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-sm font-bold text-brand-600">
                    {evt.date.split(' ')[1]}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{evt.event}</p>
                    <p className="text-xs text-gray-500">{evt.date}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{evt.guests} guests</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card hover={false}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg font-bold">Recent Bookings</h3>
          <a href="/admin/bookings" className="text-sm text-brand-600 hover:underline font-medium">View All</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-800">
                <th className="pb-3 font-medium">Booking Code</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Destination</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 font-mono text-xs">{b.id}</td>
                  <td className="py-3 font-medium">{b.customer}</td>
                  <td className="py-3">{b.type}</td>
                  <td className="py-3 text-gray-500">{b.destination}</td>
                  <td className="py-3 font-medium">{formatCurrency(b.amount)}</td>
                  <td className="py-3">
                    <Badge variant={b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : b.status === 'completed' ? 'info' : 'default'}>
                      {b.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-gray-500">{b.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function cn(...args: (string | boolean | undefined)[]) {
  return args.filter(Boolean).join(' ');
}
