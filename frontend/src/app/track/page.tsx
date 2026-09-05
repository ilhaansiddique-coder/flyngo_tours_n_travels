'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { useFormatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Search, PackageCheck, Clock, CheckCircle2, XCircle, Loader2, Ticket, Banknote } from 'lucide-react';

interface TrackedBooking {
  bookingCode: string;
  bookingType: string;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  totalAmount: number | string;
  paidAmount?: number | string;
  currency: string;
}

// The normal progression; "cancelled" is handled separately.
const STEPS = [
  { key: 'pending', label: 'Submitted', Icon: Clock },
  { key: 'confirmed', label: 'Confirmed', Icon: PackageCheck },
  { key: 'completed', label: 'Completed', Icon: CheckCircle2 },
];

export default function TrackPage() {
  const { trackBooking } = useApi();
  const fmt = useFormatCurrency();
  const [code, setCode] = useState('');
  const [booking, setBooking] = useState<TrackedBooking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = async (raw: string) => {
    const c = raw.trim();
    if (!c) return;
    setLoading(true);
    setError(null);
    setBooking(null);
    try {
      const res = (await trackBooking(c)) as TrackedBooking;
      setBooking(res);
    } catch {
      setError(`No booking found for "${c}". Check the code from your confirmation.`);
    } finally {
      setLoading(false);
    }
  };

  // Deep-link support: /track?code=FLY-XXXX auto-looks-up on load.
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('code');
    if (c) {
      setCode(c);
      lookup(c);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancelled = booking?.status === 'cancelled';
  const activeIdx = booking ? Math.max(0, STEPS.findIndex((s) => s.key === booking.status)) : -1;
  const paid = Number(booking?.paidAmount || 0);
  const due = booking ? Math.max(0, Number(booking.totalAmount) - paid) : 0;

  return (
    <main className="min-h-screen surface-page pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full text-[10px] uppercase tracking-widest font-bold text-primary border border-primary/30 bg-primary/5">
            <Ticket className="w-3 h-3" /> Track your booking
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface">Where&apos;s my booking?</h1>
          <p className="text-muted mt-2">Enter the <span className="font-mono font-semibold">FLY-</span> code from your confirmation.</p>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); lookup(code); }}
          className="flex gap-2 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. FLY-XXXX-XXXX"
              className="w-full pl-10 pr-3 py-3 rounded-xl border border-outline-variant bg-surface-container/60 text-on-surface font-mono uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-[var(--color-on-primary)] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-tertiary))' }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Track'}
          </button>
        </form>

        {error && (
          <div className="rounded-xl border border-error/30 bg-error-container px-4 py-3 text-sm text-on-error-container text-center">
            {error}
          </div>
        )}

        {booking && (
          <div className="rounded-2xl border border-outline-variant glass p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-muted">Booking</div>
                <div className="font-mono text-lg font-bold text-on-surface">{booking.bookingCode}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest font-bold text-muted capitalize">{booking.bookingType}</div>
                <div className="font-display text-lg font-bold text-on-surface">{fmt(Number(booking.totalAmount), booking.currency)}</div>
              </div>
            </div>

            {cancelled ? (
              <div className="flex items-center gap-3 rounded-xl bg-error-container/60 px-4 py-4 text-on-error-container">
                <XCircle className="w-6 h-6 shrink-0" />
                <div>
                  <div className="font-semibold">This booking was cancelled</div>
                  <div className="text-sm opacity-80">Contact support if you think this is a mistake.</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                {STEPS.map((s, i) => {
                  const done = i <= activeIdx;
                  const Icon = s.Icon;
                  return (
                    <div key={s.key} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className="w-11 h-11 rounded-full flex items-center justify-center transition-colors"
                          style={done
                            ? { background: 'linear-gradient(135deg, var(--color-primary), var(--color-tertiary))', color: 'var(--color-on-primary)' }
                            : { backgroundColor: 'var(--color-surface-container)', color: 'var(--color-on-surface-variant)' }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-xs font-semibold ${done ? 'text-on-surface' : 'text-muted'}`}>{s.label}</span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div
                          className="flex-1 h-0.5 mx-2"
                          style={{ backgroundColor: i < activeIdx ? 'var(--color-primary)' : 'color-mix(in oklab, var(--color-on-surface) 12%, transparent)' }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {!cancelled && (
              <div
                className={`mt-6 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 ${
                  due > 0 ? 'border border-error/30 bg-error-container/40' : 'border border-success/30 bg-success-container/40'
                }`}
              >
                <div className="text-sm">
                  <span className="text-muted">
                    {due > 0 ? 'Balance due: ' : 'Paid: '}
                  </span>
                  <span className="font-bold text-on-surface">
                    {fmt(due > 0 ? due : paid, booking?.currency)}
                  </span>
                  {due > 0 && paid > 0 && (
                    <span className="text-xs text-muted ml-2">({fmt(paid, booking?.currency)} paid)</span>
                  )}
                </div>
                {due > 0 && (
                  <Link
                    href={`/pay/${encodeURIComponent(booking?.bookingCode || '')}`}
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-[var(--color-on-primary)]"
                    style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-tertiary))' }}
                  >
                    <Banknote className="w-4 h-4" /> Pay now
                  </Link>
                )}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-outline-variant grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted">Booked</span><div className="font-medium text-on-surface">{formatDate(booking.createdAt)}</div></div>
              {booking.startDate && <div><span className="text-muted">Travel</span><div className="font-medium text-on-surface">{formatDate(booking.startDate)}{booking.endDate ? ` → ${formatDate(booking.endDate)}` : ''}</div></div>}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
