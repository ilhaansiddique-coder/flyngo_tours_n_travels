'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { clientApi } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

export function ResetPasswordForm({
  initialEmail,
  initialToken,
}: {
  initialEmail: string;
  initialToken: string;
}) {
  const { lang } = useI18n();
  const bn = lang === 'bn';
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState(initialToken);
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    if (data.newPassword !== data.confirm) {
      setState('error');
      setMessage(bn ? 'পাসওয়ার্ড দুটি মিলছে না।' : 'Passwords do not match.');
      return;
    }
    setState('loading');
    try {
      const res = await clientApi<{ success: boolean; message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, token, newPassword: data.newPassword }),
      });
      setState('done');
      setMessage(res.message);
    } catch (err) {
      setState('error');
      setMessage((err as Error).message);
    }
  };

  if (state === 'done') {
    return (
      <div className="rounded-2xl border border-black/5 bg-white p-8 text-center shadow-[var(--shadow-card)]">
        <CheckCircle2 size={44} className="mx-auto text-[var(--color-primary)]" />
        <h1 className="mt-4 text-2xl font-bold">{bn ? 'পাসওয়ার্ড বদলেছে!' : 'Password updated!'}</h1>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{message}</p>
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
    <div className="rounded-2xl border border-black/5 bg-white p-8 shadow-[var(--shadow-card)]">
      <h1 className="text-2xl font-bold">{bn ? 'নতুন পাসওয়ার্ড' : 'Choose a new password'}</h1>
      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
        {bn ? 'আপনার অ্যাকাউন্টের জন্য নতুন পাসওয়ার্ড দিন।' : 'Set a new password for your account.'}
      </p>
      <div className="mt-6 space-y-4">
        <label className="block text-sm font-semibold">
          {bn ? 'ইমেইল' : 'Email'}
          <input name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={Boolean(initialEmail)} className="mt-1.5 w-full rounded-xl border border-black/10 px-4 py-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] disabled:bg-[var(--color-mist)]" />
        </label>
        <label className="block text-sm font-semibold">
          {bn ? 'রিসেট টোকেন' : 'Reset token'}
          <input name="token" required value={token} onChange={(e) => setToken(e.target.value)} disabled={Boolean(initialToken)} className="mt-1.5 w-full rounded-xl border border-black/10 px-4 py-3 font-mono text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] disabled:bg-[var(--color-mist)]" />
        </label>
        <label className="block text-sm font-semibold">
          {bn ? 'নতুন পাসওয়ার্ড' : 'New password'}
          <input name="newPassword" type="password" required minLength={6} className="mt-1.5 w-full rounded-xl border border-black/10 px-4 py-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]" />
        </label>
        <label className="block text-sm font-semibold">
          {bn ? 'নতুন পাসওয়ার্ড আবার' : 'Confirm new password'}
          <input name="confirm" type="password" required minLength={6} className="mt-1.5 w-full rounded-xl border border-black/10 px-4 py-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]" />
        </label>
      </div>
      <button
        type="submit"
        disabled={state === 'loading'}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--color-primary-dark)] disabled:opacity-70"
      >
        {state === 'loading' ? <Loader2 size={16} className="animate-spin" /> : null}
        {state === 'loading' ? (bn ? 'হালনাগাদ হচ্ছে…' : 'Updating…') : bn ? 'পাসওয়ার্ড বদলান' : 'Update password'}
      </button>
      {state === 'error' ? <p className="mt-4 text-sm text-[var(--color-crimson)]">{message}</p> : null}
    </div>
  );
}