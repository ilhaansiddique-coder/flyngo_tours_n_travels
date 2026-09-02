'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useApi } from '@/hooks/use-api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Moon, Search, Phone, Mail, Users, Calendar, Plane, BadgeCheck } from 'lucide-react';

interface Pilgrim {
  id: string;
  fullName: string;
  passportNumber: string;
  gender: string;
  mahramRelation?: string | null;
}

interface HUBooking {
  id: string;
  kind: string; // hajj | umrah
  packageTitle: string;
  departureDate: string;
  returnDate?: string | null;
  occupancyType: string;
  numPilgrims: number;
  totalAmount: number | string;
  currency: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  pilgrims?: Pilgrim[];
  user?: { fullName?: string; email?: string; phone?: string } | null;
  // Captured on the booking itself, so guest bookings still have a contact.
  bookingCode?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
}

const STATUSES = [
  { value: 'pending', label: 'Pending', variant: 'default' as const },
  { value: 'confirmed', label: 'Confirmed', variant: 'info' as const },
  { value: 'paid', label: 'Paid', variant: 'cyan' as const },
  { value: 'completed', label: 'Completed', variant: 'success' as const },
  { value: 'cancelled', label: 'Cancelled', variant: 'danger' as const },
];

export default function AdminHajjUmrahBookingsPage() {
  const { getHajjUmrahBookings, updateHajjUmrahBookingStatus } = useApi();
  const [items, setItems] = useState<HUBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState('');
  const [filter, setFilter] = useState('');

  const load = () => {
    setLoading(true);
    getHajjUmrahBookings({ limit: '100' })
      .then((r: any) => setItems(r?.items ?? r?.data ?? []))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter((b) => {
    if (kind && b.kind !== kind) return false;
    if (filter && b.status !== filter) return false;
    if (search) {
      const hay = `${b.packageTitle} ${b.bookingCode ?? ''} ${b.customerName ?? ''} ${b.customerPhone ?? ''} ${b.customerEmail ?? ''} ${b.user?.fullName ?? ''} ${b.user?.email ?? ''} ${b.user?.phone ?? ''} ${(b.pilgrims ?? []).map((p) => p.fullName).join(' ')}`.toLowerCase();
      if (!hay.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const setStatus = async (id: string, status: string) => {
    await updateHajjUmrahBookingStatus(id, status);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Hajj &amp; Umrah Bookings</h1>
        <p className="text-sm text-muted">{items.length} booking{items.length === 1 ? '' : 's'} · confirming a booking awards the buyer loyalty points</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by package, pilgrim, customer…" />
        </div>
        <select className="px-3 py-2 rounded-md border bg-surface text-sm" value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="">All types</option>
          <option value="hajj">Hajj</option>
          <option value="umrah">Umrah</option>
        </select>
        <select className="px-3 py-2 rounded-md border bg-surface text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-muted">No hajj/umrah bookings yet.</Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => {
            const statusMeta = STATUSES.find((s) => s.value === b.status) ?? STATUSES[0];
            return (
              <Card key={b.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Moon className="w-4 h-4 text-emerald-500" />
                      <h3 className="font-semibold">{b.packageTitle}</h3>
                      <Badge variant={b.kind === 'hajj' ? 'success' : 'cyan'}>{b.kind === 'hajj' ? 'Hajj' : 'Umrah'}</Badge>
                      <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                      <Badge variant="default">{b.paymentStatus}</Badge>
                      {b.bookingCode && <span className="font-mono text-xs text-muted">{b.bookingCode}</span>}
                      {!b.user && <Badge variant="default">Guest</Badge>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                      {/* Booking-level contact wins: it's what the customer typed, and
                          it's the only contact a guest booking has. */}
                      <div className="flex items-center gap-1.5"><BadgeCheck className="w-3.5 h-3.5 text-muted" /> {b.customerName || b.user?.fullName || '—'}</div>
                      <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-muted" /> {b.customerPhone || b.user?.phone || '—'}</div>
                      {(b.customerEmail || b.user?.email) && <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-muted" /> {b.customerEmail || b.user?.email}</div>}
                      <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-muted" /> {b.numPilgrims} pilgrim{b.numPilgrims === 1 ? '' : 's'} · {b.occupancyType}</div>
                      <div className="flex items-center gap-1.5"><Plane className="w-3.5 h-3.5 text-muted" /> {formatDate(b.departureDate)}{b.returnDate ? ` → ${formatDate(b.returnDate)}` : ''}</div>
                      <div className="flex items-center gap-1.5 text-muted"><Calendar className="w-3.5 h-3.5" /> Booked {formatDate(b.createdAt)}</div>
                      <div className="font-semibold text-on-surface">{formatCurrency(Number(b.totalAmount), b.currency)}</div>
                    </div>
                    {Array.isArray(b.pilgrims) && b.pilgrims.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {b.pilgrims.map((p) => (
                          <span key={p.id} className="px-2 py-0.5 rounded-md text-xs bg-surface-container border border-outline-variant">
                            {p.fullName} · {p.passportNumber}{p.gender === 'female' && p.mahramRelation ? ` · mahram: ${p.mahramRelation}` : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-muted">Update status</label>
                    <select
                      className="px-2 py-1.5 rounded-md border bg-surface text-sm"
                      value={b.status}
                      onChange={(e) => setStatus(b.id, e.target.value)}
                    >
                      {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
