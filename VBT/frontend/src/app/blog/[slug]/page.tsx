import { notFound } from 'next/navigation';
import { PageHero } from '@/components/page-hero';
import { assetUrl } from '@/lib/api';
import { getBlogBySlugSafe } from '@/lib/get-site';
import { formatDate, pickField } from '@/lib/lang';
import { getServerLang } from '@/lib/server-lang';

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lang = await getServerLang();
  const post = await getBlogBySlugSafe(slug);
  if (!post) notFound();

  const title = pickField(lang, post.titleEn, post.titleBn);
  const content = pickField(lang, post.contentEn, post.contentBn);

  return (
    <>
      <PageHero title={title} subtitle={formatDate(post.publishedAt, lang)} />
      <section className="section-pad">
        <article className="container-site max-w-3xl">
          {post.image ? (
            <img
              src={assetUrl(post.image)}
              alt={title}
              className="mb-8 h-72 w-full rounded-2xl object-cover sm:h-96"
            />
          ) : null}
          {post.author ? (
            <p className="mb-6 text-sm font-semibold text-[var(--color-ink-muted)]">{post.author}</p>
          ) : null}
          <div className="whitespace-pre-line text-base leading-relaxed text-[var(--color-ink-soft)]">
            {content}
          </div>
        </article>
      </section>
    </>
  );
}
