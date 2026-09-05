import { Icon } from '@/components/icon';
import { SectionHeader } from '@/components/ui/button';
import { assetUrl } from '@/lib/api';
import { pickField } from '@/lib/lang';
import { getServerLang } from '@/lib/server-lang';
import type { AboutSection } from '@/types';

export async function HomeAbout({ about }: { about: AboutSection | null }) {
  const lang = await getServerLang();
  if (!about) return null;

  const tagline = pickField(lang, about.taglineEn, about.taglineBn);
  const title = pickField(lang, about.titleEn, about.titleBn);
  const content = pickField(lang, about.contentEn, about.contentBn);
  const items = about.items ?? [];

  return (
    <section id="about" className="section-pad">
      <div className="container-site">
        {tagline ? (
          <p className="mb-2 text-center text-sm font-bold uppercase tracking-widest text-[var(--color-primary)]">
            {tagline}
          </p>
        ) : null}
        <SectionHeader title={title || 'About'} subtitle={content} />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const itemTitle = pickField(lang, item.titleEn, item.titleBn);
            const itemDesc = pickField(lang, item.descEn, item.descBn);
            return (
              <div
                key={i}
                className="group rounded-2xl border border-black/5 bg-white p-7 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
              >
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)] transition-colors group-hover:bg-[var(--color-primary)] group-hover:text-white">
                  <Icon name={item.icon} size={26} />
                </div>
                <h3 className="text-lg font-bold text-[var(--color-ink)]">{itemTitle}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">{itemDesc}</p>
              </div>
            );
          })}
        </div>

        {about.image ? (
          <div className="mt-12 overflow-hidden rounded-2xl">
            <img src={assetUrl(about.image)} alt={title} className="h-64 w-full object-cover sm:h-80" />
          </div>
        ) : null}
      </div>
    </section>
  );
}