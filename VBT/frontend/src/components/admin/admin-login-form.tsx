'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { PasswordInput } from '@/components/password-input';
import { adminFetch, setAdminToken } from '@/lib/admin-api';

export function AdminLoginForm() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    setState('loading');
    try {
      const res = await adminFetch<{ success: boolean; token: string; admin: { name?: string } }>(
        '/admin/auth/login',
        { method: 'POST', body: JSON.stringify({ email: data.email, password: data.password }) },
      );
      setAdminToken(res.token);
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setState('error');
      setMessage((err as Error).message);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-black/5 bg-white p-8 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-royal)] text-white">
          <ShieldCheck size={22} />
        </span>
        <div>
          <h1 className="text-xl font-bold">Volunteer Bangladesh Trust Admin</h1>
          <p className="text-sm text-[var(--color-ink-soft)]">Sign in to the dashboard</p>
        </div>
      </div>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm font-semibold">
          Email
          <input name="email" type="email" required defaultValue="admin@vbt.world" className="mt-1.5 w-full rounded-xl border border-black/10 px-4 py-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--color-royal-light)]" />
        </label>
        <label className="block text-sm font-semibold">
          Password
          <PasswordInput name="password" required className="mt-1.5 w-full rounded-xl border border-black/10 px-4 py-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--color-royal-light)]" />
        </label>
        <button
          type="submit"
          disabled={state === 'loading'}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-royal)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--color-royal-dark)] disabled:opacity-70"
        >
          {state === 'loading' ? <Loader2 size={16} className="animate-spin" /> : null}
          {state === 'loading' ? 'Signing in…' : 'Sign in'}
        </button>
        {message ? <p className="text-sm text-[var(--color-crimson)]">{message}</p> : null}
      </form>
    </div>
  );
}