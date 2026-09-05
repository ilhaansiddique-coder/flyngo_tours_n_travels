'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { clientApi } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { BASE_PATH } from '@/lib/api';

export function ForgotPasswordForm() {
  const { lang } = useI18n();
  const bn = lang === 'bn';
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [resetToken, setResetToken] = useState('');

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState('loading');
    try {
      const res = await clientApi<{
        success: boolean;
        delivery?: 'dev' | 'email';
        resetToken?: string;
        message?: string;
      }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setResetToken(res.resetToken || '');
      setState('done');
      setMessage(
        res.message ||
          (bn
            ? 'পুনরায় সেট লিংক পাঠানো হয়েছে।'
            : 'A password reset link has been sent to your email.'),
      );
    } catch (err) {
      setState('error');
      setMessage((err as Error).message);
    }
  };

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-8 shadow-[var(--shadow-card)]">
      <h1 className="text-2xl font-bold">{bn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Reset your password'}</h1>
      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
        {bn
          ? 'আপনার ইমেইল দিন — আমরা একটি রিসেট টোকেন তৈরি করব।'
          : 'Enter your email and we will generate a reset token for you.'}
      </p>

      {state === 'done' && resetToken ? (
        <div className="mt-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary-dark)]">
            <CheckCircle2 size={16} /> {bn ? 'টোকেন তৈরি হয়েছে (ডেভ মোড)' : 'Token generated (dev mode)'}
          </p>
          <p className="mt-3 text-xs text-[var(--color-ink-soft)]">
            {bn
              ? 'এই পরিবেশে SMTP কনফিগার করা নেই, তাই টোকেন নিচে দেখানো হলো:'
              : 'No SMTP is configured in this environment, so your token is shown below:'}
          </p>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-[var(--color-mist)] p-4 font-mono text-xs text-[var(--color-ink)]">{resetToken}</pre>
          <a
            href={`${BASE_PATH}/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(resetToken)}`}
            className="mt-4 inline-block rounded-xl bg-[var(--color-royal)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--color-royal-dark)]"
          >
            {bn ? 'এখানে ক্লিক করে পাসওয়ার্ড বদলান' : 'Click here to reset your password'}
          </a>
          <p className="mt-3 text-xs text-[var(--color-ink-muted)]">
            {bn ? 'অথবা নিচের রিসেট পেজে টোকেন ও ইমেইল বসান।' : 'Or paste the token into the reset page.'}
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6">
          <label className="block text-sm font-semibold">
            {bn ? 'ইমেইল' : 'Email'}
            <input
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-black/10 px-4 py-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--color-primary-light)]"
            />
          </label>
          <button
            type="submit"
            disabled={state === 'loading'}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--color-primary-dark)] disabled:opacity-70"
          >
            {state === 'loading' ? <Loader2 size={16} className="animate-spin" /> : null}
            {state === 'loading' ? (bn ? 'পাঠানো হচ্ছে…' : 'Sending…') : bn ? 'রিসেট লিংক তৈরি করুন' : 'Generate reset token'}
          </button>
          {state === 'error' ? <p className="mt-4 text-sm text-[var(--color-crimson)]">{message}</p> : null}
        </form>
      )}

      <p className="mt-6 text-center text-sm text-[var(--color-ink-soft)]">
        <Link href="/login" className="font-semibold text-[var(--color-royal)] hover:underline">
          {bn ? '← সাইন ইন-এ ফিরুন' : '← Back to sign in'}
        </Link>
      </p>
    </div>
  );
}