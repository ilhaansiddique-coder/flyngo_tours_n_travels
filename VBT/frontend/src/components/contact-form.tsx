'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { clientApi } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

export function ContactForm() {
  const { t } = useI18n();
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState('loading');
    try {
      await clientApi('/public/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          subject: data.subject || undefined,
          message: data.message,
        }),
      });
      setState('done');
      setMessage(t('contact.success'));
      form.reset();
    } catch (err) {
      setState('error');
      setMessage((err as Error).message || t('contact.error'));
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold">
          {t('contact.name')}
          <input
            name="name"
            required
            className="mt-1.5 w-full rounded-xl border border-black/10 px-4 py-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </label>
        <label className="block text-sm font-semibold">
          {t('contact.email')}
          <input
            name="email"
            type="email"
            required
            className="mt-1.5 w-full rounded-xl border border-black/10 px-4 py-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold">
          {t('contact.phone')}
          <input
            name="phone"
            className="mt-1.5 w-full rounded-xl border border-black/10 px-4 py-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </label>
        <label className="block text-sm font-semibold">
          {t('contact.subject')}
          <input
            name="subject"
            className="mt-1.5 w-full rounded-xl border border-black/10 px-4 py-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </label>
      </div>
      <label className="block text-sm font-semibold">
        {t('contact.message')}
        <textarea
          name="message"
          required
          rows={5}
          className="mt-1.5 w-full rounded-xl border border-black/10 px-4 py-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </label>
      <button
        type="submit"
        disabled={state === 'loading'}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--color-primary-dark)] disabled:opacity-70"
      >
        {state === 'loading' ? <Loader2 size={16} className="animate-spin" /> : null}
        {state === 'loading' ? t('contact.sending') : t('contact.send')}
      </button>
      {message ? (
        <p className={`flex items-center gap-2 text-sm ${state === 'done' ? 'text-[var(--color-primary-dark)]' : 'text-red-600'}`}>
          {state === 'done' ? <CheckCircle2 size={16} /> : null}
          {message}
        </p>
      ) : null}
    </form>
  );
}
