import Link from 'next/link';
import { PageHero } from '@/components/page-hero';
import { assetUrl } from '@/lib/api';
import { getBlogs } from '@/lib/get-site';
import { formatDate, pickField } from '@/lib/lang';
import { getServerLang } from '@/lib/server-lang';

export default async function BlogPage() {
  const lang = await getServerLang();
  const posts = await getBlogs();

  return (
    <>
      <PageHero
        title={lang === 'bn' ? 'ব্লগ' : 'Blog'}
        subtitle={
          lang === 'bn'
            ? 'আমাদের কার্যক্রম, প্রতিবেদন ও শিক্ষামূলক লেখা।'
            : 'Updates, reports and articles from our programmes.'
        }
      />
      <section className="section-pad">
        <div className="container-site grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const title = pickField(lang, post.titleEn, post.titleBn);
            const excerpt = pickField(lang, post.excerptEn, post.excerptBn);
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={assetUrl(post.image)}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">
                    {formatDate(post.publishedAt, lang)}
                    {post.author ? ` · ${post.author}` : ''}
                  </p>
                  <h2 className="mt-2 line-clamp-2 text-lg font-bold">{title}</h2>
                  {excerpt ? (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                      {excerpt}
                    </p>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
