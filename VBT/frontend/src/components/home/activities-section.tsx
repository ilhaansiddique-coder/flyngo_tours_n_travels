import Link from 'next/link';
import { Icon } from '@/components/icon';
import { Button, SectionHeader } from '@/components/ui/button';
import { assetUrl } from '@/lib/api';
import { pickField } from '@/lib/lang';
import { getServerLang } from '@/lib/server-lang';
import type { Activity } from '@/types';

export async function ActivitiesSection({ activities }: { activities: Activity[] }) {
  const lang = await getServerLang();
  if (!activities?.length) return null;

  return (
    <section className="section-pad">
      <div className="container-site">
        <SectionHeader title="Projects & Activities" />
        <div className="mt-12">
          <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2">
            {activities.map((activity) => {
              const title = pickField(lang, activity.titleEn, activity.titleBn);
              const tag = pickField(lang, activity.tagEn, activity.tagBn);
              const excerpt = pickField(lang, activity.excerptEn, activity.excerptBn);
              return (
                <Link
                  key={activity.slug}
                  href={`/activities/${activity.slug}`}
                  className="group w-[300px] shrink-0 snap-start overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] sm:w-[340px]"
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
                    <h3 className="line-clamp-2 text-lg font-bold text-[var(--color-ink)]">{title}</h3>
                    {excerpt ? (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                        {excerpt}
                      </p>
                    ) : null}
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-primary)]">
                      Read More <Icon name="arrow-right" size={16} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-8 flex justify-center">
            <Button href="/activities" variant="outline" className="border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary-lighter)]">
              All Projects
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}