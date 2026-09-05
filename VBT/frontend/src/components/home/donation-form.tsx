'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Gift, Loader2 } from 'lucide-react';
import { clientApi } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Product, SiteSettings } from '@/types';

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

export function DonationForm({
  products,
  settings,
}: {
  products: Product[];
  settings: Record<string, unknown> | null;
}) {
  const { t, lang } = useI18n();
  const [amount, setAmount] = useState<string>('1000');
  const [contact, setContact] = useState('');
  const [productId, setProductId] = useState<string>(products[0]?.id ?? '');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const product = products.find((p) => p.id === productId);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('loading');
    try {
      const res = await clientApi<{ success: boolean; txnId?: string }>('/public/donations', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          phoneOrEmail: contact,
          type: product?.type || 'REGULAR',
        }),
      });
      setState('done');
      setMessage(
        lang === 'bn'
          ? `আপনার রেফারেন্স: ${res.txnId}। পেমেন্ট সম্পন্ন করে দান নিশ্চিত করুন।`
          : `Reference: ${res.txnId}. Complete your payment to confirm.`,
      );
    } catch (err) {
      setState('error');
      setMessage((err as Error).message);
    }
  };

  return (
    <section className="relative z-20">
      <div className="container-site">
        <div className="mx-auto max-w-3xl -translate-y-10 rounded-2xl bg-[var(--color-gold)] p-6 shadow-xl sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#3f2d08] sm:text-2xl">
                {t('donate.title')}
              </h2>
              <p className="mt-1 text-sm text-[#6b5313]">{t('donate.subtitle')}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/70">
              <Gift size={22} className="text-[var(--color-primary-dark)]" />
            </div>
          </div>

          <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#6b5313]">
                {t('donate.amount')}
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#4a3008]">
                  ৳
                </span>
                <input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-[#d8b560]/60 bg-white/80 px-4 py-3 pl-8 text-sm font-semibold text-[#3f2d08] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {QUICK_AMOUNTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(String(q))}
                    className={cn(
                      'rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors',
                      amount === String(q)
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-white/70 text-[#6b5313] hover:bg-[var(--color-primary-light)]',
                    )}
                  >
                    ৳{q.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#6b5313]">
                {t('donate.contact')}
              </label>
              <input
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={t('donate.contactPlaceholder')}
                className="w-full rounded-xl border border-[#d8b560]/60 bg-white/80 px-4 py-3 text-sm text-[#3f2d08] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            <div className="lg:col-span-1">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#6b5313]">
                {t('donate.product')}
              </label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full rounded-xl border border-[#d8b560]/60 bg-white/80 px-4 py-3 text-sm text-[#3f2d08] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="" disabled>
                  {t('donate.causePlaceholder')}
                </option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {lang === 'bn' ? p.titleBn || p.titleEn : p.titleEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={state === 'loading'}
                className="w-full rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-70"
              >
                {state === 'loading' ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> {t('donate.donating')}
                  </span>
                ) : (
                  t('donate.button')
                )}
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#6b5313]">
            <span>
              {t('donate.taxNote')}{' '}
              <Link href="/tax-notice" className="font-semibold underline">
                {t('donate.taxLink')}
              </Link>
            </span>
            {typeof settings !== 'undefined' && typeof (settings as { contact?: { bankInfo?: { bank?: string } } }).contact?.bankInfo?.bank === 'string' ? (
              <span>via {(settings as { contact: { bankInfo: { bank: string } } }).contact.bankInfo.bank}</span>
            ) : null}
          </div>

          {(state === 'done' || state === 'error') && (
            <div
              className={cn(
                'mt-4 flex items-start gap-2 rounded-xl p-3 text-sm font-medium',
                state === 'done'
                  ? 'bg-[var(--color-primary-light)] text-[var(--color-primary-darker)]'
                  : 'bg-red-50 text-red-700',
              )}
            >
              {state === 'done' && <CheckCircle2 size={18} className="mt-0.5 shrink-0" />}
              <span>{message}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}