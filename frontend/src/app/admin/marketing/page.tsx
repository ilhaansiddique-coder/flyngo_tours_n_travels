'use client';

import { useApi } from '@/hooks/use-api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Megaphone, Percent, Send, TrendingUp } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxUses?: number;
  usedCount?: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export default function MarketingPage() {
  const { getCoupons } = useApi();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await getCoupons() as unknown as Coupon[];
        setCoupons(Array.isArray(result) ? result : (result as any)?.data ?? []);
      } catch (err: any) {
        setError(err.message || 'Failed to load marketing data');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [getCoupons]);

  const activeCoupons = coupons.filter((c) => c.isActive).length;
  const totalUsed = coupons.reduce((sum, c) => sum + (c.usedCount ?? 0), 0);
  const totalCoupons = coupons.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Loading marketing data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto mb-4">
          <Megaphone className="w-6 h-6 text-red-500" />
        </div>
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  const stats = [
    {
      label: 'Active Coupons',
      value: activeCoupons,
      icon: Percent,
      color: 'text-brand-600 bg-brand-50 dark:bg-brand-950',
    },
    {
      label: 'Total Used',
      value: totalUsed.toLocaleString(),
      icon: Send,
      color: 'text-green-600 bg-green-50 dark:bg-green-950',
    },
    {
      label: 'Campaigns',
      value: totalCoupons,
      icon: Megaphone,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950',
    },
    {
      label: 'Conversion Rate',
      value: '4.2%',
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-bold dark:text-white">Marketing</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Manage campaigns and track performance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} hover={false}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold mt-1 dark:text-white">
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card hover={false} padding="none">
        <div className="p-6 pb-0">
          <h3 className="font-display text-lg font-bold dark:text-white">
            Campaigns
          </h3>
        </div>
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                <th className="p-4 font-medium">Code</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Value</th>
                <th className="p-4 font-medium">Used / Max</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Start Date</th>
                <th className="p-4 font-medium">End Date</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-400 dark:text-gray-500">
                    <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No campaigns yet</p>
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                  >
                    <td className="p-4 font-mono font-bold text-brand-600 dark:text-brand-400">
                      {c.code}
                    </td>
                    <td className="p-4">
                      <Badge variant={c.type === 'percentage' ? 'info' : 'warning'}>
                        {c.type === 'percentage' ? 'Percentage' : 'Fixed'}
                      </Badge>
                    </td>
                    <td className="p-4 dark:text-gray-300">
                      {c.type === 'percentage' ? `${c.value}%` : formatCurrency(c.value)}
                    </td>
                    <td className="p-4 dark:text-gray-300">
                      {c.usedCount ?? 0}
                      {' / '}
                      {c.maxUses && c.maxUses > 0 ? c.maxUses : '\u221E'}
                    </td>
                    <td className="p-4">
                      <Badge variant={c.isActive ? 'success' : 'default'}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="p-4 text-xs text-gray-500 dark:text-gray-400">
                      {c.startDate ? formatDate(c.startDate) : '\u2014'}
                    </td>
                    <td className="p-4 text-xs text-gray-500 dark:text-gray-400">
                      {c.endDate ? formatDate(c.endDate) : '\u2014'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
