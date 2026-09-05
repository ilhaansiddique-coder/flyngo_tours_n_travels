import Link from 'next/link';
import { Icon } from '@/components/icon';
import { SectionHeader } from '@/components/ui/button';
import { pickField } from '@/lib/lang';
import { getServerLang } from '@/lib/server-lang';
import type { ConnectSection } from '@/types';

export async function ConnectSection({ connect }: { connect: ConnectSection | null }) {
  const lang = await getServerLang();
  if (!connect) return null;

  const title = pickField(lang, connect.titleEn, connect.titleBn);
  const subtitle = pickField(lang, connect.subtitleEn, connect.subtitleBn);
  const items = connect.items ?? [];

  return (
    <section id="get-involved" className="section-pad">
      <div className="container-site">
        <SectionHeader title={title || 'Get Involved'} subtitle={subtitle} />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => {
            const itemTitle = pickField(lang, item.titleEn, item.titleBn);
            const btn = pickField(lang, item.buttonEn, item.buttonBn);
            return (
              <Link
                key={i}
                href={item.link}
                className="group flex flex-col items-center rounded-2xl border border-black/5 bg-white p-7 text-center shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-primary-light)] hover:shadow-[var(--shadow-card-hover)]"
              >
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-gold)] text-[#4a3008] transition-transform group-hover:scale-105">
                  <Icon name={item.icon} size={28} />
                </div>
                <h3 className="text-lg font-bold text-[var(--color-ink)]">{itemTitle}</h3>
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-primary-lighter)] px-4 py-2 text-sm font-bold text-[var(--color-primary-dark)] transition-colors group-hover:bg-[var(--color-primary)] group-hover:text-white">
                  {btn}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}