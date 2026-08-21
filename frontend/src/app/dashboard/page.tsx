'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApi } from '@/hooks/use-api';
import { useAuthStore } from '@/stores/auth.store';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import {
  User, Mail, Phone, Calendar, MapPin, Heart, Receipt, CreditCard,
  CheckCircle2, Clock, XCircle, LogOut, Edit3, FileText, Plane, Building2, Compass,
  Gift,
} from 'lucide-react';
import {
  COUNTRY_DIALS,
  DEFAULT_COUNTRY_CODE,
  findDialByCode,
} from '@/lib/country-dial-codes';

type Tab = 'bookings' | 'profile' | 'saved' | 'invoices';

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
  createdAt: string;
}

interface Profile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: { name: string; code: string };
  createdAt: string;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  transactionId: string;
  createdAt: string;
  booking: { id: string; bookingCode: string; bookingType: string; totalAmount: number; currency: string };
}

const STATUS_STYLES: Record<string, { label: string; cls: string; icon: typeof CheckCircle2 }> = {
  pending:    { label: 'Pending',    cls: 'text-amber-600 bg-amber-500/10 border-amber-500/30', icon: Clock },
  confirmed:  { label: 'Confirmed',  cls: 'text-blue-600 bg-blue-500/10 border-blue-500/30',     icon: CheckCircle2 },
  in_progress:{ label: 'In progress',cls: 'text-purple-600 bg-purple-500/10 border-purple-500/30', icon: Plane },
  completed:  { label: 'Completed',  cls: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle2 },
  cancelled:  { label: 'Cancelled',  cls: 'text-red-600 bg-red-500/10 border-red-500/30',         icon: XCircle },
};

const TYPE_ICONS: Record<string, typeof Compass> = {
  tour: Compass,
  hotel: Building2,
  flight: Plane,
  visa: FileText,
  package: Heart,
};

function splitPhone(value: string): { code: string; number: string } {
  const matched = COUNTRY_DIALS.find((c) => value.startsWith(c.dial + ' ') || value.startsWith(c.dial));
  if (matched) {
    const rest = value.startsWith(matched.dial + ' ')
      ? value.slice(matched.dial.length + 1)
      : value.slice(matched.dial.length);
    return { code: matched.code, number: rest.trim() };
  }
  return { code: DEFAULT_COUNTRY_CODE, number: value };
}

function PhoneCountryRow({
  defaultValue,
  onChange,
}: {
  defaultValue: string;
  onChange: (code: string, combined: string) => void;
}) {
  const initial = splitPhone(defaultValue);
  const [code, setCode] = useState(initial.code);
  const [number, setNumber] = useState(initial.number);

  useEffect(() => {
    const dial = findDialByCode(code)?.dial ?? '';
    const combined = number.trim() ? `${dial} ${number.trim()}` : '';
    onChange(code, combined);
  }, [code, number, onChange]);

  return (
    <div className="flex gap-2">
      <select
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-32 px-2 py-2 rounded-md border bg-surface text-sm"
        style={{ borderColor: 'var(--color-outline-variant)' }}
        aria-label="Country code"
      >
        {COUNTRY_DIALS.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.dial}
          </option>
        ))}
      </select>
      <input
        type="tel"
        placeholder="Phone number"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        className="flex-1 px-3 py-2 rounded-md border bg-surface text-sm"
        style={{ borderColor: 'var(--color-outline-variant)' }}
      />
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { getMyBookings, getMyProfile, getMyPayments, cancelMyBooking, updateMyProfile } = useApi();
  const [tab, setTab] = useState<Tab>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const phoneHiddenRef = useRef<HTMLInputElement | null>(null);
  const phoneFormRef = useRef<string>('');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    Promise.all([getMyBookings().catch(() => []), getMyProfile().catch(() => null), getMyPayments().catch(() => [])])
      .then(([b, p, pay]) => {
        setBookings(Array.isArray(b) ? b : (b as any)?.items ?? []);
        setProfile(p as Profile | null);
        setPayments(Array.isArray(pay) ? pay : []);
      })
      .finally(() => setLoading(false));
  }, [user, router, getMyBookings, getMyProfile, getMyPayments]);

  if (!user) return null;

  const tabs: { key: Tab; label: string; Icon: typeof Calendar; count?: number }[] = [
    { key: 'bookings', label: 'My bookings', Icon: Calendar, count: bookings.length },
    { key: 'invoices', label: 'Invoices', Icon: Receipt, count: payments.length },
    { key: 'profile', label: 'Profile', Icon: User },
    { key: 'saved', label: 'Saved', Icon: Heart },
  ];

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this booking?')) return;
    await cancelMyBooking(id);
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: 'cancelled' } : b));
  };

  const handleProfileSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const phoneFromForm = phoneFormRef.current || String(fd.get('phone') ?? '');
    const body = { fullName: String(fd.get('fullName') ?? ''), phone: phoneFromForm };
    const updated = await updateMyProfile(body);
    setProfile((p) => p ? { ...p, ...(updated as Profile) } : (updated as Profile));
    alert('Profile updated');
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-16 max-w-[1200px] mx-auto">
      {/* Header card */}
      <div className="rounded-2xl border glass p-6 mb-6" style={{ borderColor: 'var(--color-outline-variant)' }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary) 100%)' }}
            >
              {user.fullName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">{user.fullName}</h1>
              <p className="text-sm text-muted flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" /> {user.email}
              </p>
              <p className="text-xs text-muted mt-1 capitalize">Role: {user.role}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard/refer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-accent text-on-primary hover:opacity-90"
              style={{ background: 'var(--color-accent)', color: 'var(--color-on-primary)' }}
            >
              <Gift className="w-4 h-4" /> Refer & Earn
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border"
              style={{ borderColor: 'var(--color-outline-variant)', color: 'var(--color-on-surface)' }}
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b" style={{ borderColor: 'var(--color-outline-variant)' }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors',
              tab === t.key
                ? 'border-current'
                : 'border-transparent text-muted hover:text-on-surface',
            )}
            style={tab === t.key ? { color: 'var(--color-nav-active)' } : undefined}
          >
            <t.Icon className="w-4 h-4" />
            {t.label}
            {t.count != null && t.count > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: 'color-mix(in oklab, var(--color-primary) 14%, transparent)' }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-muted">Loading…</p>}

      {/* Bookings tab */}
      {!loading && tab === 'bookings' && (
        <div>
          {bookings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No bookings yet"
              description="When you book a tour, hotel, flight or visa service, it will appear here."
              cta="Start exploring"
              href="/"
            />
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => {
                const status = STATUS_STYLES[b.status] ?? STATUS_STYLES.pending;
                const TypeIcon = TYPE_ICONS[b.bookingType] ?? Compass;
                const StatusIcon = status.icon;
                return (
                  <div key={b.id} className="rounded-2xl border glass p-5" style={{ borderColor: 'var(--color-outline-variant)' }}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <span
                          className="w-10 h-10 rounded-xl inline-flex items-center justify-center shrink-0"
                          style={{ backgroundColor: 'color-mix(in oklab, var(--color-primary) 14%, transparent)' }}
                        >
                          <TypeIcon className="w-5 h-5" style={{ color: 'var(--color-nav-active)' }} />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-muted">{b.bookingType}</span>
                            <span className="text-[10px] text-muted">·</span>
                            <span className="text-[10px] text-muted font-mono">{b.bookingCode}</span>
                          </div>
                          <div className="text-sm font-semibold">
                            {formatDate(b.startDate)}{b.endDate ? ` → ${formatDate(b.endDate)}` : ''} · {b.guests} guest{b.guests === 1 ? '' : 's'}
                          </div>
                          <div className="text-xs text-muted mt-1">Booked on {formatDate(b.createdAt)}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-lg font-bold">{formatCurrency(b.totalAmount, b.currency)}</div>
                        <div className="text-[10px] text-muted">Paid: {formatCurrency(b.paidAmount, b.currency)}</div>
                        <span className={cn('mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border', status.cls)}>
                          <StatusIcon className="w-3 h-3" /> {status.label}
                        </span>
                        {b.status !== 'cancelled' && b.status !== 'completed' && (
                          <button
                            onClick={() => handleCancel(b.id)}
                            className="block mt-2 text-[10px] text-red-500 hover:underline"
                          >
                            Cancel booking
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Invoices tab */}
      {!loading && tab === 'invoices' && (
        <div>
          {payments.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No invoices yet"
              description="Your payment receipts and invoices will show up here once you've paid for a booking."
              cta="Browse tours"
              href="/tours"
            />
          ) : (
            <div className="space-y-3">
              {payments.map((p) => (
                <div key={p.id} className="rounded-2xl border glass p-5" style={{ borderColor: 'var(--color-outline-variant)' }}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-muted" />
                      <div>
                        <div className="font-semibold">{formatCurrency(p.amount, p.currency)}</div>
                        <div className="text-xs text-muted font-mono">{p.transactionId} · {p.method}</div>
                        <div className="text-xs text-muted">For {p.booking.bookingType} booking {p.booking.bookingCode}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border',
                        p.status === 'completed' ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30'
                          : p.status === 'pending' ? 'text-amber-600 bg-amber-500/10 border-amber-500/30'
                          : p.status === 'failed' ? 'text-red-600 bg-red-500/10 border-red-500/30'
                          : 'text-muted border-current',
                      )}>
                        {p.status}
                      </span>
                      <div className="text-xs text-muted mt-1">{formatDate(p.createdAt)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Profile tab */}
      {!loading && tab === 'profile' && (
        <form onSubmit={handleProfileSave} className="rounded-2xl border glass p-6 space-y-4 max-w-xl" style={{ borderColor: 'var(--color-outline-variant)' }}>
          <h2 className="font-display text-xl font-bold flex items-center gap-2"><Edit3 className="w-5 h-5" /> Edit profile</h2>
          <div>
            <label className="block text-xs uppercase tracking-widest font-bold text-muted mb-1">Email</label>
            <input value={profile?.email ?? user.email} disabled className="w-full px-3 py-2 rounded-md border bg-on-surface-soft text-sm" style={{ borderColor: 'var(--color-outline-variant)' }} />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest font-bold text-muted mb-1">Full name</label>
            <input name="fullName" defaultValue={profile?.fullName ?? user.fullName} className="w-full px-3 py-2 rounded-md border bg-surface text-sm" style={{ borderColor: 'var(--color-outline-variant)' }} />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest font-bold text-muted mb-1">Phone</label>
            <PhoneCountryRow
              defaultValue={profile?.phone ?? ''}
              onChange={(_, combined) => {
                phoneFormRef.current = combined;
              }}
            />
            <input
              ref={(el) => {
                if (el) phoneHiddenRef.current = el;
              }}
              type="hidden"
              name="phone"
              defaultValue={profile?.phone ?? ''}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest font-bold text-muted mb-1">Member since</label>
            <input value={profile?.createdAt ? formatDate(profile.createdAt) : '—'} disabled className="w-full px-3 py-2 rounded-md border bg-on-surface-soft text-sm" style={{ borderColor: 'var(--color-outline-variant)' }} />
          </div>
          <button type="submit" className="px-5 py-2 rounded-full text-sm font-semibold text-white" style={{ background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary) 100%)' }}>
            Save changes
          </button>
        </form>
      )}

      {/* Saved tab */}
      {!loading && tab === 'saved' && (
        <EmptyState
          icon={Heart}
          title="No saved items yet"
          description="Tap the heart icon on any tour, hotel, flight or visa service to save it for later."
          cta="Explore tours"
          href="/tours"
        />
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, cta, href }: { icon: typeof Calendar; title: string; description: string; cta: string; href: string }) {
  return (
    <div className="rounded-2xl border glass p-12 text-center" style={{ borderColor: 'var(--color-outline-variant)' }}>
      <div
        className="w-14 h-14 rounded-full inline-flex items-center justify-center mb-4"
        style={{ backgroundColor: 'color-mix(in oklab, var(--color-primary) 14%, transparent)' }}
      >
        <Icon className="w-6 h-6" style={{ color: 'var(--color-nav-active)' }} />
      </div>
      <h3 className="font-display text-lg font-bold mb-1">{title}</h3>
      <p className="text-sm text-muted max-w-md mx-auto mb-4">{description}</p>
      <Link
        href={href}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
        style={{ background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary) 100%)' }}
      >
        {cta}
      </Link>
    </div>
  );
}
