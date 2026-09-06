'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { clientApi } from '@/lib/api';
import { PasswordInput } from '@/components/password-input';
import { setSession, type SessionUser } from '@/lib/session';
import { useI18n } from '@/lib/i18n';

export function SignupForm() {
  const { lang } = useI18n();
  const bn = lang === 'bn';
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState('loading');
    try {
      const res = await clientApi<{ success: boolean; token: string; user: SessionUser }>(
        '/auth/signup',
        {
          method: 'POST',
          body: JSON.stringify({
            name: data.name,
            email: data.email || undefined,
            phone: data.phone,
            password: data.password,
          }),
        },
      );
      setSession(res.token, res.user);
      router.push('/account');
    } catch (err) {
      setState('error');
      setMessage((err as Error).message);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-black/5 bg-white p-8 shadow-[var(--shadow-card)]">
      <h1 className="text-2xl font-bold">{bn ? 'সাইন আপ' : 'Create account'}</h1>
      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
        {bn ? 'সদস্য পোর্টালে প্রবেশের জন্য একাউন্ট তৈরি করুন।' : 'Create an account for the member portal.'}
      </p>
      <div className="mt-6 grid gap-4">
        <label className="block text-sm font-semibold">
          {bn ? 'পূর্ণ নাম' : 'Full name'}
          <input name="name" required className="mt-1.5 w-full rounded-xl border border-black/10 px-4 py-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]" />
        </label>
        <label className="block text-sm font-semibold">
          {bn ? 'মোবাইল নম্বর' : 'Mobile number'}
          <input name="phone" type="tel" required className="mt-1.5 w-full rounded-xl border border-black/10 px-4 py-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]" />
        </label>
        <label className="block text-sm font-semibold">
          {bn ? 'ইমেইল (ঐচ্ছিক)' : 'Email (optional)'}
          <input name="email" type="email" className="mt-1.5 w-full rounded-xl border border-black/10 px-4 py-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]" />
        </label>
        <label className="block text-sm font-semibold">
          {bn ? 'পাসওয়ার্ড' : 'Password'}
          <PasswordInput name="password" required minLength={6} className="mt-1.5 w-full rounded-xl border border-black/10 px-4 py-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]" />
        </label>
      </div>
      <button
        type="submit"
        disabled={state === 'loading'}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--color-primary-dark)] disabled:opacity-70"
      >
        {state === 'loading' ? <Loader2 size={16} className="animate-spin" /> : null}
        {state === 'loading' ? (bn ? 'তৈরি হচ্ছে…' : 'Creating…') : bn ? 'সাইন আপ' : 'Sign up'}
      </button>
      {message ? <p className="mt-4 text-sm text-[var(--color-crimson)]">{message}</p> : null}
      <p className="mt-6 text-center text-sm text-[var(--color-ink-soft)]">
        {bn ? 'ইতিমধ্যে একাউন্ট আছে?' : 'Already have an account?'}{' '}
        <Link href="/login" className="font-semibold text-[var(--color-royal)] hover:underline">
          {bn ? 'সাইন ইন করুন' : 'Sign in'}
        </Link>
      </p>
    </form>
  );
}