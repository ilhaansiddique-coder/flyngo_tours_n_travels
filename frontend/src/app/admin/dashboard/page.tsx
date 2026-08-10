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

const STAT_STYLES: Array<{ tint: string; icon: string }> = [
  { tint: 'bg-accent/10 border-accent/30', icon: 'text-accent' },
  { tint: 'bg-emerald-500/10 border-emerald-400/30', icon: 'text-emerald-300' },
  { tint: 'bg-amber-500/10 border-amber-400/30', icon: 'text-amber-300' },
  { tint: 'bg-blue-500/10 border-blue-400/30', icon: 'text-blue-300' },
];

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
          <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-on-surface-variant">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  const stats = data ? [
    { label: 'Total Bookings', value: data.totalBookings.toLocaleString(), icon: BookOpen },
    { label: 'Total Customers', value: data.totalCustomers.toLocaleString(), icon: Users },
    { label: 'Revenue', value: formatCurrency(data.totalRevenue), icon: DollarSign },
    { label: 'Conversion Rate', value: `${data.conversionRate}%`, icon: TrendingUp },
  ] : [];

  const monthlyMap = new Map<number, number>();
  data?.monthlyRevenue.forEach((m) => monthlyMap.set(m.month, m.revenue));
  const maxRev = Math.max(...(data?.monthlyRevenue.map((m) => m.revenue) ?? [0]), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const style = STAT_STYLES[idx];
          return (
            <Card key={stat.label} hover={false}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-on-surface-variant uppercase tracking-wider font-semibold">{stat.label}</p>
                  <p className="text-2xl font-bold mt-2 text-on-surface">{stat.value}</p>
                </div>
                <div className={cn('w-10 h-10 rounded-xl border flex items-center justify-center', style.tint, style.icon)}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card hover={false}>
          <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2 text-on-surface">
            <Activity className="w-5 h-5 text-accent" /> Revenue Overview
          </h3>
          <div className="h-64 flex items-end gap-2">
            {MONTH_LABELS.map((_, i) => {
              const monthIdx = i + 1;
              const rev = monthlyMap.get(monthIdx) ?? 0;
              const height = maxRev > 0 ? (rev / maxRev) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-blue-600/40 to-accent rounded-t-lg transition-all hover:from-blue-500/60 hover:to-accent"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-on-surface-variant">
            {MONTH_LABELS.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </Card>

        <Card hover={false}>
          <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2 text-on-surface">
            <Calendar className="w-5 h-5 text-accent" /> Upcoming Bookings
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {data?.recentBookings.filter(b => b.status === 'pending' || b.status === 'confirmed').slice(0, 5).map((b) => (
              <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-high border border-outline-variant">
                <div>
                  <p className="font-medium text-sm text-on-surface">{b.bookingCode}</p>
                  <p className="text-xs text-on-surface-variant">{b.user?.fullName}</p>
                </div>
                <Badge variant={b.status === 'confirmed' ? 'success' : 'warning'}>
                  {b.status}
                </Badge>
              </div>
            ))}
            {(!data?.recentBookings?.length) && (
              <p className="text-on-surface-variant text-sm text-center py-8">No upcoming bookings</p>
            )}
          </div>
        </Card>
      </div>

      {data?.bookingsByStatus && Object.keys(data.bookingsByStatus).length > 0 && (
        <Card hover={false}>
          <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2 text-on-surface">
            <PieChart className="w-5 h-5 text-accent" /> Booking Status Distribution
          </h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(data.bookingsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high border border-outline-variant">
                <Badge variant={
                  status === 'confirmed' ? 'success' :
                  status === 'pending' ? 'warning' :
                  status === 'completed' ? 'info' :
                  status === 'cancelled' ? 'danger' : 'default'
                }>
                  {status}
                </Badge>
                <span className="font-bold text-lg text-on-surface">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card hover={false}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg font-bold text-on-surface">Recent Bookings</h3>
          <Link href="/admin/bookings" className="text-sm text-accent hover:underline font-medium">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-on-surface-variant border-b border-outline-variant">
                <th className="pb-3 font-medium">Booking Code</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentBookings.map((b) => (
                <tr key={b.id} className="border-b border-outline-variant hover:bg-surface-container-high transition-colors">
                  <td className="py-3 font-mono text-xs text-accent">{b.bookingCode}</td>
                  <td className="py-3 font-medium text-on-surface">{b.user?.fullName}</td>
                  <td className="py-3 capitalize text-on-surface-variant">{b.bookingType}</td>
                  <td className="py-3 font-medium text-on-surface">{formatCurrency(b.totalAmount)}</td>
                  <td className="py-3">
                    <Badge variant={b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : b.status === 'completed' ? 'info' : b.status === 'cancelled' ? 'danger' : 'default'}>
                      {b.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {(!data?.recentBookings?.length) && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-on-surface-variant">No bookings yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
