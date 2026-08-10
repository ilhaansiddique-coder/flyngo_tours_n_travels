'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useApi } from '@/hooks/use-api';
import { formatDate } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  content: string;
  featuredImage?: string | null;
  tags?: string[];
  publishedAt?: string | null;
  author?: { fullName?: string | null } | null;
}

// featuredImage is free text in the CMS, so it may hold a non-URL value.
// next/image throws on those, so skip the hero when it isn't usable.
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

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { getBlogBySlug } = useApi();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogBySlug(slug)
      .then((r: any) => setPost(r ?? null))
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [slug, getBlogBySlug]);

  if (loading) {
    return (
      <main className="min-h-screen pt-32 px-4 sm:px-6 lg:px-16 max-w-[860px] mx-auto">
        <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen pt-32 px-4 sm:px-6 lg:px-16 max-w-[860px] mx-auto">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm mb-6 text-accent hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to journal
        </Link>
        <h1 className="text-2xl font-display font-bold text-on-surface">Article not found</h1>
      </main>
    );
  }
  const cover = imageSrc(post.featuredImage);

  return (

    <main className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-16 max-w-[860px] mx-auto">
      <Link href="/blog" className="inline-flex items-center gap-2 text-sm mb-6 text-accent hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to journal
      </Link>

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="cyan">{tag}</Badge>
          ))}
        </div>
      )}

      <h1 className="text-3xl sm:text-4xl font-display font-bold text-on-surface">{post.title}</h1>

      <div className="flex items-center gap-3 mt-4 text-sm text-on-surface-variant">
        <span>{post.author?.fullName ?? 'Fly&Go'}</span>
        {post.publishedAt && <span>· {formatDate(post.publishedAt)}</span>}
      </div>

      {cover && (
        <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden my-8">
          <Image src={cover} alt={post.title} fill className="object-cover" sizes="860px" priority />
        </div>
      )}

      {post.excerpt && (
        <p className="mt-6 text-lg text-on-surface-variant leading-relaxed">{post.excerpt}</p>
      )}

      {/* Content is authored in the admin CMS editor; rendered as plain text
          because the stored value is not sanitised HTML. */}
      <div className="mt-8 text-on-surface leading-relaxed whitespace-pre-wrap">{post.content}</div>
    </main>
  );
}
