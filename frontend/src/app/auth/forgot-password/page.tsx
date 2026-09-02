'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, ArrowLeft, CheckCircle2, FileCheck, MessageSquare, Copy, Link2 } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { useLocale } from '@/contexts/locale-context';
import { PhoneInput } from '@/components/ui/phone-input';
import { DEFAULT_COUNTRY_CODE, findDialByCode } from '@/lib/country-dial-codes';
import logoImg from '@/images/flyngo_transparent.png';

type Channel = { channel: 'email' | 'sms'; hint: string };
type Step = 'identify' | 'choose' | 'sent';

export default function ForgotPasswordPage() {
  const { passwordResetOptions, sendPasswordReset } = useApi();
  const { locale } = useLocale();
  const isBn = locale === 'bn';

  const [step, setStep] = useState<Step>('identify');
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phoneCountry, setPhoneCountry] = useState<string>(DEFAULT_COUNTRY_CODE);
  const [phoneNumber, setPhoneNumber] = useState('');

  const [channels, setChannels] = useState<Channel[]>([]);
  const [sentTo, setSentTo] = useState<Channel | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const identifier =
    mode === 'email'
      ? email.trim()
      : phoneNumber.trim()
        ? `${findDialByCode(phoneCountry)?.dial ?? ''} ${phoneNumber.trim()}`
        : '';

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = (await passwordResetOptions(identifier)) as { channels: Channel[] };
      const found = res?.channels ?? [];
      if (found.length === 0) {
        setError(`We couldn't find an account for that ${mode === 'email' ? 'email' : 'phone number'}.`);
        return;
      }
      setChannels(found);
      // Auto-advance if only one channel is available.
      if (found.length === 1) {
        await deliver(found[0]);
      } else {
        setStep('choose');
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const deliver = async (choice: Channel) => {
    setError(null);
    setSubmitting(true);
    try {
      const res = (await sendPasswordReset(identifier, choice.channel)) as { resetUrl?: string };
      setSentTo(choice);
      // Surface the link in-system (no email/SMS dependency).
      setResetLink(res?.resetUrl ?? null);
      setStep('sent');
    } catch (err: any) {
      setError(err?.message || 'Could not send the reset link. Please try again.');
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
            <FileCheck className="w-3 h-3" />
            Account Recovery
          </span>
          <h1 className="font-display text-3xl font-bold text-on-surface">Forgot your password?</h1>
          <p className="mt-2 text-on-surface-variant">
            {step === 'sent'
              ? 'A reset link is on its way.'
              : "Find your account, then choose where to receive the reset link."}
          </p>
        </div>

        <div className="glass-deep rounded-2xl p-8">
          {/* STEP 1 — identify the account */}
          {step === 'identify' && (
            <form onSubmit={handleContinue} className="space-y-5">
              <div className="inline-flex w-full overflow-hidden rounded-lg border border-outline-variant">
                {(['email', 'phone'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMode(m); setError(null); }}
                    className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                      mode === m ? 'bg-primary text-primary-foreground' : 'bg-background text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {m === 'email' ? 'Email' : 'Phone'}
                  </button>
                ))}
              </div>

              {mode === 'email' ? (
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent z-10" />
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-3 py-2.5 rounded-lg border border-outline-variant bg-surface-container/60 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                  />
                </div>
              ) : (
                <PhoneInput
                  label="Phone number"
                  countryCode={phoneCountry}
                  number={phoneNumber}
                  onCountryCodeChange={setPhoneCountry}
                  onNumberChange={setPhoneNumber}
                  placeholder="e.g. 1712345678"
                />
              )}

              {error && (
                <p className="text-sm text-error bg-error/10 border border-error/30 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting || !identifier}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-amber-500 hover:from-blue-500 hover:to-amber-400 text-white font-medium transition shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Checking…' : 'Continue'}
              </button>

              <BackToLogin />
            </form>
          )}

          {/* STEP 2 — choose a delivery channel */}
          {step === 'choose' && (
            <div className="space-y-3">
              <p className="text-sm text-on-surface-variant">
                Where should we send your password reset link?
              </p>
              {channels.map((c) => (
                <button
                  key={c.channel}
                  type="button"
                  disabled={submitting}
                  onClick={() => deliver(c)}
                  className="flex w-full items-center gap-3 rounded-lg border border-outline-variant bg-surface-container/60 p-3 text-left transition hover:border-primary/50 hover:bg-surface-container-high disabled:opacity-50"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {c.channel === 'email' ? <Mail className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-on-surface">
                      {c.channel === 'email' ? 'Email' : 'Text message (SMS)'}
                    </span>
                    <span className="block truncate text-xs text-on-surface-variant">{c.hint}</span>
                  </span>
                </button>
              ))}
              {error && (
                <p className="text-sm text-error bg-error/10 border border-error/30 rounded-lg px-3 py-2">{error}</p>
              )}
              <button
                type="button"
                onClick={() => { setStep('identify'); setError(null); }}
                className="inline-flex items-center gap-2 pt-1 text-sm text-on-surface-variant hover:text-on-surface"
              >
                <ArrowLeft className="w-4 h-4" /> Use a different account
              </button>
            </div>
          )}

          {/* STEP 3 — sent confirmation */}
          {step === 'sent' && (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-success/10 border border-success/30 flex items-center justify-center mb-4">
                {sentTo?.channel === 'sms' ? (
                  <Phone className="w-7 h-7 text-success" />
                ) : (
                  <CheckCircle2 className="w-7 h-7 text-success" />
                )}
              </div>
              {/* The reset link only ever comes back on a local dev build. In
                  production the server delivers it over the chosen channel and
                  never returns it, so this screen must read correctly with no
                  link present at all. */}
              <h2 className="font-display text-xl font-bold text-on-surface">
                {resetLink
                  ? isBn ? 'আপনার রিসেট লিঙ্ক' : 'Your password reset link'
                  : isBn ? 'রিসেট লিঙ্ক পাঠানো হয়েছে' : 'Reset link sent'}
              </h2>
              {resetLink && (
                <p className="mt-2 text-sm text-on-surface-variant">
                  {isBn
                    ? 'নিচের লিঙ্কটি কপি করুন এবং ব্রাউজারে খুলুন। লিঙ্কটি ১ ঘণ্টার মধ্যে মেয়াদ শেষ হবে।'
                    : 'Copy the link below and open it in your browser. It expires in 1 hour.'}
                </p>
              )}

              {resetLink ? (
                <div className="mt-4 text-left">
                  <div className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container/60 p-2">
                    <Link2 className="w-4 h-4 shrink-0 text-accent" />
                    <input
                      readOnly
                      value={resetLink}
                      onFocus={(e) => e.currentTarget.select()}
                      className="flex-1 bg-transparent text-xs text-on-surface outline-none break-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(resetLink);
                        setError(null);
                      }}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                    >
                      <Copy className="w-3.5 h-3.5" /> {isBn ? 'কপি' : 'Copy'}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-on-surface-variant">
                    {isBn ? 'ঠিকানা:' : 'Sent to:'}{' '}
                    <span className="font-medium text-on-surface">{sentTo?.hint}</span>
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-on-surface-variant">
                  {isBn ? 'লিঙ্কটি পাঠানো হয়েছে' : 'We sent a password reset link to'}{' '}
                  <span className="font-medium text-on-surface">{sentTo?.hint}</span>.
                </p>
              )}

              <BackToLogin className="mt-6" />
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-on-surface-variant">
          Didn&apos;t request a reset? You can safely ignore this page.
        </p>
      </div>
    </div>
  );
}

function BackToLogin({ className = '' }: { className?: string }) {
  return (
    <div className={`text-center ${className}`}>
      <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface">
        <ArrowLeft className="w-4 h-4" /> Back to sign in
      </Link>
    </div>
  );
}
