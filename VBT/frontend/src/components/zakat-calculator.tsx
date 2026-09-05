'use client';

import { useMemo, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import type { ZakatNisab } from '@/types';

const GOLD_NISAB_GRAMS = 87.48;
const SILVER_NISAB_GRAMS = 612.36;

export function ZakatCalculator({ nisab }: { nisab: ZakatNisab }) {
  const { t, lang } = useI18n();
  const [gold, setGold] = useState('');
  const [silver, setSilver] = useState('');
  const [cash, setCash] = useState('');
  const [goods, setGoods] = useState('');
  const [debt, setDebt] = useState('');

  const goldPrice = nisab.gold / GOLD_NISAB_GRAMS;
  const silverPrice = nisab.silver / SILVER_NISAB_GRAMS;

  const result = useMemo(() => {
    const goldValue = Number(gold || 0) * goldPrice;
    const silverValue = Number(silver || 0) * silverPrice;
    const total =
      goldValue + silverValue + Number(cash || 0) + Number(goods || 0) - Number(debt || 0);
    const zakatable = Math.max(0, total);
    const due = zakatable >= nisab.gold ? zakatable * 0.025 : 0;
    return { zakatable, due, meets: zakatable >= nisab.gold };
  }, [gold, silver, cash, goods, debt, goldPrice, silverPrice, nisab.gold]);

  const fmt = (n: number) =>
    `৳ ${n.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', { maximumFractionDigits: 0 })}`;

  const field = (label: string, value: string, set: (v: string) => void) => (
    <label className="block text-sm font-semibold">
      {label}
      <input
        type="number"
        min={0}
        step="any"
        value={value}
        onChange={(e) => set(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-black/10 px-4 py-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
      />
    </label>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <form className="grid gap-4 rounded-2xl border border-black/5 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
        {field(t('zakat.gold'), gold, setGold)}
        {field(t('zakat.silver'), silver, setSilver)}
        {field(t('zakat.cash'), cash, setCash)}
        {field(t('zakat.goods'), goods, setGoods)}
        {field(t('zakat.debt'), debt, setDebt)}
      </form>
      <div className="h-fit rounded-2xl bg-[var(--color-primary-darker)] p-7 text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold-deep)]">
          {t('zakat.nisab')}
        </p>
        <p className="mt-2 text-2xl font-bold">{fmt(nisab.gold)}</p>
        <p className="mt-1 text-sm text-white/60">{nisab.updatedLabel}</p>
        <div className="mt-8 space-y-4 border-t border-white/10 pt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">{t('zakat.total')}</span>
            <span className="font-bold">{fmt(result.zakatable)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">{t('zakat.zakat')}</span>
            <span className="text-xl font-bold text-[var(--color-gold-deep)]">{fmt(result.due)}</span>
          </div>
        </div>
        <p className="mt-6 text-xs leading-relaxed text-white/55">{t('zakat.note')}</p>
      </div>
    </div>
  );
}
