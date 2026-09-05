'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut, UserRound } from 'lucide-react';
import { clientApi } from '@/lib/api';
import { authHeaders, clearSession, getToken, type SessionUser } from '@/lib/session';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface MembershipRow {
  memberId: string;
  category: string;
  categoryLabelEn?: string;
  categoryLabelBn?: string;
  fee?: string | number | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

const STATUS_TEXT: Record<MembershipRow['status'], { en: string; bn: string; cls: string }> = {
  APPROVED: { en: 'Approved', bn: 'অনুমোদিত', cls: 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]' },
  REJECTED: { en: 'Rejected', bn: 'বাতিল', cls: 'bg-[var(--color-crimson-light)] text-[var(--color-crimson)]' },
  PENDING: { en: 'Pending review', bn: 'বিবেচনাধীন', cls: 'bg-[var(--color-gold-lighter)] text-[var(--color-gold-deep)]' },
};

export function AccountPanel() {
  const { lang } = useI18n();
  const bn = lang === 'bn';
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [members, setMembers] = useState<MembershipRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!authed) {
      setLoading(false);
      return;
    }
    Promise.allSettled([
      clientApi<SessionUser>('/auth/me', { headers: authHeaders() }),
      clientApi<MembershipRow[]>('/public/members/my', { headers: authHeaders() }),
    ]).then(([u, m]) => {
      if (u.status === 'fulfilled') setUser(u.value);
      if (m.status === 'fulfilled') setMembers(m.value);
      setLoading(false);
    });
  }, [authed]);

  const logout = () => {
    clearSession();
    setAuthed(false);
    setUser(null);
    setMembers([]);
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-black/5 bg-white p-16 text-[var(--color-ink-soft)] shadow-[var(--shadow-card)]">
        <Loader2 size={18} className="animate-spin" /> {bn ? 'লোড হচ্ছে…' : 'Loading…'}
      </div>
    );
  }

  if (!authed || !user) {
    return (
      <div className="rounded-2xl border border-black/5 bg-white p-10 text-center shadow-[var(--shadow-card)]">
        <UserRound size={44} className="mx-auto text-[var(--color-primary)]" />
        <h1 className="mt-4 text-2xl font-bold">{bn ? 'সাইন ইন প্রয়োজন' : 'Sign in required'}</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--color-ink-soft)]">
          {bn
            ? 'আপনার আবেদনের স্থিতি ও প্রোফাইল দেখতে সাইন ইন করুন।'
            : 'Sign in to view your profile and application status.'}
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--color-primary-dark)]"
        >
          {bn ? 'সাইন ইন করুন' : 'Sign in'}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/5 bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary-lighter)]">
            <span className="text-xl font-bold text-[var(--color-primary)]">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold">{user.name}</h1>
            <p className="text-sm text-[var(--color-ink-soft)]">
              {user.email}{user.phone ? ` • ${user.phone}` : ''}
            </p>
            <span className="mt-1 inline-block rounded-full bg-[var(--color-royal-light)] px-3 py-0.5 text-xs font-bold text-[var(--color-royal)]">
              {user.role}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold text-[var(--color-ink-soft)] hover:bg-[var(--color-mist)]"
        >
          <LogOut size={16} /> {bn ? 'সাইন আউট' : 'Sign out'}
        </button>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{bn ? 'আমার সদস্যপদ' : 'My memberships'}</h2>
          <Link href="/membership" className="text-sm font-semibold text-[var(--color-royal)] hover:underline">
            {bn ? '+ নতুন আবেদন' : '+ New application'}
          </Link>
        </div>
        {members.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--color-ink-soft)]">
            {bn ? 'কোনো আবেদন পাওয়া যায়নি।' : 'No applications yet.'}
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {members.map((m) => {
              const s = STATUS_TEXT[m.status];
              return (
                <div key={m.memberId} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/5 bg-[var(--color-mist)] p-4">
                  <div>
                    <p className="font-mono text-base font-bold text-[var(--color-royal)]">{m.memberId}</p>
                    <p className="text-sm text-[var(--color-ink-soft)]">
                      {bn ? m.categoryLabelBn || m.category : m.categoryLabelEn || m.category}
                      {typeof m.fee === 'number' || typeof m.fee === 'string' ? ` • ৳${Number(m.fee).toLocaleString()}` : ''}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={cn('rounded-full px-3 py-1 text-xs font-bold', s.cls)}>
                    {bn ? s.bn : s.en}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}