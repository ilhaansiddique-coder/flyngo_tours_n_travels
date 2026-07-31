'use client';

import { useApi } from '@/hooks/use-api';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, BookOpen, ArrowUpRight, Download, Calendar } from 'lucide-react';

interface DashboardData {
  totalRevenue: number;
  totalBookings: number;
  totalUsers: number;
  conversionRate: number;
  monthlyRevenue: Array<{ month: number; year: number; revenue: number }>;
  totalCustomers: number;
  bookingsByStatus: Record<string, number>;
  recentBookings: any[];
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function ReportsPage() {
  const { getDashboard, getBookings, getUsers } = useApi();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [reportType, setReportType] = useState<'overview' | 'bookings' | 'users'>('overview');
  const [exporting, setExporting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getDashboard() as unknown as DashboardData;
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportReport = async () => {
    setExporting(true);
    try {
      let csv = '';
      if (reportType === 'overview' && data) {
        csv = 'Metric,Value\n';
        csv += `Total Revenue,${data.totalRevenue}\n`;
        csv += `Total Bookings,${data.totalBookings}\n`;
        csv += `Total Customers,${data.totalCustomers}\n`;
        csv += `Conversion Rate,${data.conversionRate}%\n\n`;
        csv += 'Monthly Revenue\n';
        csv += 'Month,Revenue\n';
        data.monthlyRevenue?.forEach((m) => {
          csv += `${MONTH_NAMES[m.month - 1]} ${m.year},${m.revenue}\n`;
        });
      } else if (reportType === 'bookings') {
        const params: Record<string, string> = { limit: '500' };
        if (dateRange.startDate) params.startDate = dateRange.startDate;
        if (dateRange.endDate) params.endDate = dateRange.endDate;
        const res: any = await getBookings(params);
        const items = Array.isArray(res) ? res : res?.items ?? res?.data ?? [];
        csv = 'Booking Code,Customer,Email,Type,Amount,Status,Start Date\n';
        items.forEach((b: any) => {
          csv += `${b.bookingCode},"${b.user?.fullName}",${b.user?.email},${b.bookingType},${b.totalAmount},${b.status},${b.startDate}\n`;
        });
      } else if (reportType === 'users') {
        const params: Record<string, string> = { limit: '500' };
        if (dateRange.startDate) params.startDate = dateRange.startDate;
        if (dateRange.endDate) params.endDate = dateRange.endDate;
        const res: any = await getUsers(params);
        const items = Array.isArray(res) ? res : res?.items ?? res?.data ?? [];
        csv = 'Name,Email,Role,Status,Created\n';
        items.forEach((u: any) => {
          csv += `"${u.fullName}",${u.email},${u.role?.name || ''},${u.isActive ? 'Active' : 'Inactive'},${u.createdAt}\n`;
        });
      }
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

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
          value: formatCurrency(Number(data.totalRevenue), 'BDT'),
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
          value: (data.totalCustomers ?? data.totalUsers).toLocaleString(),
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

  const maxRevenue = data?.monthlyRevenue ? Math.max(...data.monthlyRevenue.map((m) => m.revenue), 1) : 1;

  return (
    <div className="space-y-6">
      <Card hover={false}>
        <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
          <div>
            <h2 className="font-display text-lg font-bold dark:text-white">Reports & Analytics</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Track your business performance
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
            >
              <option value="overview">Overview Report</option>
              <option value="bookings">Bookings Report</option>
              <option value="users">Users Report</option>
            </select>
            <Input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              placeholder="From"
            />
            <Input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              placeholder="To"
            />
            <Button onClick={exportReport} loading={exporting} size="md" className="gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
        </div>
      </Card>

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
          Monthly Revenue (12 months)
        </h3>
        {data?.monthlyRevenue && data.monthlyRevenue.length > 0 ? (
          <div className="flex items-end gap-2 h-48">
            {data.monthlyRevenue.map((m, i) => {
              const height = (m.revenue / maxRevenue) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end group">
                  <div className="text-xs text-gray-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatCurrency(Number(m.revenue), 'BDT')}
                  </div>
                  <div
                    className="w-full bg-gradient-to-t from-brand-600 to-brand-400 rounded-t-md transition-all hover:from-brand-700 hover:to-brand-500"
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`${MONTH_NAMES[m.month - 1]} ${m.year}: ${formatCurrency(Number(m.revenue), 'BDT')}`}
                  />
                  <div className="text-xs text-gray-500 mt-1">{MONTH_NAMES[m.month - 1]}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-12">No revenue data available</p>
        )}
      </Card>

      {data?.bookingsByStatus && Object.keys(data.bookingsByStatus).length > 0 && (
        <Card hover={false}>
          <h3 className="font-display text-lg font-bold mb-4 dark:text-white">
            Bookings by Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(data.bookingsByStatus).map(([status, count]) => (
              <div key={status} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold">{count as number}</p>
                <p className="text-xs text-gray-500 capitalize mt-1">{status.replace('_', ' ')}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
