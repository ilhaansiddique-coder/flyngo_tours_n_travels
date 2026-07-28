'use client';

import { useApi } from '@/hooks/use-api';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, BookOpen, ArrowUpRight } from 'lucide-react';

interface DashboardData {
  totalRevenue: number;
  totalBookings: number;
  totalUsers: number;
  conversionRate: number;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
}

export default function ReportsPage() {
  const { getDashboard } = useApi();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await getDashboard() as unknown as DashboardData;
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Failed to load reports');
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
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-6 h-6 text-red-500" />
        </div>
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  const stats = data
    ? [
        {
          label: 'Total Revenue',
          value: formatCurrency(data.totalRevenue),
          change: '+23%',
          trend: 'up' as const,
          icon: DollarSign,
          color: 'text-amber-600 bg-amber-50 dark:bg-amber-950',
        },
        {
          label: 'Total Bookings',
          value: data.totalBookings.toLocaleString(),
          change: '+12%',
          trend: 'up' as const,
          icon: BookOpen,
          color: 'text-brand-600 bg-brand-50 dark:bg-brand-950',
        },
        {
          label: 'Total Customers',
          value: data.totalUsers.toLocaleString(),
          change: '+8%',
          trend: 'up' as const,
          icon: Users,
          color: 'text-green-600 bg-green-50 dark:bg-green-950',
        },
        {
          label: 'Conversion Rate',
          value: `${data.conversionRate ?? '4.2'}%`,
          change: '-0.8%',
          trend: 'down' as const,
          icon: TrendingUp,
          color: 'text-purple-600 bg-purple-50 dark:bg-purple-950',
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold dark:text-white">Reports & Analytics</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Track your business performance
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300 transition-colors">
          <BarChart3 className="w-4 h-4" /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} hover={false}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{stat.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-red-600 dark:text-red-400 rotate-90" />
                  )}
                  <span
                    className={
                      stat.trend === 'up'
                        ? 'text-green-600 dark:text-green-400 text-xs font-medium'
                        : 'text-red-600 dark:text-red-400 text-xs font-medium'
                    }
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card hover={false}>
        <h3 className="font-display text-lg font-bold mb-4 dark:text-white">
          Monthly Revenue
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                <th className="p-3 font-medium">Month</th>
                <th className="p-3 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data?.monthlyRevenue?.length ? (
                data.monthlyRevenue.map((m) => (
                  <tr
                    key={m.month}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                  >
                    <td className="p-3 font-medium dark:text-white">{m.month}</td>
                    <td className="p-3 dark:text-gray-300">
                      {formatCurrency(m.revenue)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={2}
                    className="p-12 text-center text-gray-400 dark:text-gray-500"
                  >
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No revenue data available</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
