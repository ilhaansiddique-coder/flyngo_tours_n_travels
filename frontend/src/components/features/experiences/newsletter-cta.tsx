'use client';

import { Mail, ArrowRight, Check } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  return (
    <section className="px-4 sm:px-6 lg:px-16 max-w-[1600px] mx-auto mb-24">
      <div className="rounded-3xl border border-hairline card-elevated p-8 sm:p-12 grid lg:grid-cols-2 gap-10">
        <div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Travel news from FlynGo</h2>
          <p className="text-muted">Sign up for travel news and offers. Confirm your email address to join, and unsubscribe using the link in your confirmation email.</p>
        </div>
        <form aria-label="Newsletter signup" className="space-y-4" onSubmit={async (event) => {
          event.preventDefault(); setPending(true); setError(''); setMessage('');
          try {
            const result = await api.post<{ accepted: boolean; message: string }>('/newsletter/subscribe', { email: email.trim(), consent });
            if (!result.accepted) throw new Error('Subscription request was not accepted.');
            setMessage(result.message);
          } catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not submit your request. Please try again.'); }
          finally { setPending(false); }
        }}>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex flex-1 gap-3 items-center rounded-xl border border-hairline p-3">
              <Mail className="w-5 h-5 text-accent" />
              <input aria-label="Newsletter email" type="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} disabled={pending} placeholder="your@email.com" className="bg-transparent w-full outline-none" />
            </label>
            <button disabled={pending || !consent} type="submit" className="rounded-xl px-6 py-3 text-white font-semibold disabled:opacity-50" style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-tertiary))' }}>
              {pending ? 'Submitting…' : 'Subscribe'} <ArrowRight className="inline w-4 h-4" />
            </button>
          </div>
          <label className="flex items-start gap-2 text-sm text-muted">
            <input type="checkbox" required checked={consent} disabled={pending} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
            <span>I agree to receive travel news and offers by email. See our <Link href="/privacy" className="underline">Privacy Policy</Link>.</span>
          </label>
          {message && <p role="status" className="text-sm text-accent"><Check className="inline w-4 h-4" /> {message}</p>}
          {error && <p role="alert" className="text-sm text-error">{error}</p>}
        </form>
      </div>
    </section>
  );
}
