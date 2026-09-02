'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Lock, ArrowLeft, CheckCircle2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import logoImg from '@/images/flyngo_transparent.png';

function ResetPasswordInner() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const { resetPassword } = useApi();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err: any) {
      setError(err?.message || 'This reset link is invalid or has expired. Request a new one.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center px-4 py-12 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 30%, color-mix(in oklab, var(--color-primary) 18%, transparent), transparent 70%)',
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <Image src={logoImg} alt="FlynGo" width={140} height={50} className="rounded-xl object-cover" style={{ width: '140px', height: 'auto' }} />
          </Link>
          <span className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full text-[10px] tracking-widest uppercase font-bold text-accent border border-accent/30 bg-accent/5">
            <ShieldCheck className="w-3 h-3" />
            Set a New Password
          </span>
          <h1 className="font-display text-3xl font-bold text-on-surface">Choose a new password</h1>
        </div>

        <div className="glass-deep rounded-2xl p-8">
          {done ? (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-success/10 border border-success/30 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-7 h-7 text-success" />
              </div>
              <h2 className="font-display text-xl font-bold text-on-surface">Password updated</h2>
              <p className="mt-2 text-sm text-on-surface-variant">
                You can now sign in with your new password.
              </p>
              <Link
                href="/auth/login"
                className="mt-6 inline-flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-amber-500 hover:from-blue-500 hover:to-amber-400 text-white font-medium transition shadow-lg shadow-blue-500/25"
              >
                Go to sign in
              </Link>
            </div>
          ) : !token ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-error bg-error/10 border border-error/30 rounded-lg px-3 py-2">
                This reset link is missing its token. Please request a new one.
              </p>
              <Link href="/auth/forgot-password" className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
                Request a new link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent z-10" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password (min 8 characters)"
                  className="w-full pl-11 pr-11 py-2.5 rounded-lg border border-outline-variant bg-surface-container/60 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent z-10" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pl-11 pr-11 py-2.5 rounded-lg border border-outline-variant bg-surface-container/60 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {error && (
                <p className="text-sm text-error bg-error/10 border border-error/30 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-amber-500 hover:from-blue-500 hover:to-amber-400 text-white font-medium transition shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Updating…' : 'Update password'}
              </button>

              <div className="text-center">
                <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface">
                  <ArrowLeft className="w-4 h-4" /> Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ResetPasswordInner />
    </Suspense>
  );
}
