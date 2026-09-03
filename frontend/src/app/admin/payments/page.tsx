'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { useApi } from '@/hooks/use-api';
import { useEffect, useState } from 'react';
import { CreditCard, Search, DollarSign, AlertCircle, CheckCircle, Download } from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  transactionId: string;
  bkashTrxId?: string | null;
  receiptUrls?: string[];
  gatewayRef?: string;
  createdAt: string;
  user?: { id: string; fullName: string; email: string };
  booking?: { id: string; bookingCode: string; totalAmount: number };
  hajjUmrahBooking?: { id: string; bookingCode: string | null };
  bankAccount?: { bankName: string; accountNumber: string } | null;
  invoice?: { id: string; invoiceNumber: string } | null;
}

interface PaymentStats {
  total: number;
  totalCompleted: number;
  byStatus: Record<string, number>;
  byMethod: Record<string, number>;
}

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'default'> = {
  completed: 'success',
  pending: 'warning',
  processing: 'info',
  failed: 'danger',
  refunded: 'default',
};

const METHOD_LABELS: Record<string, string> = {
  stripe: 'Stripe',
  bkash: 'bKash',
  bank_transfer: 'Bank transfer',
  cash: 'Cash',
  nagad: 'Nagad',
  sslcommerz: 'SSLCommerz',
  rocket: 'Rocket',
  upay: 'Upay',
  tap: 'Tap',
  surecash: 'SureCash',
  mcash: 'mCash',
};

export default function PaymentsPage() {
  const { getPayments, getPaymentStats, updatePaymentStatus } = useApi();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<PaymentStats | null>(null);

  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchPayments = async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: String(p), limit: '20' };
      if (statusFilter) params.status = statusFilter;
      if (methodFilter) params.method = methodFilter;
      if (search) params.search = search;
      const res = await getPayments(params);
      const data = res as any;
      if (Array.isArray(data)) {
        setPayments(data);
        setTotalPages(1);
      } else {
        setPayments(data?.items ?? data?.data ?? []);
        setTotalPages(data?.meta?.totalPages ?? 1);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await getPaymentStats();
      setStats(res as PaymentStats);
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps

    fetchPayments(1);
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updatePaymentStatus(id, status);
      setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
      fetchStats();
    } catch {
      // silently fail
    }
  };

  const exportCsv = () => {
    const headers = ['Date', 'Transaction ID', 'Customer', 'Method', 'Amount', 'Currency', 'Status', 'Booking'];
    const rows = payments.map((p) => [
      new Date(p.createdAt).toISOString(),
      p.transactionId,
      p.user?.fullName || '',
      p.method,
      String(p.amount),
      p.currency,
      p.status,
      p.booking?.bookingCode || '',
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card hover={false}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(Number(stats.totalCompleted), 'BDT')}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>
          <Card hover={false}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Transactions</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-brand-600" />
              </div>
            </div>
          </Card>
          <Card hover={false}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold mt-1">{stats.byStatus?.completed || 0}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>
          <Card hover={false}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Failed / Pending</p>
                <p className="text-2xl font-bold mt-1">{(stats.byStatus?.failed || 0) + (stats.byStatus?.pending || 0)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {stats && Object.keys(stats.byMethod).length > 0 && (
        <Card hover={false}>
          <h3 className="font-semibold mb-3">By Payment Method</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(stats.byMethod).map(([method, count]) => (
              <div key={method} className="bg-gray-50 dark:bg-surface-container rounded-lg p-3">
                <p className="text-xs text-gray-500">{METHOD_LABELS[method] || method}</p>
                <p className="text-lg font-bold">{count}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search transaction ID..."
              className="pl-9 w-full sm:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') fetchPayments(1); }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); fetchPayments(1); }}
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-surface-container"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={methodFilter}
            onChange={(e) => { setMethodFilter(e.target.value); setPage(1); fetchPayments(1); }}
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-surface-container"
          >
            <option value="">All Methods</option>
            <option value="bkash">bKash</option>
            <option value="bank_transfer">Bank transfer</option>
            <option value="cash">Cash</option>
            <option value="nagad">Nagad</option>
            <option value="sslcommerz">SSLCommerz</option>
            <option value="stripe">Stripe</option>
            <option value="rocket">Rocket</option>
            <option value="upay">Upay</option>
          </select>
        </div>
        <Button variant="outline" size="md" className="gap-2" onClick={exportCsv}>
          <Download className="w-4 h-4" /> Export
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
        </div>
      )}

      {error && !loading && (
        <Card hover={false}>
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button variant="outline" onClick={() => fetchPayments(page)}>Retry</Button>
          </div>
        </Card>
      )}

      {!loading && !error && (
        <Card hover={false} padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 bg-gray-50 dark:bg-surface-container/50">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Transaction ID</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Booking</th>
                  <th className="p-4 font-medium">Method</th>
                  <th className="p-4 font-medium">Receipt</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-gray-500">
                      <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No payments found</p>
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="p-4 text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 font-mono text-xs">
                        <div>{p.bkashTrxId || p.transactionId}</div>
                        {p.invoice && <div className="text-[10px] text-gray-400 mt-1">{p.invoice.invoiceNumber}</div>}
                      </td>
                      <td className="p-4 text-sm">
                        <div>
                          <p className="font-medium">{p.user?.fullName || '—'}</p>
                          <p className="text-xs text-gray-500">{p.user?.email}</p>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-xs">
                        {(p.booking?.bookingCode || p.hajjUmrahBooking?.bookingCode) ? (
                          <a className="text-brand-600 hover:underline" href={`/admin/bookings`}>{p.booking?.bookingCode || p.hajjUmrahBooking?.bookingCode}</a>
                        ) : '—'}
                      </td>
                      <td className="p-4">
                        <Badge variant="info">{METHOD_LABELS[p.method] || p.method}</Badge>
                        {p.bankAccount && <div className="text-[10px] text-gray-400 mt-1">{p.bankAccount.bankName}</div>}
                      </td>
                      <td className="p-4">
                        {p.receiptUrls && p.receiptUrls.length > 0 ? (
                          <div className="flex gap-1">
                            {p.receiptUrls.slice(0, 3).map((url) => (
                              <a key={url} href={url} target="_blank" rel="noreferrer" className="block w-10 h-10 rounded overflow-hidden border border-gray-200">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} alt="receipt" className="w-full h-full object-cover" />
                              </a>
                            ))}
                          </div>
                        ) : '—'}
                      </td>
                      <td className="p-4 font-medium">{formatCurrency(Number(p.amount), p.currency)}</td>
                      <td className="p-4">
                        <select
                          value={p.status}
                          onChange={(e) => handleStatusUpdate(p.id, e.target.value)}
                          className="text-xs border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-surface-container"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                          <option value="failed">Failed</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800">
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { setPage(page - 1); fetchPayments(page - 1); }}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => { setPage(page + 1); fetchPayments(page + 1); }}>Next</Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
