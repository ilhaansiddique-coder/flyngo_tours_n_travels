'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog, Modal, FormField, FormInput, FormSelect, FormTextarea } from '@/components/admin/ui';
import { useApi } from '@/hooks/use-api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BookOpen, Filter, Search, Plus, Eye, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BookingUser {
  fullName: string;
  email: string;
}

interface Booking {
  id: string;
  bookingCode: string;
  bookingType: string;
  status: string;
  startDate: string;
  endDate?: string;
  guests: number;
  totalAmount: number;
  currency: string;
  paidAmount: number;
  notes?: string;
  user: BookingUser;
  payments?: any[];
}

interface BookingsMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

interface BookingsResponse {
  data: Booking[];
  meta: BookingsMeta;
}

interface User {
  id: string;
  fullName: string;
  email: string;
}

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const AVAILABLE_STATUSES = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const BOOKING_TYPES = [
  { label: 'Tour', value: 'tour' },
  { label: 'Hotel', value: 'hotel' },
  { label: 'Flight', value: 'flight' },
  { label: 'Visa', value: 'visa' },
  { label: 'Package', value: 'package' },
];

function statusBadge(status: string) {
  const map: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'default'> = {
    confirmed: 'success',
    pending: 'warning',
    in_progress: 'info',
    completed: 'info',
    cancelled: 'danger',
  };
  return <Badge variant={map[status] || 'default'}>{status.replace('_', ' ')}</Badge>;
}

export default function BookingsPage() {
  const { getBookings, updateBookingStatus, cancelBooking, adminCreateBooking, getUsers, getTours, getHotels, getFlights, getVisaServices } = useApi();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [meta, setMeta] = useState<BookingsMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  const [detailTarget, setDetailTarget] = useState<Booking | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    userId: '',
    type: 'tour',
    itemId: '',
    startDate: '',
    endDate: '',
    guests: '1',
    totalAmount: '',
    notes: '',
  });
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const [userOptions, setUserOptions] = useState<{ label: string; value: string }[]>([]);
  const [itemOptions, setItemOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = { page: String(page), per_page: '10' };
        if (statusFilter !== 'all') params.status = statusFilter;

        const result = (await getBookings(params)) as BookingsResponse;
        setBookings(result.data ?? []);
        setMeta(result.meta ?? null);
      } catch (err: any) {
        setError(err.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [getBookings, page, statusFilter]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateBookingStatus(id, status);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b)),
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update booking');
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await cancelBooking(cancelTarget.id);
      setBookings((prev) => prev.filter((b) => b.id !== cancelTarget.id));
      setCancelTarget(null);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel booking');
    }
  };

  const fetchUserOptions = async () => {
    try {
      const res = await getUsers({ limit: '200' });
      const data = res as any;
      const users: User[] = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
      setUserOptions(users.map((u) => ({ label: `${u.fullName} (${u.email})`, value: u.id })));
    } catch {
      // silently fail
    }
  };

  const fetchItemOptions = async (type: string) => {
    try {
      let res: any;
      if (type === 'tour') res = await getTours({ limit: '200' });
      else if (type === 'hotel') res = await getHotels({ limit: '200' });
      else if (type === 'flight') res = await getFlights({ limit: '200' });
      else if (type === 'visa') res = await getVisaServices();
      else { setItemOptions([]); return; }
      const data = res as any;
      const items = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
      setItemOptions(items.map((it: any) => ({
        label: it.title || it.name || it.flightNumber || `${it.originCode} → ${it.destinationCode}`,
        value: it.id,
      })));
    } catch {
      setItemOptions([]);
    }
  };

  const openCreateModal = async () => {
    setCreateForm({
      userId: userOptions[0]?.value || '',
      type: 'tour',
      itemId: '',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      guests: '1',
      totalAmount: '',
      notes: '',
    });
    setCreateOpen(true);
    await fetchUserOptions();
    await fetchItemOptions('tour');
  };

  const handleCreateTypeChange = async (newType: string) => {
    setCreateForm({ ...createForm, type: newType, itemId: '' });
    await fetchItemOptions(newType);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSubmitting(true);
    try {
      const body: any = {
        userId: createForm.userId,
        type: createForm.type,
        itemId: createForm.itemId,
        startDate: createForm.startDate,
        guests: Number(createForm.guests),
        notes: createForm.notes || undefined,
        totalAmount: createForm.totalAmount ? Number(createForm.totalAmount) : 0,
      };
      if (createForm.endDate) body.endDate = createForm.endDate;
      await adminCreateBooking(body);
      setCreateOpen(false);
      const params: Record<string, string> = { page: '1', per_page: '10' };
      if (statusFilter !== 'all') params.status = statusFilter;
      const result = (await getBookings(params)) as BookingsResponse;
      setBookings(result.data ?? []);
      setMeta(result.meta ?? null);
    } catch {
      // silently fail
    } finally {
      setCreateSubmitting(false);
    }
  };

  const filtered = searchQuery
    ? bookings.filter(
        (b) =>
          b.bookingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.user.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : bookings;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-500">Loading bookings...</p>
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => { setStatusFilter(f); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                statusFilter === f
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search bookings..."
              className="pl-9 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button size="md" className="gap-2" onClick={openCreateModal}>
            <Plus className="w-4 h-4" /> New Booking
          </Button>
        </div>
      </div>

      <Card hover={false} padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                <th className="p-4 font-medium">Code</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Start Date</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                >
                  <td className="p-4 font-mono text-xs">{b.bookingCode}</td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{b.user?.fullName}</p>
                      <p className="text-xs text-gray-500">{b.user?.email}</p>
                    </div>
                  </td>
                  <td className="p-4 capitalize">{b.bookingType}</td>
                  <td className="p-4 font-medium">{formatCurrency(Number(b.totalAmount), b.currency || 'BDT')}</td>
                  <td className="p-4">{statusBadge(b.status)}</td>
                  <td className="p-4 text-gray-500">{formatDate(b.startDate)}</td>
                  <td className="p-4">
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => setDetailTarget(b)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <select
                        value={b.status}
                        onChange={(e) => handleStatusChange(b.id, e.target.value)}
                        className="text-xs border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                      >
                        {AVAILABLE_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => setCancelTarget(b)}
                        disabled={b.status === 'cancelled'}
                        className="px-2 py-1 text-xs font-medium rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {meta && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500">
              Showing {bookings.length} of {meta.total} bookings
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={meta.current_page <= 1}
                className="px-3 py-1 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <span className="px-3 py-1 rounded-lg text-sm bg-brand-600 text-white">
                {meta.current_page}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, meta.last_page))}
                disabled={meta.current_page >= meta.last_page}
                className="px-3 py-1 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Cancel Booking"
        message={`Are you sure you want to cancel booking ${cancelTarget?.bookingCode}? This action cannot be undone.`}
      />

      {/* Detail Modal */}
      <Modal open={!!detailTarget} onClose={() => setDetailTarget(null)} title={`Booking ${detailTarget?.bookingCode ?? ''}`}>
        {detailTarget && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-gray-500 text-xs">Status</p>
                <div className="mt-1">{statusBadge(detailTarget.status)}</div>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Type</p>
                <p className="font-medium capitalize">{detailTarget.bookingType}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Customer</p>
                <p className="font-medium">{detailTarget.user?.fullName}</p>
                <p className="text-gray-500 text-xs">{detailTarget.user?.email}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Guests</p>
                <p className="font-medium">{detailTarget.guests}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Start Date</p>
                <p className="font-medium">{formatDate(detailTarget.startDate)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">End Date</p>
                <p className="font-medium">{detailTarget.endDate ? formatDate(detailTarget.endDate) : '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Total Amount</p>
                <p className="font-bold text-lg">{formatCurrency(Number(detailTarget.totalAmount), detailTarget.currency || 'BDT')}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Paid Amount</p>
                <p className="font-medium">{formatCurrency(Number(detailTarget.paidAmount || 0), detailTarget.currency || 'BDT')}</p>
              </div>
            </div>
            {detailTarget.notes && (
              <div>
                <p className="text-gray-500 text-xs">Notes</p>
                <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded-lg mt-1">{detailTarget.notes}</p>
              </div>
            )}
            {detailTarget.payments && detailTarget.payments.length > 0 && (
              <div>
                <p className="text-gray-500 text-xs mb-1">Payments</p>
                <div className="space-y-1">
                  {detailTarget.payments.map((p: any) => (
                    <div key={p.id} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      <span className="font-mono">{p.transactionId}</span>
                      <span className="capitalize">{p.method}</span>
                      <span>{formatCurrency(Number(p.amount), p.currency)}</span>
                      <Badge variant={p.status === 'completed' ? 'success' : 'warning'}>{p.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Booking (Admin)">
        <form onSubmit={handleCreateSubmit} className="space-y-2">
          <FormField label="Customer" required>
            <FormSelect
              value={createForm.userId}
              onChange={(v) => setCreateForm({ ...createForm, userId: v })}
              placeholder="Select customer"
              options={userOptions}
            />
          </FormField>
          <FormField label="Booking Type" required>
            <FormSelect
              value={createForm.type}
              onChange={handleCreateTypeChange}
              options={BOOKING_TYPES}
            />
          </FormField>
          <FormField label="Item" required>
            <FormSelect
              value={createForm.itemId}
              onChange={(v) => setCreateForm({ ...createForm, itemId: v })}
              placeholder="Select item"
              options={itemOptions}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start Date" required>
              <FormInput
                type="date"
                value={createForm.startDate}
                onChange={(v) => setCreateForm({ ...createForm, startDate: v })}
                required
              />
            </FormField>
            <FormField label="End Date">
              <FormInput
                type="date"
                value={createForm.endDate}
                onChange={(v) => setCreateForm({ ...createForm, endDate: v })}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Guests" required>
              <FormInput
                type="number"
                value={createForm.guests}
                onChange={(v) => setCreateForm({ ...createForm, guests: v })}
                required
              />
            </FormField>
            <FormField label="Total Amount (BDT)">
              <FormInput
                type="number"
                value={createForm.totalAmount}
                onChange={(v) => setCreateForm({ ...createForm, totalAmount: v })}
                placeholder="0"
              />
            </FormField>
          </div>
          <FormField label="Notes">
            <FormTextarea
              value={createForm.notes}
              onChange={(v) => setCreateForm({ ...createForm, notes: v })}
              placeholder="Optional internal notes"
              rows={2}
            />
          </FormField>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button variant="outline" type="button" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" loading={createSubmitting}>Create Booking</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
