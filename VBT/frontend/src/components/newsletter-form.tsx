'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { clientApi } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

export function NewsletterForm() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('loading');
    try {
      await clientApi<{ success: boolean }>('/public/subscribers', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setState('done');
      setMessage(t('subscribe.success'));
    } catch (err) {
      setState('error');
      setMessage((err as Error).message || t('subscribe.error'));
    }
  };

  return (
    <form onSubmit={submit} className="mt-4">
      <div className="flex max-w-md gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('subscribe.placeholder')}
          className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-gold-deep)]"
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[var(--color-gold-deep)] px-5 py-3 text-sm font-semibold text-[#4a3008] transition-colors hover:brightness-105 disabled:opacity-60"
        >
          {state === 'loading' ? <Loader2 size={16} className="animate-spin" /> : t('subscribe.button')}
        </button>
      </div>
      {message && (
        <p className={`mt-2 flex items-center gap-1.5 text-sm ${state === 'done' ? 'text-emerald-300' : state === 'error' ? 'text-red-300' : ''}`}>
          {state === 'done' && <CheckCircle2 size={14} />}
          {message}
        </p>
      )}
    </form>
  );
}