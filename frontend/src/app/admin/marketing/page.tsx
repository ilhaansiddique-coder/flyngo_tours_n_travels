'use client';

import { useApi } from '@/hooks/use-api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Megaphone, Percent, Send, TrendingUp, Users, Calendar, BarChart3, Plus, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  maxUses?: number;
  usedCount?: number;
  startDate: string;
  endDate: string;
  applicableTo?: string[];
  isActive?: boolean;
}

export default function MarketingPage() {
  const { getCoupons, getUsers, getBookings } = useApi();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [customerCount, setCustomerCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps

    const fetch = async () => {
      try {
        const [couponsRes, usersRes, bookingsRes] = await Promise.all([
          getCoupons({ limit: '100' }),
          getUsers({ limit: '1' }).catch(() => ({ meta: { total: 0 } })),
          getBookings({ per_page: '1' }).catch(() => ({ meta: { total: 0 } })),
        ]);
        const data = couponsRes as any;
        setCoupons(Array.isArray(data) ? data : data?.items ?? data?.data ?? []);
        setCustomerCount((usersRes as any)?.meta?.total ?? 0);
        setBookingCount((bookingsRes as any)?.meta?.total ?? 0);
      } catch (err: any) {
        setError(err.message || 'Failed to load marketing data');
      } finally {
        setLoading(false);
      }
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const activeCoupons = coupons.filter((c) => c.isActive).length;
  const totalUsed = coupons.reduce((sum, c) => sum + (c.usedCount ?? 0), 0);
  const totalCoupons = coupons.length;
  const conversionRate = bookingCount > 0 && customerCount > 0
    ? ((bookingCount / customerCount) * 100).toFixed(1)
    : '0.0';

  const now = new Date();
  const upcomingCoupons = coupons.filter((c) => new Date(c.startDate) > now);
  const liveCoupons = coupons.filter((c) => {
    const start = new Date(c.startDate);
    const end = new Date(c.endDate);
    return c.isActive && start <= now && end >= now;
  });
  const expiredCoupons = coupons.filter((c) => new Date(c.endDate) < now);

  const stats = [
    { label: 'Active Campaigns', value: activeCoupons, icon: Percent, color: 'text-brand-600 bg-brand-50 dark:bg-brand-950' },
    { label: 'Coupon Redemptions', value: totalUsed.toLocaleString(), icon: Send, color: 'text-green-600 bg-green-50 dark:bg-green-950' },
    { label: 'Total Campaigns', value: totalCoupons, icon: Megaphone, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950' },
    { label: 'Conversion Rate', value: `${conversionRate}%`, icon: TrendingUp, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold dark:text-white">Marketing & Campaigns</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage discount campaigns, track performance, and reach customers
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/notifications">
            <Button variant="outline" size="md" className="gap-2">
              <Send className="w-4 h-4" /> Send Notification
            </Button>
          </Link>
          <Link href="/admin/coupons">
            <Button size="md" className="gap-2">
              <Plus className="w-4 h-4" /> New Campaign
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} hover={false}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold mt-1 dark:text-white">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card hover={false}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-600" /> Live Now ({liveCoupons.length})
          </h3>
          {liveCoupons.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">No active campaigns</p>
          ) : (
            <div className="space-y-2">
              {liveCoupons.slice(0, 5).map((c) => (
                <div key={c.id} className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                  <div>
                    <p className="font-mono font-bold text-brand-600">{c.code}</p>
                    <p className="text-xs text-gray-500">{c.type === 'percentage' ? `${c.value}% off` : `৳${c.value} off`}</p>
                  </div>
                  <Badge variant="success">Live</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card hover={false}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600" /> Upcoming ({upcomingCoupons.length})
          </h3>
          {upcomingCoupons.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">No upcoming campaigns</p>
          ) : (
            <div className="space-y-2">
              {upcomingCoupons.slice(0, 5).map((c) => (
                <div key={c.id} className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                  <div>
                    <p className="font-mono font-bold text-brand-600">{c.code}</p>
                    <p className="text-xs text-gray-500">Starts {formatDate(c.startDate)}</p>
                  </div>
                  <Badge variant="warning">Soon</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card hover={false}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" /> Expired ({expiredCoupons.length})
          </h3>
          {expiredCoupons.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">No expired campaigns</p>
          ) : (
            <div className="space-y-2">
              {expiredCoupons.slice(0, 5).map((c) => (
                <div key={c.id} className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                  <div>
                    <p className="font-mono font-bold text-gray-500">{c.code}</p>
                    <p className="text-xs text-gray-500">Ended {formatDate(c.endDate)}</p>
                  </div>
                  <Badge variant="default">Ended</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card hover={false} padding="none">
        <div className="p-6 pb-0 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold dark:text-white">All Campaigns</h3>
          <Link href="/admin/coupons" className="text-sm text-brand-600 hover:underline flex items-center gap-1">
            Manage all <ExternalLink className="w-3 h-3" />
          </Link>
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
                <th className="p-4 font-medium">Applicable To</th>
                <th className="p-4 font-medium">Start Date</th>
                <th className="p-4 font-medium">End Date</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-gray-400 dark:text-gray-500">
                    <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No campaigns yet. Create your first coupon to get started.</p>
                    <Link href="/admin/coupons">
                      <Button size="sm" className="mt-3">Create Campaign</Button>
                    </Link>
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
                      {c.type === 'percentage' ? `${c.value}%` : formatCurrency(Number(c.value))}
                    </td>
                    <td className="p-4 dark:text-gray-300">
                      {c.usedCount ?? 0}
                      {' / '}
                      {c.maxUses && c.maxUses > 0 ? c.maxUses : '∞'}
                    </td>
                    <td className="p-4">
                      <Badge variant={c.isActive ? 'success' : 'default'}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {(c.applicableTo || []).map((a) => (
                          <Badge key={a} variant="default" className="text-xs capitalize">{a}</Badge>
                        ))}
                        {(!c.applicableTo || c.applicableTo.length === 0) && <span className="text-xs text-gray-400">All</span>}
                      </div>
                    </td>
                    <td className="p-4 text-xs text-gray-500 dark:text-gray-400">
                      {c.startDate ? formatDate(c.startDate) : '—'}
                    </td>
                    <td className="p-4 text-xs text-gray-500 dark:text-gray-400">
                      {c.endDate ? formatDate(c.endDate) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card hover={false}>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-brand-600" /> Marketing Channels & Tools
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link href="/admin/coupons">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-brand-500 transition-colors">
              <Percent className="w-6 h-6 text-brand-600 mb-2" />
              <h4 className="font-semibold">Discount Coupons</h4>
              <p className="text-xs text-gray-500 mt-1">Create promo codes and discount campaigns</p>
            </div>
          </Link>
          <Link href="/admin/notifications">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-brand-500 transition-colors">
              <Send className="w-6 h-6 text-green-600 mb-2" />
              <h4 className="font-semibold">Push Notifications</h4>
              <p className="text-xs text-gray-500 mt-1">Send broadcasts to all or specific users</p>
            </div>
          </Link>
          <Link href="/admin/affiliates">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-brand-500 transition-colors">
              <Users className="w-6 h-6 text-amber-600 mb-2" />
              <h4 className="font-semibold">Affiliate Program</h4>
              <p className="text-xs text-gray-500 mt-1">Manage partners and referral commissions</p>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}
