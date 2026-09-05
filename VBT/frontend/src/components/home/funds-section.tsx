import Link from 'next/link';
import { SectionHeader } from '@/components/ui/button';
import { pickField } from '@/lib/lang';
import { getServerLang } from '@/lib/server-lang';
import { progressPct } from '@/lib/utils';
import type { Fund } from '@/types';

export async function FundsSection({ funds }: { funds: Fund[] }) {
  const lang = await getServerLang();
  if (!funds?.length) return null;

  return (
    <section className="section-pad bg-[var(--color-mist)]">
      <div className="container-site">
        <SectionHeader title="Funds" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {funds.map((fund) => {
            const title = pickField(lang, fund.titleEn, fund.titleBn);
            const desc = pickField(lang, fund.descriptionEn, fund.descriptionBn);
            const pct = progressPct(fund.raised, fund.target);
            return (
              <div
                key={fund.id}
                className="rounded-2xl border border-black/5 bg-white p-6 shadow-[var(--shadow-card)]"
              >
                <h3 className="text-lg font-bold text-[var(--color-ink)]">{title}</h3>
                {fund.image ? (
                  <img src={fund.image} alt="" className="mt-3 h-36 w-full rounded-xl object-cover" />
                ) : null}
                {desc ? <p className="mt-3 text-sm text-[var(--color-ink-soft)]">{desc}</p> : null}
                <div className="mt-5">
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-primary-lighter)]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-gold-deep)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs font-semibold text-[var(--color-ink-soft)]">
                    <span>
                      Raised ৳{Number(fund.raised ?? 0).toLocaleString()}
                    </span>
                    <span>{pct}%</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-[var(--color-ink-muted)]">
                    Target ৳{Number(fund.target ?? 0).toLocaleString()}
                  </span>
                  <Link
                    href="/donate"
                    className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
                  >
                    Donate
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}