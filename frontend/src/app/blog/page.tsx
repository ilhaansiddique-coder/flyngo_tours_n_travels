'use client';

import { Section, Container } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHero } from '@/components/ui/page-hero';
import { formatDate } from '@/lib/utils';
import { useApi } from '@/hooks/use-api';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

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

// featuredImage is free text in the CMS, so it may hold a non-URL value.
// next/image throws on those, so fall back to the gradient placeholder.
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
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data: any = await getBlogs();
        setPosts(data.data ?? data ?? []);
      } catch (err: any) {
        setError(err.message || 'Failed to load articles');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [getBlogs]);

  return (
    <>
      <PageHero
        eyebrow="Stories & Guides"
        title={<>The <span className="gradient-text-warm">FlynGo</span> Journal</>}
        subtitle="Travel stories, expert tips, and inspiration from around the world."
      />
      <Section>
        <Container>
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-on-surface-variant">Loading articles...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-error">{error}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-on-surface-variant">No articles published yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => {
                const cover = imageSrc(post.featuredImage);
                return (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                    <Card className="group h-full" hover={false}>
                      <div className="relative h-48 rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-primary to-tertiary">
                        {cover ? (
                          <Image
                            src={cover}
                            alt={post.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-grid opacity-40" />
                        )}
                        <div className="absolute inset-0 scrim-soft" />
                        {post.tags && post.tags.length > 0 && (
                          <div className="absolute top-3 left-3 flex gap-2">
                            {post.tags.map((tag) => (
                              <Badge key={tag} variant="cyan">{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <h3 className="font-display text-xl font-bold text-on-surface group-hover:text-accent transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="mt-2 text-on-surface-variant text-sm line-clamp-2">{post.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-hairline text-sm text-on-surface-variant">
                        <span className="text-on-surface/80">{post.author?.fullName ?? 'FlynGo'}</span>
                        {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
                      </div>
                      <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-accent group-hover:gap-2 transition-all">
                        Read article <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
