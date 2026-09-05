'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { clientApi } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const TABS = ['membership', 'volunteer', 'career'] as const;
type Tab = (typeof TABS)[number];

export function ApplicationForm({ initialTab }: { initialTab?: string }) {
  const { t } = useI18n();
  const start: Tab = TABS.includes(initialTab as Tab) ? (initialTab as Tab) : 'membership';
  const [tab, setTab] = useState<Tab>(start);
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState('loading');
    try {
      await clientApi('/public/applications', {
        method: 'POST',
        body: JSON.stringify({
          type: tab,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone || undefined,
          address: data.address || undefined,
        }),
      });
      setState('done');
      setMessage(t('getInvolved.form.success'));
      form.reset();
    } catch (err) {
      setState('error');
      setMessage((err as Error).message);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setTab(item);
              setState('idle');
              setMessage('');
            }}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-bold transition-colors',
              tab === item
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-mist)] text-[var(--color-ink-soft)] hover:bg-[var(--color-primary-light)]',
            )}
          >
            {t(`getInvolved.${item}.title`)}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-black/5 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
        <h2 className="text-xl font-bold">{t(`getInvolved.${tab}.title`)}</h2>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{t(`getInvolved.${tab}.desc`)}</p>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <label className="block text-sm font-semibold">
            {t('getInvolved.form.fullName')}
            <input
              name="fullName"
              required
              className="mt-1.5 w-full rounded-xl border border-black/10 px-4 py-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </label>
          <label className="block text-sm font-semibold">
            {t('getInvolved.form.email')}
            <input
              name="email"
              type="email"
              required
              className="mt-1.5 w-full rounded-xl border border-black/10 px-4 py-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </label>
          <label className="block text-sm font-semibold">
            {t('getInvolved.form.phone')}
            <input
              name="phone"
              className="mt-1.5 w-full rounded-xl border border-black/10 px-4 py-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </label>
          <label className="block text-sm font-semibold">
            {t('getInvolved.form.address')}
            <input
              name="address"
              className="mt-1.5 w-full rounded-xl border border-black/10 px-4 py-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </label>
          <button
            type="submit"
            disabled={state === 'loading'}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--color-primary-dark)] disabled:opacity-70"
          >
            {state === 'loading' ? <Loader2 size={16} className="animate-spin" /> : null}
            {state === 'loading' ? t('getInvolved.form.submitting') : t('getInvolved.form.submit')}
          </button>
          {message ? (
            <p className={`flex items-center gap-2 text-sm ${state === 'done' ? 'text-[var(--color-primary-dark)]' : 'text-red-600'}`}>
              {state === 'done' ? <CheckCircle2 size={16} /> : null}
              {message}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
