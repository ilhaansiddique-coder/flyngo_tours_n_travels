import { notFound } from 'next/navigation';
import { PageHero } from '@/components/page-hero';
import { getNoticeSafe } from '@/lib/get-site';
import { formatDate, pickField } from '@/lib/lang';
import { getServerLang } from '@/lib/server-lang';

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lang = await getServerLang();
  const notice = await getNoticeSafe(id);
  if (!notice) notFound();

  const title = pickField(lang, notice.titleEn, notice.titleBn);
  const content = pickField(lang, notice.contentEn, notice.contentBn);

  return (
    <>
      <PageHero title={title} subtitle={formatDate(notice.publishedAt, lang)} />
      <section className="section-pad">
        <article className="container-site max-w-3xl whitespace-pre-line text-base leading-relaxed text-[var(--color-ink-soft)]">
          {content}
        </article>
      </section>
    </>
  );
}
