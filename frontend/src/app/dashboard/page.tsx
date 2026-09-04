'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApi } from '@/hooks/use-api';
import { useAuthStore } from '@/stores/auth.store';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { BOOKING_STATUSES } from '@/lib/booking-statuses';
import {
  User, Mail, Phone, Calendar, MapPin, Heart, Receipt, CreditCard,
  CheckCircle2, Clock, XCircle, X, LogOut, Edit3, FileText, Plane, Building2, Compass,
  Gift, Trophy, Upload, Download, Trash2, Camera, Image as ImageIcon, Loader2,
} from 'lucide-react';
import TierBadge from '@/components/ui/tier-badge';
import { InvoiceShareMenu } from '@/components/shared/invoice-share-menu';
import {
  COUNTRY_DIALS,
  DEFAULT_COUNTRY_CODE,
  findDialByCode,
} from '@/lib/country-dial-codes';

type Tab = 'bookings' | 'profile' | 'documents' | 'saved' | 'invoices';

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
  address?: string;
  avatarUrl?: string;
  role: { name: string; code: string };
  createdAt: string;
}

interface UserDoc {
  id: string;
  url: string;
  filename: string;
  mimeType?: string | null;
  kind: string;
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
  paid:       { label: 'Paid',       cls: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle2 },
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
  const { user, logout, hasHydrated } = useAuthStore();
  const {
    getMyBookings, getMyProfile, getMyPayments, getMyInvoices, getInvoice, sendInvoiceEmail, openInvoicePdf, cancelMyBooking, updateMyProfile, getLoyaltyOverview,
    uploadMyAvatar, getMyDocuments, uploadMyDocument, deleteMyDocument,
  } = useApi();
  const [tab, setTab] = useState<Tab>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<{ id: string; invoiceNumber: string; total: number; currency: string; status: string; issuedAt: string; booking?: { bookingCode: string } | null }[]>([]);
  const [loyalty, setLoyalty] = useState<{
    lifetimePoints: number;
    availablePoints: number;
    pendingPoints: number;
    tier: { name?: string | null; color?: string | null; starCount?: number } | null;
    nextTier: { name?: string | null } | null;
    pointsToNext?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<UserDoc[]>([]);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [docBusy, setDocBusy] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    danger?: boolean;
    resolve: (v: boolean) => void;
  } | null>(null);
  const phoneHiddenRef = useRef<HTMLInputElement | null>(null);
  const phoneFormRef = useRef<string>('');

  // Promise-based confirmation → replaces the native window.confirm dialog.
  const askConfirm = (opts: { title: string; message: string; confirmLabel: string; danger?: boolean }) =>
    new Promise<boolean>((resolve) => setConfirmState({ ...opts, resolve }));

  useEffect(() => {
    // Wait for the persisted auth cookie to hydrate before deciding anything —
    // a page reload renders the store pre-hydration for one frame, which would
    // otherwise bounce an already-logged-in user to /auth/login.
    if (!hasHydrated) return;
    if (user) {
      Promise.all([
        getMyBookings().catch(() => []),
        getMyProfile().catch(() => null),
        getMyPayments().catch(() => []),
        getMyInvoices().catch(() => []),
        getLoyaltyOverview().catch(() => null),
        getMyDocuments().catch(() => []),
      ])
        .then(([b, p, pay, inv, loy, docs]) => {
          setBookings(Array.isArray(b) ? b : (b as any)?.items ?? []);
          setProfile(p as Profile | null);
          setPayments(Array.isArray(pay) ? pay : []);
          setInvoices(Array.isArray(inv) ? inv : (inv as any)?.items ?? []);
          setLoyalty((loy as typeof loyalty) ?? null);
          setDocuments(Array.isArray(docs) ? (docs as UserDoc[]) : []);
        })
        .finally(() => setLoading(false));
    } else {
      router.push('/auth/login');
    }
  }, [user, hasHydrated, router, getMyBookings, getMyProfile, getMyPayments, getMyInvoices, getLoyaltyOverview, getMyDocuments]);

  if (!user) return null;

  const tabs: { key: Tab; label: string; Icon: typeof Calendar; count?: number }[] = [
    { key: 'bookings', label: 'My bookings', Icon: Calendar, count: bookings.length },
    { key: 'invoices', label: 'Invoices', Icon: Receipt, count: invoices.length || payments.length },
    { key: 'profile', label: 'Profile', Icon: User },
    { key: 'documents', label: 'Documents', Icon: FileText, count: documents.length },
    { key: 'saved', label: 'Saved', Icon: Heart },
  ];

  const handleCancel = async (id: string) => {
    if (!(await askConfirm({ title: 'Cancel booking?', message: 'This will cancel the selected booking. This cannot be undone.', confirmLabel: 'Cancel booking', danger: true }))) return;
    await cancelMyBooking(id);
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: 'cancelled' } : b));
  };

  const handleProfileSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileMsg(null);
    const fd = new FormData(e.currentTarget);
    const phoneFromForm = phoneFormRef.current || String(fd.get('phone') ?? '');
    const body = {
      fullName: String(fd.get('fullName') ?? ''),
      email: String(fd.get('email') ?? ''),
      phone: phoneFromForm,
      address: String(fd.get('address') ?? ''),
    };
    try {
      const updated = await updateMyProfile(body);
      setProfile((p) => p ? { ...p, ...(updated as Profile) } : (updated as Profile));
      setProfileMsg({ ok: true, text: 'Profile updated.' });
    } catch (err: any) {
      setProfileMsg({ ok: false, text: err?.message || 'Could not update your profile.' });
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setAvatarBusy(true);
    setProfileMsg(null);
    try {
      const res = (await uploadMyAvatar(file)) as { avatarUrl: string };
      setProfile((p) => (p ? { ...p, avatarUrl: res.avatarUrl } : p));
    } catch (err: any) {
      setProfileMsg({ ok: false, text: err?.message || 'Could not upload the image.' });
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!profile?.avatarUrl || avatarBusy) return;
    if (!(await askConfirm({ title: 'Remove profile picture?', message: 'Your current photo will be removed and replaced with your initials.', confirmLabel: 'Remove', danger: true }))) return;
    setAvatarBusy(true);
    setProfileMsg(null);
    try {
      await updateMyProfile({ avatarUrl: '' });
      setProfile((p) => (p ? { ...p, avatarUrl: undefined } : p));
    } catch (err: any) {
      setProfileMsg({ ok: false, text: err?.message || 'Could not remove the photo.' });
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setDocBusy(true);
    setProfileMsg(null);
    try {
      const doc = (await uploadMyDocument(file)) as UserDoc;
      setDocuments((prev) => [doc, ...prev]);
    } catch (err: any) {
      setProfileMsg({ ok: false, text: err?.message || 'Could not upload the file.' });
    } finally {
      setDocBusy(false);
    }
  };

  const handleDocDelete = async (id: string) => {
    if (!(await askConfirm({ title: 'Delete file?', message: 'This file will be permanently removed from your profile.', confirmLabel: 'Delete', danger: true }))) return;
    try {
      await deleteMyDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      setProfileMsg({ ok: false, text: err?.message || 'Could not delete the file. Please try again.' });
    }
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
            <div className="relative w-16 h-16 shrink-0">
              <label className="group block w-16 h-16 cursor-pointer" title="Upload / change profile picture">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white overflow-hidden"
                  style={{ background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary) 100%)' }}
                >
                  {profile?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    user.fullName?.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="absolute inset-0 rounded-full flex items-center justify-center bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity">
                  {avatarBusy ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
                </span>
                {/* Persistent edit badge so it's obvious the photo is uploadable */}
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full flex items-center justify-center shadow-md ring-2 ring-white dark:ring-slate-900"
                  style={{ background: 'var(--color-primary)' }}
                >
                  <Camera className="w-3 h-3 text-white" />
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={avatarBusy} />
              </label>
              {profile?.avatarUrl && (
                <button
                  type="button"
                  onClick={handleAvatarDelete}
                  disabled={avatarBusy}
                  title="Remove profile picture"
                  aria-label="Remove profile picture"
                  className="absolute -top-1 -right-1 z-10 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md ring-2 ring-white dark:ring-slate-900 disabled:opacity-50"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-accent text-on-accent hover:opacity-90"
              style={{ background: 'var(--color-accent)', color: 'var(--color-on-accent)' }}
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

      {/* Reward points (Refer & Earn). Every member starts at 100 signup points;
          each service purchase adds that product's points on top. */}
      <div
        className="mb-6 rounded-2xl border p-5"
        style={{
          borderColor: 'var(--color-outline-variant)',
          background: 'color-mix(in oklab, var(--color-primary) 7%, transparent)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wide text-muted">Available points</span>
              <span className="text-3xl font-display font-bold tabular-nums leading-none mt-1">
                {(loyalty?.availablePoints ?? 0).toLocaleString()}
              </span>
            </div>
            {loyalty?.tier?.name ? (
              <TierBadge name={loyalty.tier.name} color={loyalty.tier.color} starCount={loyalty.tier.starCount} size="lg" />
            ) : null}
          </div>
          <div className="flex items-center gap-5">
            <div className="text-center">
              <div className="font-bold tabular-nums">{(loyalty?.lifetimePoints ?? 0).toLocaleString()}</div>
              <div className="text-[11px] text-muted">Lifetime</div>
            </div>
            <div className="text-center">
              <div className="font-bold tabular-nums">{(loyalty?.pendingPoints ?? 0).toLocaleString()}</div>
              <div className="text-[11px] text-muted">Pending</div>
            </div>
            <Link
              href="/dashboard/loyalty"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold"
              style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
            >
              <Trophy className="w-4 h-4" /> View rewards
            </Link>
          </div>
        </div>
        {loyalty?.nextTier?.name && (loyalty?.pointsToNext ?? 0) > 0 ? (
          <p className="mt-3 text-xs text-muted">
            {loyalty.pointsToNext!.toLocaleString()} points to {loyalty.nextTier.name}
          </p>
        ) : null}
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
                        {b.status !== 'cancelled' && Number(b.paidAmount) < Number(b.totalAmount) && (
                          <Link href={`/pay/${encodeURIComponent(b.bookingCode)}`} className="block mt-2 text-[10px] text-brand-600 hover:underline">
                            Pay now
                          </Link>
                        )}
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
          {invoices.length === 0 && payments.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No invoices yet"
              description="Your payment receipts and invoices will show up here once you've paid for a booking."
              cta="Browse tours"
              href="/tours"
            />
          ) : (
            <div className="space-y-3">
              {invoices.map((inv) => (
                <div key={inv.id} className="rounded-2xl border glass p-5" style={{ borderColor: 'var(--color-outline-variant)' }}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Receipt className="w-5 h-5 text-muted" />
                      <div>
                        <div className="font-semibold font-mono">{inv.invoiceNumber}</div>
                        <div className="text-xs text-muted">{formatCurrency(Number(inv.total), inv.currency)} · {inv.booking?.bookingCode || ''}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border">{inv.status}</span>
                      <div className="mt-2 flex items-center justify-end gap-3">
                        <button
                          className="text-[10px] text-brand-600 hover:underline"
                          onClick={async () => {
                            const full = (await getInvoice(inv.id)) as { html?: string };
                            if (!full?.html) return;
                            const w = window.open('', '_blank');
                            if (!w) return;
                            w.document.write(full.html);
                            w.document.close();
                            w.print();
                          }}
                        >
                          Print
                        </button>
                        <InvoiceShareMenu
                          invoiceId={inv.id}
                          invoiceNumber={inv.invoiceNumber}
                          bookingCode={inv.booking?.bookingCode}
                          currency={inv.currency}
                          total={Number(inv.total)}
                          onSendEmail={sendInvoiceEmail}
                          onDownloadPdf={async (id) => {
                            await openInvoicePdf(id);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {payments.map((p) => (
                <div key={p.id} className="rounded-2xl border glass p-5" style={{ borderColor: 'var(--color-outline-variant)' }}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-muted" />
                      <div>
                        <div className="font-semibold">{formatCurrency(p.amount, p.currency)}</div>
                        <div className="text-xs text-muted font-mono">{p.transactionId} · {p.method}</div>
                        <div className="text-xs text-muted">For {p.booking?.bookingType} booking {p.booking?.bookingCode}</div>
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
            <label className="block text-xs uppercase tracking-widest font-bold text-muted mb-1">Full name</label>
            <input name="fullName" defaultValue={profile?.fullName ?? user.fullName} className="w-full px-3 py-2 rounded-md border bg-surface text-sm" style={{ borderColor: 'var(--color-outline-variant)' }} />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest font-bold text-muted mb-1">Email address <span className="text-muted/60 normal-case tracking-normal">(optional)</span></label>
            <input name="email" type="email" defaultValue={profile?.email ?? user.email ?? ''} placeholder="you@example.com" className="w-full px-3 py-2 rounded-md border bg-surface text-sm" style={{ borderColor: 'var(--color-outline-variant)' }} />
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
            <label className="block text-xs uppercase tracking-widest font-bold text-muted mb-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Home / location address</label>
            <textarea name="address" rows={2} defaultValue={profile?.address ?? ''} placeholder="House, road, area, city…" className="w-full px-3 py-2 rounded-md border bg-surface text-sm resize-none" style={{ borderColor: 'var(--color-outline-variant)' }} />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest font-bold text-muted mb-1">Member since</label>
            <input value={profile?.createdAt ? formatDate(profile.createdAt) : '—'} disabled className="w-full px-3 py-2 rounded-md border bg-on-surface-soft text-sm" style={{ borderColor: 'var(--color-outline-variant)' }} />
          </div>
          {profileMsg && (
            <p className={`text-sm rounded-md px-3 py-2 ${profileMsg.ok ? 'text-emerald-600 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'}`}>
              {profileMsg.text}
            </p>
          )}
          <button type="submit" className="px-5 py-2 rounded-full text-sm font-semibold text-white" style={{ background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary) 100%)' }}>
            Save changes
          </button>
        </form>
      )}

      {/* Documents & images — own tab (upload / download / delete) */}
      {!loading && tab === 'documents' && (
        <div className="rounded-2xl border glass p-6 max-w-xl" style={{ borderColor: 'var(--color-outline-variant)' }}>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="font-display text-xl font-bold flex items-center gap-2"><FileText className="w-5 h-5" /> Documents & images</h2>
            <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white cursor-pointer ${docBusy ? 'opacity-60 pointer-events-none' : ''}`} style={{ background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary) 100%)' }}>
              {docBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload
              <input type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv" className="hidden" onChange={handleDocUpload} disabled={docBusy} />
            </label>
          </div>
          <p className="text-xs text-muted mb-3">Passport, ID, tickets, photos… (images, PDF, Office docs — up to 10&nbsp;MB each)</p>
          {documents.length === 0 ? (
            <p className="text-sm text-muted py-6 text-center">No documents uploaded yet.</p>
          ) : (
            <ul className="space-y-2">
              {documents.map((d) => (
                <li key={d.id} className="flex items-center gap-3 rounded-xl border p-2.5" style={{ borderColor: 'var(--color-outline-variant)' }}>
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'color-mix(in oklab, var(--color-primary) 12%, transparent)', color: 'var(--color-primary)' }}>
                    {d.kind === 'image' ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{d.filename}</p>
                    <p className="text-[11px] text-muted">{formatDate(d.createdAt)}</p>
                  </div>
                  <a href={d.url} target="_blank" rel="noopener noreferrer" download className="p-2 rounded-lg hover:bg-surface-container-high text-muted hover:text-on-surface" title="Download">
                    <Download className="w-4 h-4" />
                  </a>
                  <button onClick={() => handleDocDelete(d.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-500" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Privacy & data — GDPR self-service */}
      {!loading && tab === 'profile' && (
        <PrivacySection />
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

      <ConfirmModal
        state={confirmState}
        onClose={(result) => {
          confirmState?.resolve(result);
          setConfirmState(null);
        }}
      />
    </div>
  );
}

function ConfirmModal({
  state,
  onClose,
}: {
  state: { title: string; message: string; confirmLabel: string; danger?: boolean } | null;
  onClose: (result: boolean) => void;
}) {
  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [state, onClose]);

  if (!state) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={() => onClose(false)}
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-sm rounded-2xl border p-6 shadow-2xl animate-fade-in glass"
        style={{ borderColor: 'var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container)' }}
      >
        <div className="flex items-start gap-3">
          <span
            className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${state.danger ? 'text-red-500 bg-red-500/12' : 'text-primary bg-primary/12'}`}
          >
            <XCircle className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-lg font-bold text-on-surface">{state.title}</h3>
            <p className="mt-1 text-sm text-muted">{state.message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onClose(false)}
            className="px-4 py-2 rounded-full text-sm font-semibold border transition-colors hover:bg-surface-container-high"
            style={{ borderColor: 'var(--color-outline-variant)', color: 'var(--color-on-surface)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onClose(true)}
            className={`px-4 py-2 rounded-full text-sm font-bold text-white transition-colors ${state.danger ? 'bg-red-500 hover:bg-red-600' : ''}`}
            style={state.danger ? undefined : { background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-tertiary) 100%)' }}
          >
            {state.confirmLabel}
          </button>
        </div>
      </div>
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

function PrivacySection() {
  const { exportMyData, deleteMyAccount } = useApi();
  const { logout } = useAuthStore();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportMyData() as { success: boolean; data: any };
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flyngo-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err?.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (confirmText !== 'DELETE MY ACCOUNT') {
      setDeleteError('Type DELETE MY ACCOUNT exactly to confirm.');
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteMyAccount({ confirmation: confirmText });
      // Server anonymized + soft-deleted us. Clear local session and bounce.
      logout();
      window.location.href = '/?account-deleted=1';
    } catch (err: any) {
      setDeleteError(err?.message || 'Deletion failed');
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-2xl border p-6 space-y-4 max-w-xl mt-6" style={{ borderColor: 'var(--color-outline-variant)' }}>
      <h2 className="font-display text-xl font-bold">Privacy & data</h2>
      <p className="text-sm text-muted">
        You can download every piece of personal data we hold on you, or request that we delete
        your account. Deletion anonymises your profile but keeps booking, payment and audit
        records for legal reasons.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="px-4 py-2 rounded-md text-sm font-semibold border"
          style={{ borderColor: 'var(--color-outline-variant)' }}
        >
          {exporting ? 'Preparing…' : 'Download my data (JSON)'}
        </button>
        <button
          type="button"
          onClick={() => { setShowConfirm((v) => !v); setDeleteError(null); }}
          className="px-4 py-2 rounded-md text-sm font-semibold text-white"
          style={{ background: 'var(--color-error, #dc2626)' }}
        >
          Delete my account
        </button>
      </div>

      {showConfirm && (
        <div className="rounded-md p-4 space-y-2 border" style={{ borderColor: 'var(--color-error, #dc2626)' }}>
          <p className="text-sm">
            To confirm, type <code className="font-mono">DELETE MY ACCOUNT</code> below. This
            cannot be undone.
          </p>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE MY ACCOUNT"
            className="w-full px-3 py-2 rounded-md border bg-surface text-sm font-mono"
            style={{ borderColor: 'var(--color-outline-variant)' }}
          />
          {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || confirmText !== 'DELETE MY ACCOUNT'}
              className="px-4 py-2 rounded-md text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: 'var(--color-error, #dc2626)' }}
            >
              {deleting ? 'Deleting…' : 'Confirm deletion'}
            </button>
            <button
              type="button"
              onClick={() => { setShowConfirm(false); setConfirmText(''); setDeleteError(null); }}
              className="px-4 py-2 rounded-md text-sm font-semibold border"
              style={{ borderColor: 'var(--color-outline-variant)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
