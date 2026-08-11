'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowLeft, CheckCircle2, FileCheck } from 'lucide-react';
import { api } from '@/lib/api';
import logoImg from '@/images/flyngo_transparent.png';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
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
            <Image src={logoImg} alt="FlynGo" width={140} height={56} className="rounded-xl object-cover" />
          </Link>
          <span className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full text-[10px] tracking-widest uppercase font-bold text-accent border border-accent/30 bg-accent/5">
            <FileCheck className="w-3 h-3" />
            Account Recovery
          </span>
          <h1 className="font-display text-3xl font-bold text-on-surface">Forgot your password?</h1>
          <p className="mt-2 text-on-surface-variant">
            Enter the email associated with your account and we&apos;ll send you a reset link.
          </p>
        </div>

        <div className="glass-deep rounded-2xl p-8">
          {submitted ? (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-success/10 border border-success/30 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-7 h-7 text-success" />
              </div>
              <h2 className="font-display text-xl font-bold text-on-surface">Check your inbox</h2>
              <p className="mt-2 text-sm text-on-surface-variant">
                If an account exists for <span className="font-medium text-on-surface">{email}</span>,
                we&apos;ve sent a password reset link. It expires in 30 minutes.
              </p>
              <Link
                href="/auth/login"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-on-surface mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-3 py-2.5 rounded-lg border border-outline-variant bg-surface-container/60 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-error bg-error/10 border border-error/30 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-amber-500 hover:from-blue-500 hover:to-amber-400 text-white font-medium transition shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Sending…' : 'Send reset link'}
              </button>

              <div className="text-center">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-on-surface-variant">
          Didn&apos;t request a reset? You can safely ignore this page.
        </p>
      </div>
    </div>
  );
}
