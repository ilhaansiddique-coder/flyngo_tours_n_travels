'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, cn } from '@/lib/utils';
import { BookOpen, Users, DollarSign, TrendingUp, Calendar, Activity, PieChart } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardData {
  totalBookings: number;
  totalUsers: number;
  totalCustomers: number;
  totalRevenue: number;
  conversionRate: string;
  bookingsByStatus: Record<string, number>;
  monthlyRevenue: Array<{ month: number; year: number; revenue: number }>;
  recentBookings: Array<{
    id: string;
    bookingCode: string;
    bookingType: string;
    status: string;
    startDate: string;
    totalAmount: number;
    user: { fullName: string; email: string };
  }>;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminDashboard() {
  const { getDashboard } = useApi();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await getDashboard() as DashboardData;
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [getDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const stats = data ? [
    { label: 'Total Bookings', value: data.totalBookings.toLocaleString(), icon: BookOpen, color: 'text-brand-600' },
    { label: 'Total Customers', value: data.totalCustomers.toLocaleString(), icon: Users, color: 'text-green-600' },
    { label: 'Revenue', value: formatCurrency(data.totalRevenue), icon: DollarSign, color: 'text-amber-600' },
    { label: 'Conversion Rate', value: `${data.conversionRate}%`, icon: TrendingUp, color: 'text-purple-600' },
  ] : [];

  const monthlyMap = new Map<number, number>();
  data?.monthlyRevenue.forEach((m) => monthlyMap.set(m.month, m.revenue));
  const maxRev = Math.max(...(data?.monthlyRevenue.map((m) => m.revenue) ?? [0]), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} hover={false}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={cn('w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center', stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card hover={false}>
          <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-600" /> Revenue Overview
          </h3>
          <div className="h-64 flex items-end gap-2">
            {MONTH_LABELS.map((_, i) => {
              const monthIdx = i + 1;
              const rev = monthlyMap.get(monthIdx) ?? 0;
              const height = maxRev > 0 ? (rev / maxRev) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-brand-200 dark:bg-brand-900 rounded-t-lg transition-all hover:bg-brand-400 dark:hover:bg-brand-600" style={{ height: `${height}%` }} />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            {MONTH_LABELS.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </Card>

        <Card hover={false}>
          <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-600" /> Upcoming Bookings
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {data?.recentBookings.filter(b => b.status === 'pending' || b.status === 'confirmed').slice(0, 5).map((b) => (
              <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                <div>
                  <p className="font-medium text-sm">{b.bookingCode}</p>
                  <p className="text-xs text-gray-500">{b.user?.fullName}</p>
                </div>
                <Badge variant={b.status === 'confirmed' ? 'success' : 'warning'}>
                  {b.status}
                </Badge>
              </div>
            ))}
            {(!data?.recentBookings?.length) && (
              <p className="text-gray-400 text-sm text-center py-8">No upcoming bookings</p>
            )}
          </div>
        </Card>
      </div>

      {data?.bookingsByStatus && Object.keys(data.bookingsByStatus).length > 0 && (
        <Card hover={false}>
          <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-brand-600" /> Booking Status Distribution
          </h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(data.bookingsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800">
                <Badge variant={
                  status === 'confirmed' ? 'success' :
                  status === 'pending' ? 'warning' :
                  status === 'completed' ? 'info' :
                  status === 'cancelled' ? 'danger' : 'default'
                }>
                  {status}
                </Badge>
                <span className="font-bold text-lg">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card hover={false}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg font-bold">Recent Bookings</h3>
          <Link href="/admin/bookings" className="text-sm text-brand-600 hover:underline font-medium">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-800">
                <th className="pb-3 font-medium">Booking Code</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentBookings.map((b) => (
                <tr key={b.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 font-mono text-xs">{b.bookingCode}</td>
                  <td className="py-3 font-medium">{b.user?.fullName}</td>
                  <td className="py-3 capitalize">{b.bookingType}</td>
                  <td className="py-3 font-medium">{formatCurrency(b.totalAmount)}</td>
                  <td className="py-3">
                    <Badge variant={b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : b.status === 'completed' ? 'info' : b.status === 'cancelled' ? 'danger' : 'default'}>
                      {b.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {(!data?.recentBookings?.length) && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">No bookings yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
