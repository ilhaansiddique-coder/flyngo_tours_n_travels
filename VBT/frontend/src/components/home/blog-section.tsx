import Link from 'next/link';
import { Button, SectionHeader } from '@/components/ui/button';
import { assetUrl } from '@/lib/api';
import { formatDate, pickField } from '@/lib/lang';
import { getServerLang } from '@/lib/server-lang';
import type { BlogPost } from '@/types';

export async function BlogSection({ posts }: { posts: BlogPost[] }) {
  const lang = await getServerLang();
  if (!posts?.length) return null;
  const recent = posts.slice(0, 3);

  return (
    <section className="section-pad">
      <div className="container-site">
        <SectionHeader title="Latest from the Blog" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {recent.map((post) => {
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
                  </p>
                  <h3 className="mt-2 line-clamp-2 text-lg font-bold text-[var(--color-ink)]">{title}</h3>
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
        <div className="mt-8 flex justify-center">
          <Button href="/blog" variant="outline" className="border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary-lighter)]">
            See More
          </Button>
        </div>
      </div>
    </section>
  );
}