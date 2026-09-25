'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useApi } from '@/hooks/use-api';
import { useSearchQuery } from '@/hooks/use-search-query';
import { SearchResultsBanner } from '@/components/ui/search-results-banner';
import { formatDate } from '@/lib/utils';
import { BookOpen, Globe, ArrowRight, Sparkles, Compass, ShieldCheck, Headphones, Calendar, User } from 'lucide-react';
import { matchesSearch } from '@/lib/search';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  tags?: string[];
  publishedAt?: string | null;
  author?: { fullName?: string | null } | null;
}

function imageSrc(value?: string | null): string | null {
  if (!value) return null;
  if (value.startsWith('/')) return value;
  try {
    const { protocol } = new URL(value);
    return protocol === 'https:' ? value : null;
  } catch {
    return null;
  }
}

export default function BlogPage() {
  const { getBlogs } = useApi();
  const q = useSearchQuery();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data: any = await getBlogs();
        const list = data?.data ?? data?.items ?? data ?? [];
        setPosts(Array.isArray(list) ? list : []);
      } catch {
        // handled in empty state
      } finally {
        setLoading(false);
      }
    })();
  }, [getBlogs]);

  // Extract unique tags for quick filter pills
  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const p of posts) {
      for (const t of p.tags || []) {
        if (t) set.add(t.trim());
      }
    }
    return Array.from(set);
  }, [posts]);

  const shownPosts = useMemo(() => {
    let result = posts;
    if (selectedTag) {
      result = result.filter((p) =>
        (p.tags || []).some((t) => t.toLowerCase() === selectedTag.toLowerCase()),
      );
    }
    if (q) {
      result = result.filter((p) =>
        matchesSearch([p.title, p.excerpt, ...(p.tags || []), p.author?.fullName], q),
      );
    }
    return result;
  }, [posts, selectedTag, q]);

  return (
    <main className="min-h-screen surface-page pt-10">
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid opacity-50" />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 50% 40% at 30% 30%, color-mix(in oklab, var(--color-primary) 14%, transparent), transparent 70%)',
            }}
          />
        </div>

        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 pt-1 sm:pt-2 pb-4 sm:pb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full text-[10px] tracking-widest uppercase font-bold text-blue-700 dark:text-blue-300 border border-blue-500/30 bg-blue-500/10">
            <BookOpen className="w-3 h-3" />
            Stories & Guides
          </span>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-[-0.02em] text-on-surface mb-6 max-w-3xl">
            Stories <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">that inspire</span>
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed">
            Curated travel stories, destination itineraries, visa tips, and insider recommendations from FlynGo travel experts worldwide.
          </p>
        </div>
      </section>

      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 pt-2 pb-8">
        {loading ? (
          <p className="text-sm text-muted">Loading articles…</p>
        ) : (
          <>
            {/* Tag filter pills */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-10">
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium border glass hover:-translate-y-0.5 transition-all ${
                    selectedTag === null
                      ? 'ring-2 ring-blue-500/60 border-blue-500/80 bg-blue-500/15 text-blue-900 dark:text-blue-200'
                      : ''
                  }`}
                  style={{ borderColor: selectedTag === null ? undefined : 'var(--color-outline-variant)' }}
                >
                  <Globe className="w-4 h-4 text-muted" />
                  All Articles
                </button>
                {tags.slice(0, 20).map((tag) => {
                  const isSelected = selectedTag?.toLowerCase() === tag.toLowerCase();
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(isSelected ? null : tag)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium border glass hover:-translate-y-0.5 transition-all ${
                        isSelected
                          ? 'ring-2 ring-blue-500/60 border-blue-500/80 bg-blue-500/15 text-blue-900 dark:text-blue-200'
                          : ''
                      }`}
                      style={{ borderColor: isSelected ? undefined : 'var(--color-outline-variant)' }}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                      {tag}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Articles list header */}
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-on-surface mb-6">
              Latest stories & guides
            </h2>

            {posts.length > 0 && (q || selectedTag) && (
              <SearchResultsBanner query={q || selectedTag || ''} count={shownPosts.length} noun="articles" />
            )}

            {posts.length === 0 ? (
              <div className="rounded-2xl border glass p-12 text-center" style={{ borderColor: 'var(--color-outline-variant)' }}>
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium text-on-surface">No articles published yet</p>
                <p className="text-sm text-muted mt-1">Articles and travel guides will appear here.</p>
              </div>
            ) : shownPosts.length === 0 ? (
              <div className="rounded-2xl border glass p-12 text-center" style={{ borderColor: 'var(--color-outline-variant)' }}>
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium text-on-surface">
                  No articles match &ldquo;{q || selectedTag}&rdquo;.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {shownPosts.map((post) => {
                  const cover = imageSrc(post.featuredImage);
                  const firstTag = post.tags?.[0];

                  return (
                    <div
                      key={post.id}
                      className="group flex flex-col rounded-2xl border glass overflow-hidden hover:-translate-y-1 transition-all"
                      style={{
                        borderColor: 'var(--color-outline-variant)',
                        boxShadow: '0 8px 24px -12px rgba(7, 86, 184, 0.18)',
                      }}
                    >
                      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-blue-500/20 to-cyan-500/10">
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cover}
                            alt={post.title}
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/30 to-tertiary/20">
                            <BookOpen className="w-12 h-12 text-white/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                        {firstTag ? (
                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] tracking-widest uppercase font-bold text-white bg-blue-600/80 backdrop-blur-sm shadow">
                            {firstTag}
                          </span>
                        ) : null}
                        {post.publishedAt ? (
                          <span className="absolute bottom-2.5 left-3 text-xs text-white/90 font-medium drop-shadow flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(post.publishedAt)}
                          </span>
                        ) : null}
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted mb-2">
                          <User className="w-3.5 h-3.5 text-muted" />
                          <span>{post.author?.fullName || 'FlynGo Editorial'}</span>
                        </div>

                        <h3 className="font-display text-lg font-semibold text-on-surface leading-snug line-clamp-2">
                          {post.title}
                        </h3>

                        {post.excerpt && (
                          <p className="text-sm text-on-surface-variant line-clamp-2 mt-2 leading-relaxed">
                            {post.excerpt}
                          </p>
                        )}

                        <div className="mt-auto pt-5">
                          <Link
                            href={`/blog/${post.slug}`}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold border border-outline-variant text-on-surface hover:bg-surface-container-high transition hover:border-primary/50"
                          >
                            Read Article <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-16 py-12">
        <div className="rounded-2xl border p-8 glass" style={{ borderColor: 'var(--color-outline-variant)' }}>
          <h3 className="font-display text-xl font-semibold text-on-surface mb-3">Why read FlynGo Journal?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <Compass className="w-5 h-5 text-primary mb-2" />
              <div className="font-semibold mb-1">Authentic travel stories</div>
              <p className="text-on-surface-variant">First-hand narratives and photo journals from experienced travelers and explorers.</p>
            </div>
            <div>
              <ShieldCheck className="w-5 h-5 text-primary mb-2" />
              <div className="font-semibold mb-1">Verified destination guides</div>
              <p className="text-on-surface-variant">Accurate visa requirements, flight routes, and local customs checked by our team.</p>
            </div>
            <div>
              <Headphones className="w-5 h-5 text-primary mb-2" />
              <div className="font-semibold mb-1">Practical travel tips</div>
              <p className="text-on-surface-variant">Packing lists, currency advice, and cost-saving hacks for effortless trips.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
