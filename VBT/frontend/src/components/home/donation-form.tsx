'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ChevronDown, Info, Loader2 } from 'lucide-react';
import { assetUrl, clientApi } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Product, SiteSettings } from '@/types';

export function DonationForm({
  products,
  settings,
}: {
  products: Product[];
  settings: Record<string, unknown> | null;
}) {
  const { t, lang } = useI18n();
  const [amount, setAmount] = useState<string>('100');
  const [contact, setContact] = useState('');
  const [productId, setProductId] = useState<string>(products[0]?.id ?? '');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const product = products.find((p) => p.id === productId);

  const siteSettings = (settings?.site as SiteSettings | undefined) ?? {};
  const orgName =
    lang === 'bn'
      ? siteSettings?.nameBn || 'ভলান্টিয়ার বাংলাদেশ ট্রাস্ট'
      : siteSettings?.name || 'Volunteer Bangladesh Trust';

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
        <div
          className="mx-auto max-w-5xl -translate-y-8 sm:-translate-y-12 rounded-2xl p-5 sm:p-6 lg:px-8 lg:py-10 shadow-2xl"
          style={{
            backgroundColor: '#e8b65d',
            backgroundImage: `url(${assetUrl('/images/home/donation-pattern.svg')})`,
            backgroundRepeat: 'repeat',
          }}
        >
          <h2 className="text-center font-bold text-2xl sm:text-3xl text-[#0f2920] tracking-tight">
            {t('donate.title')}
          </h2>

          <form onSubmit={submit} className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 items-end">
            <div>
              <label className="mb-1.5 block text-sm sm:text-base font-bold text-[#0f2920]">
                {t('donate.product')} <span className="text-[#f45630] font-bold">*</span>
              </label>
              <div className="relative">
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="h-[50px] w-full appearance-none rounded-xl border-0 bg-white px-4 pr-10 text-sm sm:text-base font-medium text-slate-800 shadow-sm outline-none transition focus:ring-2 focus:ring-[#008e48]"
                >
                  {products.length === 0 ? (
                    <option value="">{t('donate.causePlaceholder')}</option>
                  ) : (
                    products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {lang === 'bn' ? p.titleBn || p.titleEn : p.titleEn}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600"
                  size={18}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm sm:text-base font-bold text-[#0f2920]">
                <span>{t('donate.contact')}</span>
                <span className="text-[#f45630] font-bold">*</span>
                <span
                  title={
                    lang === 'bn'
                      ? 'পেমেন্ট রসিদ এবং আপডেটের জন্য'
                      : 'For payment receipt and updates'
                  }
                  className="inline-flex items-center justify-center cursor-help text-[#0f2920]"
                >
                  <Info size={16} className="fill-[#0f2920] text-[#e8b65d]" />
                </span>
              </label>
              <input
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={t('donate.contactPlaceholder')}
                className="h-[50px] w-full rounded-xl border-0 bg-white px-4 text-sm sm:text-base font-medium text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-[#008e48]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm sm:text-base font-bold text-[#0f2920]">
                {t('donate.amount')} <span className="text-[#f45630] font-bold">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm sm:text-base font-bold text-slate-700">
                  ৳
                </span>
                <input
                  type="number"
                  min={1}
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={t('donate.amountPlaceholder')}
                  className="h-[50px] w-full rounded-xl border-0 bg-white pl-9 pr-4 text-sm sm:text-base font-semibold text-slate-800 shadow-sm outline-none transition focus:ring-2 focus:ring-[#008e48]"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={state === 'loading'}
                className="h-[50px] w-full rounded-xl bg-[#008e48] px-6 text-base sm:text-lg font-bold text-white shadow-sm transition-all hover:bg-[#007a3e] active:scale-[0.99] disabled:opacity-75 flex items-center justify-center cursor-pointer"
              >
                {state === 'loading' ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin" /> {t('donate.donating')}
                  </span>
                ) : (
                  t('donate.button')
                )}
              </button>
            </div>
          </form>

          {/* Temporarily commented out:
          <div className="mt-4 sm:mt-5 text-center text-xs sm:text-sm font-medium text-[#0f2920]">
            <span>
              {lang === 'bn'
                ? `${orgName}-এ দান করলে কর রেয়াত পাবেন। `
                : `Donations to ${orgName} are eligible for tax credit. `}
            </span>
            <Link
              href="/tax-notice"
              className="font-bold text-[#008e48] underline hover:text-[#007a3e] transition-colors"
            >
              {lang === 'bn' ? 'বিস্তারিত জানতে ক্লিক করুন।' : 'Click to learn more.'}
            </Link>
          </div>
          */}

          {(state === 'done' || state === 'error') && (
            <div
              className={cn(
                'mt-4 flex items-start gap-2.5 rounded-xl p-3.5 text-sm font-medium transition-all',
                state === 'done'
                  ? 'bg-emerald-50 text-emerald-950 border border-emerald-300'
                  : 'bg-red-50 text-red-900 border border-red-300',
              )}
            >
              {state === 'done' && <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#008e48]" />}
              <span>{message}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}