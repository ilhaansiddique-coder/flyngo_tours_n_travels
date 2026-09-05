'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Loader2, Users } from 'lucide-react';
import { adminFetch } from '@/lib/admin-api';

interface Stats {
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
}

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  donor: 'Donor',
  lifetime: 'Lifetime',
  volunteer: 'Volunteer',
};

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    adminFetch<Stats>('/admin/members/stats').then(setStats).catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-black/5 bg-white p-16 text-[var(--color-ink-soft)] shadow-[var(--shadow-card)]">
        <Loader2 size={18} className="animate-spin" /> Loading…
      </div>
    );
  }

  const statusCards = [
    { key: 'PENDING', label: 'Pending review', cls: 'bg-[var(--color-gold-lighter)] text-[var(--color-gold-deep)]' },
    { key: 'APPROVED', label: 'Approved', cls: 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]' },
    { key: 'REJECTED', label: 'Rejected', cls: 'bg-[var(--color-crimson-light)] text-[var(--color-crimson)]' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/admin/members" className="text-sm font-semibold text-[var(--color-royal)] hover:underline">
          Review members →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--color-ink-soft)]">Total members</span>
            <Users size={18} className="text-[var(--color-primary)]" />
          </div>
          <p className="mt-2 text-3xl font-bold">{stats.total}</p>
        </div>
        {statusCards.map((c) => (
          <div key={c.key} className="rounded-2xl border border-black/5 bg-white p-5 shadow-[var(--shadow-card)]">
            <span className="text-sm font-semibold text-[var(--color-ink-soft)]">{c.label}</span>
            <p className={`mt-2 inline-block rounded-full px-3 py-0.5 text-2xl font-bold ${c.cls}`}>
              {stats.byStatus[c.key] ?? 0}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-lg font-bold">By category</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {Object.entries(stats.byCategory).map(([key, count]) => (
            <div key={key} className="flex items-center gap-2 rounded-xl bg-[var(--color-mist)] px-4 py-2.5">
              <span className="text-sm font-semibold text-[var(--color-ink-soft)]">
                {CATEGORY_LABELS[key] ?? key}
              </span>
              <span className="text-lg font-bold text-[var(--color-primary-dark)]">{count}</span>
            </div>
          ))}
          {Object.keys(stats.byCategory).length === 0 ? (
            <p className="text-sm text-[var(--color-ink-muted)]">No members yet.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}