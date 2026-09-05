import { PageHero } from '@/components/page-hero';
import { Icon } from '@/components/icon';
import { assetUrl } from '@/lib/api';
import { pickField } from '@/lib/lang';
import { getServerLang } from '@/lib/server-lang';
import { getSiteSettings } from '@/lib/get-site';
import { getSiteBag } from '@/lib/get-site';

export default async function AboutPage() {
  const lang = await getServerLang();
  const about = (await getSiteBag()).about;
  const settings = await getSiteSettings();

  const tagline = pickField(lang, about?.taglineEn, about?.taglineBn);
  const title = pickField(lang, about?.titleEn, about?.titleBn);
  const content = pickField(lang, about?.contentEn, about?.contentBn);
  const items = about?.items ?? [];

  const facts = [
    { label: lang === 'bn' ? 'প্রতিষ্ঠিত' : 'Founded', value: String(settings.founded || 2017) },
    { label: lang === 'bn' ? 'নিবন্ধন নং' : 'Registration', value: settings.registration || 'S-13111/2019' },
    { label: lang === 'bn' ? 'সভাপতি' : 'Chairman', value: settings.chairman || 'Shaykh Ahmadullah' },
  ];

  return (
    <>
      <PageHero
        title={lang === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'}
        subtitle={tagline || undefined}
      />
      <section className="section-pad">
        <div className="container-site">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-primary)]">
                {tagline}
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                {title}
              </h2>
              <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-[var(--color-ink-soft)]">
                {content}
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {facts.map((fact) => (
                  <div key={fact.label} className="rounded-2xl bg-[var(--color-mist)] p-5 text-center">
                    <div className="text-2xl font-bold text-[var(--color-primary)]">{fact.value}</div>
                    <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">
                      {fact.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {about?.image ? (
              <div className="overflow-hidden rounded-2xl shadow-[var(--shadow-card)]">
                <img src={assetUrl(about.image)} alt={title} className="h-full w-full object-cover" />
              </div>
            ) : null}
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {items.map((item, i) => {
              const itemTitle = pickField(lang, item.titleEn, item.titleBn);
              const itemDesc = pickField(lang, item.descEn, item.descBn);
              return (
                <div key={i} className="rounded-2xl border border-black/5 bg-white p-7 shadow-[var(--shadow-card)]">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-gold)] text-[#4a3008]">
                    <Icon name={item.icon} size={26} />
                  </div>
                  <h3 className="text-lg font-bold">{itemTitle}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">{itemDesc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}