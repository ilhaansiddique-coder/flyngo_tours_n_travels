'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import { useLocale } from '@/contexts/locale-context';
import { KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import logoImg from '@/images/flyngo_transparent.png';

/**
 * Forced password change after a first sign-in with a staff-issued temporary
 * password.
 *
 * The token in the URL is scoped to /auth/change-password and is rejected by
 * every other guarded endpoint, so there is no way to skip this screen and
 * keep using a password that was sent over WhatsApp.
 *
 * Reads its params from window.location rather than useSearchParams: this route
 * is statically prerendered, and useSearchParams would require a Suspense
 * boundary — the construct that has twice silently broken hydration on
 * /booking by shipping inert SSR HTML.
 */
export default function SetPasswordPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const isBn = locale === 'bn';
  const { setTokens, setUser } = useAuthStore();

  const [token, setToken] = useState<string | null>(null);
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get('token'));
    const cb = params.get('callbackUrl');
    // Same-origin relative paths only — never an open redirect.
    setCallbackUrl(cb && cb.startsWith('/') && !cb.startsWith('//') ? cb : null);
    // Pre-fill the temporary password the user just signed in with (stashed at
    // login) so they don't have to retype it. Falls back to an empty field.
    try {
      const saved = sessionStorage.getItem('flyngo_temp_password');
      if (saved) setTempPassword(saved);
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tempPassword.trim()) {
      setError(isBn ? 'অস্থায়ী পাসওয়ার্ড দিন' : 'Enter the temporary password we sent you');
      return;
    }
    if (newPassword.length < 8) {
      setError(isBn ? 'নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে' : 'Your new password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(isBn ? 'পাসওয়ার্ড দুটি মিলছে না' : 'Those two passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post<{ accessToken: string; refreshToken: string }>('/auth/change-password', {
        changePasswordToken: token,
        currentPassword: tempPassword,
        newPassword,
      });
      // The change returns a real session, so the customer lands signed in
      // rather than being asked to log in a second time.
      setTokens(res.accessToken, res.refreshToken);

      // Tokens alone aren't enough: /dashboard (and the admin shell) gate on the
      // cached profile, so without this the customer is bounced straight back to
      // the sign-in page having just set their password.
      try {
        const me = await api.get<{
          id: string;
          email: string | null;
          fullName: string;
          role: { code: string; permissions: Array<{ permission: { code: string } }> };
        }>('/users/me', { token: res.accessToken });
        setUser({
          id: me.id,
          email: me.email ?? '',
          fullName: me.fullName,
          role: me.role.code,
          permissions: me.role.permissions.map((p) => p.permission.code),
        });
      } catch {
        // Non-fatal: they are signed in, the profile will load on next request.
      }

      setDone(true);
      setTimeout(() => router.push(callbackUrl ?? '/dashboard'), 900);
    } catch (err: any) {
      setError(err?.message || 'Could not set your password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (ready && !token) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center glass rounded-2xl p-10">
          <AlertCircle className="w-10 h-10 mx-auto mb-4 text-danger" />
          <h1 className="font-display text-xl font-bold text-on-surface mb-2">
            {isBn ? 'লিঙ্কটি অসম্পূর্ণ' : 'This link is incomplete'}
          </h1>
          <p className="text-sm text-on-surface-variant mb-6">
            {isBn
              ? 'অনুগ্রহ করে আপনার ফোন নম্বর ও অস্থায়ী পাসওয়ার্ড দিয়ে সাইন ইন করুন।'
              : 'Please sign in with your phone number and the temporary password we sent you.'}
          </p>
          <Link href="/auth/login">
            <Button className="w-full">{isBn ? 'সাইন ইন' : 'Go to sign in'}</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <Image src={logoImg} alt="FlynGo" width={140} height={50} className="rounded-xl object-cover" style={{ width: '140px', height: 'auto' }} />
          </Link>
        </div>

        <div className="glass rounded-2xl p-8">
          {done ? (
            <div className="text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-success" />
              <h1 className="font-display text-xl font-bold text-on-surface">
                {isBn ? 'পাসওয়ার্ড সেট হয়েছে' : 'Password set'}
              </h1>
              <p className="text-sm text-on-surface-variant mt-2">
                {isBn ? 'আপনাকে সাইন ইন করা হচ্ছে…' : 'Signing you in…'}
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 border"
                  style={{
                    backgroundColor: 'color-mix(in oklab, var(--color-primary) 15%, transparent)',
                    borderColor: 'color-mix(in oklab, var(--color-primary) 40%, transparent)',
                  }}
                >
                  <KeyRound className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
                </div>
                <h1 className="font-display text-2xl font-bold text-on-surface">
                  {isBn ? 'নতুন পাসওয়ার্ড সেট করুন' : 'Choose your password'}
                </h1>
                <p className="text-sm text-on-surface-variant mt-2">
                  {isBn
                    ? 'নিরাপত্তার জন্য অস্থায়ী পাসওয়ার্ডটি বদলে নিন। এরপর থেকে এই পাসওয়ার্ড দিয়েই সাইন ইন করবেন।'
                    : 'Replace the temporary password we sent you. You’ll use this one from now on.'}
                </p>
              </div>

              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label={isBn ? 'অস্থায়ী পাসওয়ার্ড' : 'Temporary password'}
                  type="text"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  placeholder={isBn ? 'আমরা যেটি পাঠিয়েছি' : 'The one we sent you'}
                  autoComplete="one-time-code"
                  required
                />
                <Input
                  label={isBn ? 'নতুন পাসওয়ার্ড' : 'New password'}
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <Input
                  label={isBn ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm new password'}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  {submitting
                    ? isBn ? 'সেট করা হচ্ছে…' : 'Setting…'
                    : isBn ? 'পাসওয়ার্ড সেট করুন' : 'Set password'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
