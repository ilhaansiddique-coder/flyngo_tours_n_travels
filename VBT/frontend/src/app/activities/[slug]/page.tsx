import { notFound } from 'next/navigation';
import { PageHero } from '@/components/page-hero';
import { Button } from '@/components/ui/button';
import { assetUrl } from '@/lib/api';
import { getActivityBySlugSafe } from '@/lib/get-site';
import { pickField } from '@/lib/lang';
import { getServerLang } from '@/lib/server-lang';

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lang = await getServerLang();
  const activity = await getActivityBySlugSafe(slug);
  if (!activity) notFound();

  const title = pickField(lang, activity.titleEn, activity.titleBn);
  const tag = pickField(lang, activity.tagEn, activity.tagBn);
  const content = pickField(lang, activity.contentEn, activity.contentBn);

  return (
    <>
      <PageHero title={title} subtitle={tag || undefined} />
      <section className="section-pad">
        <div className="container-site grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
          <article>
            {activity.image ? (
              <img
                src={assetUrl(activity.image)}
                alt={title}
                className="mb-8 h-72 w-full rounded-2xl object-cover sm:h-96"
              />
            ) : null}
            <div className="whitespace-pre-line text-base leading-relaxed text-[var(--color-ink-soft)]">
              {content}
            </div>
          </article>
          <aside className="h-fit rounded-2xl bg-[var(--color-mist)] p-6">
            <h3 className="text-lg font-bold">
              {lang === 'bn' ? 'এই প্রকল্পে সহায়তা করুন' : 'Support this project'}
            </h3>
            <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
              {lang === 'bn'
                ? 'আপনার দান এই কার্যক্রমকে সচল রাখে।'
                : 'Your donation keeps this programme running.'}
            </p>
            <div className="mt-5">
              <Button href="/donate" className="w-full">
                {lang === 'bn' ? 'দান করুন' : 'Donate'}
              </Button>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
