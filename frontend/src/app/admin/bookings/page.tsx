'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog, Modal, FormField, FormInput, FormSelect, FormTextarea } from '@/components/admin/ui';
import { useApi } from '@/hooks/use-api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Search, Plus, Eye, Trash2, RotateCcw, Copy, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BookingUser {
  fullName: string;
  email: string;
  accountStatus?: string;
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
  customerName?: string | null;
  customerPhone?: string | null;
  user?: BookingUser | null;
  payments?: any[];
  // Flow-specific answers: the visa application (passport, DOB, purpose,
  // document checklist) or the custom-quote brief. Without this the booking
  // detail showed only a name and phone, and staff had to call the customer
  // back for details they had already filled in.
  meta?: Record<string, string | number | boolean> | null;
}

// Turn a meta key into something readable: doc_bank -> "Bank", placeOfBirth ->
// "Place of birth".
function formatMetaLabel(key: string): string {
  const withoutPrefix = key.startsWith('doc_') ? key.slice(4) : key;
  const spaced = withoutPrefix.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
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

// Types the admin can create a booking for (item picker). hajj/umrah are
// created through their own package flow, so they're intentionally excluded.
const BOOKING_TYPES = [
  { label: 'Tour', value: 'tour' },
  { label: 'Hotel', value: 'hotel' },
  { label: 'Flight', value: 'flight' },
  { label: 'Visa', value: 'visa' },
  { label: 'Transport', value: 'transport' },
  { label: 'Package', value: 'package' },
];

// Booking-type filter chips (includes hajj/umrah/transport so those rows can be filtered).
const TYPE_FILTERS = [
  { label: 'All types', value: 'all' },
  { label: 'Tour', value: 'tour' },
  { label: 'Hotel', value: 'hotel' },
  { label: 'Flight', value: 'flight' },
  { label: 'Visa', value: 'visa' },
  { label: 'Transport', value: 'transport' },
  { label: 'Hajj', value: 'hajj' },
  { label: 'Umrah', value: 'umrah' },
  { label: 'Package', value: 'package' },
] as const;
type TypeFilter = (typeof TYPE_FILTERS)[number]['value'];

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

const GUEST_TEMP_PASSWORD = '12345678';

function isGuestAccount(b: Booking): boolean {
  return !!(b.customerPhone && (b.user?.accountStatus === 'provisional' || b.user?.accountStatus === 'invited'));
}

async function copyGuestCredentials(b: Booking, setCopiedId: (id: string | null) => void) {
  const name = b.customerName || b.user?.fullName || '';
  const phone = b.customerPhone || '';
  const text = `Name: ${name}\nPhone: ${phone}\nPassword: ${GUEST_TEMP_PASSWORD}`;
  try {
    await navigator.clipboard.writeText(text);
    setCopiedId(b.id);
    setTimeout(() => setCopiedId(null), 2000);
  } catch {
    // Fallback: create a temporary textarea
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    setCopiedId(b.id);
    setTimeout(() => setCopiedId(null), 2000);
  }
}

export default function BookingsPage() {
  const { getBookings, updateBookingStatus, adminCreateBooking, getUsers, getTours, getHotels, getFlights, getVisaServices, getTransport,
    deleteBooking, getTrashedBookings, restoreBooking, purgeBooking } = useApi();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [meta, setMeta] = useState<BookingsMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  // Trash view: soft-deleted bookings, restorable or purgeable.
  const [viewTrash, setViewTrash] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);
  const [purgeTarget, setPurgeTarget] = useState<Booking | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        if (viewTrash) {
          const result = (await getTrashedBookings({ page: String(page), limit: '10' })) as any;
          setBookings(result?.items ?? result?.data ?? []);
          setMeta(result?.meta ?? null);
          return;
        }
        const params: Record<string, string> = { page: String(page), per_page: '10' };
        if (statusFilter !== 'all') params.status = statusFilter;
        if (typeFilter !== 'all') params.type = typeFilter;

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
  }, [getBookings, getTrashedBookings, page, statusFilter, typeFilter, viewTrash, refreshKey]);

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

  // Trash actions — delete moves to trash (reversible); purge is permanent.
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBooking(deleteTarget.id);
      setDeleteTarget(null);
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      setError(err.message || 'Failed to delete booking');
      setDeleteTarget(null);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreBooking(id);
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      setError(err.message || 'Failed to restore booking');
    }
  };

  const handlePurge = async () => {
    if (!purgeTarget) return;
    try {
      await purgeBooking(purgeTarget.id);
      setPurgeTarget(null);
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      setError(err.message || 'Failed to permanently delete booking');
      setPurgeTarget(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await updateBookingStatus(cancelTarget.id, 'cancelled');
      setBookings((prev) =>
        prev.map((b) => (b.id === cancelTarget.id ? { ...b, status: 'cancelled' } : b)),
      );
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
      else if (type === 'transport') res = await getTransport({ limit: '200' });
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
      if (typeFilter !== 'all') params.type = typeFilter;
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
    ? bookings.filter((b) => {
        const q = searchQuery.toLowerCase();
        return [
          b.bookingCode,
          b.customerName,
          b.customerPhone,
          b.user?.fullName,
          b.user?.email,
        ].some((v) => (v || '').toLowerCase().includes(q));
      })
    : bookings;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-on-surface-variant">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2 flex-wrap">
          {!viewTrash && STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => { setStatusFilter(f); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                statusFilter === f
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
          {viewTrash && (
            <span className="px-3 py-1.5 text-sm text-on-surface-variant">
              Deleted bookings — restore them or delete permanently.
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <Input
              placeholder="Search bookings..."
              className="pl-9 w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            size="md"
            variant={viewTrash ? 'primary' : 'outline'}
            className="gap-2"
            onClick={() => { setViewTrash((v) => !v); setPage(1); }}
          >
            <Trash2 className="w-4 h-4" /> {viewTrash ? 'Back to bookings' : 'Trash'}
          </Button>
          {!viewTrash && (
            <Button size="md" className="gap-2" onClick={openCreateModal}>
              <Plus className="w-4 h-4" /> New Booking
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TYPE_FILTERS.map((t) => (
          <button
            key={t.value}
            onClick={() => { setTypeFilter(t.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              typeFilter === t.value
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card hover={false} padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-on-surface-variant bg-surface-container-low">
                <th className="p-4 font-medium">Code</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Start Date</th>
                <th className="p-4 font-medium">Credentials</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-outline-variant hover:bg-surface-container-high"
                >
                  <td className="p-4 font-mono text-xs">{b.bookingCode}</td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{b.customerName || b.user?.fullName || '—'}</p>
                      <p className="text-xs text-on-surface-variant">{b.customerPhone || b.user?.email || ''}</p>
                    </div>
                  </td>
                  <td className="p-4 capitalize">{b.bookingType}</td>
                  <td className="p-4 font-medium">{formatCurrency(Number(b.totalAmount), b.currency || 'BDT')}</td>
                  <td className="p-4">{statusBadge(b.status)}</td>
                  <td className="p-4 text-on-surface-variant">{formatDate(b.startDate)}</td>
                  <td className="p-4">
                    {isGuestAccount(b) ? (
                      <button
                        onClick={() => copyGuestCredentials(b, setCopiedId)}
                        className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        title={`Copy credentials for ${b.customerName || b.user?.fullName || 'guest'}`}
                      >
                        {copiedId === b.id ? (
                          <><Check className="w-3.5 h-3.5" /> Copied!</>
                        ) : (
                          <><Copy className="w-3.5 h-3.5" /> Copy</>
                        )}
                      </button>
                    ) : (
                      <span className="text-xs text-on-surface-variant">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => setDetailTarget(b)}
                        className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-primary"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {viewTrash ? (
                        <>
                          <button
                            onClick={() => handleRestore(b.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg text-primary hover:bg-surface-container-high"
                            title="Restore this booking"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Restore
                          </button>
                          <button
                            onClick={() => setPurgeTarget(b)}
                            className="px-2 py-1 text-xs font-medium rounded-lg text-error hover:bg-danger-soft"
                            title="Delete permanently"
                          >
                            Delete forever
                          </button>
                        </>
                      ) : (
                        <>
                          <select
                            value={b.status}
                            onChange={(e) => handleStatusChange(b.id, e.target.value)}
                            className="text-xs border border-outline-variant rounded-lg px-2 py-1 bg-surface-container text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none"
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
                            className="px-2 py-1 text-xs font-medium rounded-lg text-error hover:bg-danger-soft disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => setDeleteTarget(b)}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-danger-soft hover:text-error"
                            title="Move to trash"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-on-surface-variant">
                    {viewTrash ? 'Trash is empty — no deleted bookings.' : 'No bookings found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {meta && (
          <div className="flex items-center justify-between p-4 border-t border-outline-variant">
            <p className="text-sm text-on-surface-variant">
              Showing {bookings.length} of {meta.total} bookings
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={meta.current_page <= 1}
                className="px-3 py-1 rounded-lg text-sm bg-surface-container-high hover:bg-surface-container-highest text-on-surface disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <span className="px-3 py-1 rounded-lg text-sm bg-primary text-on-primary">
                {meta.current_page}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, meta.last_page))}
                disabled={meta.current_page >= meta.last_page}
                className="px-3 py-1 rounded-lg text-sm bg-surface-container-high hover:bg-surface-container-highest text-on-surface disabled:opacity-50 disabled:cursor-not-allowed"
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

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Move booking to trash"
        message={`Move booking ${deleteTarget?.bookingCode} to the trash? It will be hidden from the list but you can restore it from Trash. Any loyalty points it awarded are reversed.`}
      />

      <ConfirmDialog
        open={!!purgeTarget}
        onClose={() => setPurgeTarget(null)}
        onConfirm={handlePurge}
        title="Delete permanently"
        message={`Permanently delete booking ${purgeTarget?.bookingCode}? This cannot be undone — the booking and its payment records will be removed for good.`}
      />

      {/* Detail Modal */}
      <Modal open={!!detailTarget} onClose={() => setDetailTarget(null)} title={`Booking ${detailTarget?.bookingCode ?? ''}`}>
        {detailTarget && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-on-surface-variant text-xs">Status</p>
                <div className="mt-1">{statusBadge(detailTarget.status)}</div>
              </div>
              <div>
                <p className="text-on-surface-variant text-xs">Type</p>
                <p className="font-medium capitalize">{detailTarget.bookingType}</p>
              </div>
              <div>
                <p className="text-on-surface-variant text-xs">Customer</p>
                <p className="font-medium">{detailTarget.customerName || detailTarget.user?.fullName || '—'}</p>
                <p className="text-on-surface-variant text-xs">{detailTarget.customerPhone || detailTarget.user?.email || ''}</p>
              </div>
              <div>
                <p className="text-on-surface-variant text-xs">Guests</p>
                <p className="font-medium">{detailTarget.guests}</p>
              </div>
              <div>
                <p className="text-on-surface-variant text-xs">Start Date</p>
                <p className="font-medium">{formatDate(detailTarget.startDate)}</p>
              </div>
              <div>
                <p className="text-on-surface-variant text-xs">End Date</p>
                <p className="font-medium">{detailTarget.endDate ? formatDate(detailTarget.endDate) : '—'}</p>
              </div>
              <div>
                <p className="text-on-surface-variant text-xs">Total Amount</p>
                <p className="font-bold text-lg">{formatCurrency(Number(detailTarget.totalAmount), detailTarget.currency || 'BDT')}</p>
              </div>
              <div>
                <p className="text-on-surface-variant text-xs">Paid Amount</p>
                <p className="font-medium">{formatCurrency(Number(detailTarget.paidAmount || 0), detailTarget.currency || 'BDT')}</p>
              </div>
            </div>
            {isGuestAccount(detailTarget) && (
              <div>
                <p className="text-on-surface-variant text-xs mb-1">Guest Credentials</p>
                <div className="bg-surface-container p-3 rounded-lg space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant">Password</span>
                    <span className="font-mono font-medium">{GUEST_TEMP_PASSWORD}</span>
                  </div>
                  <button
                    onClick={() => copyGuestCredentials(detailTarget, setCopiedId)}
                    className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors"
                  >
                    {copiedId === detailTarget.id ? (
                      <><Check className="w-3.5 h-3.5" /> Copied!</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copy Name + Phone + Password</>
                    )}
                  </button>
                </div>
              </div>
            )}
            {detailTarget.notes && (
              <div>
                <p className="text-on-surface-variant text-xs">Notes</p>
                <p className="text-sm bg-surface-container p-2 rounded-lg mt-1">{detailTarget.notes}</p>
              </div>
            )}
            {detailTarget.meta && Object.keys(detailTarget.meta).length > 0 && (
              <div>
                <p className="text-on-surface-variant text-xs mb-1">
                  {detailTarget.bookingType === 'visa' ? 'Visa application' : 'Request details'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 bg-surface-container p-3 rounded-lg">
                  {Object.entries(detailTarget.meta).map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-3 text-xs">
                      <span className="text-on-surface-variant">{formatMetaLabel(key)}</span>
                      <span className="font-medium text-on-surface text-right break-words">
                        {/* Document checklist entries are stored as 'yes'. */}
                        {key.startsWith('doc_') ? (value === 'yes' ? '✓' : '—') : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {detailTarget.payments && detailTarget.payments.length > 0 && (
              <div>
                <p className="text-on-surface-variant text-xs mb-1">Payments</p>
                <div className="space-y-1">
                  {detailTarget.payments.map((p: any) => (
                    <div key={p.id} className="flex justify-between text-xs bg-surface-container p-2 rounded">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
            <Button variant="outline" type="button" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" loading={createSubmitting}>Create Booking</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
