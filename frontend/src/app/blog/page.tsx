import { Section, Container } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHero } from '@/components/ui/page-hero';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const posts = [
  { id: '1', slug: 'top-10-destinations-2026', title: 'Top 10 Must-Visit Destinations in 2026', excerpt: 'From hidden gems to iconic landmarks, explore the destinations that will define travel in 2026.', author: { fullName: 'Sarah Johnson' }, publishedAt: '2026-06-15', tags: ['Destinations', 'Travel Tips'], readTime: '5 min' },
  { id: '2', slug: 'ultimate-bali-travel-guide', title: 'The Ultimate Bali Travel Guide', excerpt: 'Everything you need to know before visiting the Island of the Gods — temples, food, and beaches.', author: { fullName: 'Ahmed Khan' }, publishedAt: '2026-06-01', tags: ['Guides', 'Bali'], readTime: '8 min' },
  { id: '3', slug: 'budget-travel-hacks', title: '15 Budget Travel Hacks That Actually Work', excerpt: 'Travel more while spending less with these insider tips from seasoned globetrotters.', author: { fullName: 'Emily Chen' }, publishedAt: '2026-05-20', tags: ['Budget', 'Travel Tips'], readTime: '6 min' },
  { id: '4', slug: 'solo-travel-safety-tips', title: 'Solo Travel: Essential Safety Tips for 2026', excerpt: 'Stay safe and confident while exploring the world on your own with our comprehensive guide.', author: { fullName: 'Michael Rodriguez' }, publishedAt: '2026-05-10', tags: ['Solo Travel', 'Safety'], readTime: '4 min' },
];

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Stories & Guides"
        title={<>The <span className="gradient-text-warm">Fly&Go</span> Journal</>}
        subtitle="Travel stories, expert tips, and inspiration from around the world."
      />
      <Section>
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                <Card className="group h-full" hover={false}>
                  <div className="relative h-48 rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-primary to-tertiary">
                    <div className="absolute inset-0 bg-grid opacity-40" />
                    <div className="absolute inset-0 scrim-soft" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="cyan">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <h3 className="font-display text-xl font-bold text-on-surface group-hover:text-accent transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-on-surface-variant text-sm line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-hairline text-sm text-on-surface-variant">
                    <span className="text-on-surface/80">{post.author.fullName}</span>
                    <div className="flex gap-3">
                      <span>{formatDate(post.publishedAt)}</span>
                      <span>· {post.readTime}</span>
                    </div>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-accent group-hover:gap-2 transition-all">
                    Read article <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
