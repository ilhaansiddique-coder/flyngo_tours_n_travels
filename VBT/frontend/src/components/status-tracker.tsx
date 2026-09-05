'use client';

import { useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { clientApi } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface StatusResult {
  memberId: string;
  category: string;
  categoryLabelEn?: string;
  categoryLabelBn?: string;
  fee?: string | number | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote?: string | null;
  createdAt: string;
}

export function StatusTracker() {
  const { lang } = useI18n();
  const bn = lang === 'bn';
  const [ref, setRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StatusResult | null>(null);
  const [error, setError] = useState('');

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ref.trim()) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await clientApi<StatusResult>(
        `/public/members/status/${encodeURIComponent(ref.trim())}`,
      );
      setData(res);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const chip = data ? (
    data.status === 'APPROVED' ? (
      <span className="rounded-full bg-[var(--color-primary-light)] px-3 py-1 text-xs font-bold text-[var(--color-primary-dark)]">
        {bn ? 'অনুমোদিত' : 'Approved'}
      </span>
    ) : data.status === 'REJECTED' ? (
      <span className="rounded-full bg-[var(--color-crimson-light)] px-3 py-1 text-xs font-bold text-[var(--color-crimson)]">
        {bn ? 'বাতিল' : 'Rejected'}
      </span>
    ) : (
      <span className="rounded-full bg-[var(--color-gold-lighter)] px-3 py-1 text-xs font-bold text-[var(--color-gold-deep)]">
        {bn ? 'বিবেচনাধীন' : 'Pending review'}
      </span>
    )
  ) : null;

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-[var(--shadow-card)]">
      <h3 className="flex items-center gap-2 text-lg font-bold">
        <Search size={18} className="text-[var(--color-primary)]" />
        {bn ? 'আবেদনের স্থিতি দেখুন' : 'Check your application status'}
      </h3>
      <form onSubmit={lookup} className="mt-4 flex gap-2">
        <input
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          placeholder={bn ? 'সদস্য রেফারেন্স লিখুন (VBT-XXXXXX)' : 'Enter member reference (VBT-XXXXXX)'}
          className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-royal)] px-5 py-3 text-sm font-bold text-white hover:bg-[var(--color-royal-dark)] disabled:opacity-70"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {bn ? 'অনুসন্ধান' : 'Track'}
        </button>
      </form>
      {error ? <p className="mt-3 text-sm text-[var(--color-crimson)]">{error}</p> : null}
      {data ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[var(--color-mist)] p-4">
          <div>
            <p className="font-mono text-lg font-bold text-[var(--color-royal)]">{data.memberId}</p>
            <p className="text-sm text-[var(--color-ink-soft)]">{bn ? data.categoryLabelBn || data.category : data.categoryLabelEn}</p>
            {data.adminNote ? (
              <p className="mt-1 text-xs italic text-[var(--color-ink-muted)]">{data.adminNote}</p>
            ) : null}
          </div>
          {chip}
        </div>
      ) : null}
    </div>
  );
}