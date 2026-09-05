import Link from 'next/link';
import { PageHero } from '@/components/page-hero';
import { Icon } from '@/components/icon';
import { assetUrl } from '@/lib/api';
import { getActivities } from '@/lib/get-site';
import { pickField } from '@/lib/lang';
import { getServerLang } from '@/lib/server-lang';

export default async function ActivitiesPage() {
  const lang = await getServerLang();
  const activities = await getActivities();

  return (
    <>
      <PageHero
        title={lang === 'bn' ? 'প্রকল্প ও কার্যক্রম' : 'Projects & Activities'}
        subtitle={
          lang === 'bn'
            ? 'শিক্ষা, সেবা ও দাওয়াহর মাধ্যমে উম্মাহর সেবায় আমাদের চলমান উদ্যোগ।'
            : 'Ongoing programmes serving the Ummah through education, relief and Dawah.'
        }
      />
      <section className="section-pad">
        <div className="container-site grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => {
            const title = pickField(lang, activity.titleEn, activity.titleBn);
            const tag = pickField(lang, activity.tagEn, activity.tagBn);
            const excerpt = pickField(lang, activity.excerptEn, activity.excerptBn);
            return (
              <Link
                key={activity.slug}
                href={`/activities/${activity.slug}`}
                className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={assetUrl(activity.image)}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {tag ? (
                    <span className="absolute left-4 top-4 rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-bold text-white">
                      {tag}
                    </span>
                  ) : null}
                </div>
                <div className="p-5">
                  <h2 className="line-clamp-2 text-lg font-bold">{title}</h2>
                  {excerpt ? (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                      {excerpt}
                    </p>
                  ) : null}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-primary)]">
                    {lang === 'bn' ? 'বিস্তারিত' : 'Read More'} <Icon name="arrow-right" size={16} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
