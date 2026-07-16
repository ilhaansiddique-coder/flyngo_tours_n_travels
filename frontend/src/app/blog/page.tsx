import { Section, Container, SectionHeader } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

const posts = [
  { id: '1', slug: 'top-10-destinations-2026', title: 'Top 10 Must-Visit Destinations in 2026', excerpt: 'From hidden gems to iconic landmarks, explore the destinations that will define travel in 2026.', author: { fullName: 'Sarah Johnson' }, publishedAt: '2026-06-15', tags: ['Destinations', 'Travel Tips'], readTime: '5 min' },
  { id: '2', slug: 'ultimate-bali-travel-guide', title: 'The Ultimate Bali Travel Guide', excerpt: 'Everything you need to know before visiting the Island of the Gods — temples, food, and beaches.', author: { fullName: 'Ahmed Khan' }, publishedAt: '2026-06-01', tags: ['Guides', 'Bali'], readTime: '8 min' },
  { id: '3', slug: 'budget-travel-hacks', title: '15 Budget Travel Hacks That Actually Work', excerpt: 'Travel more while spending less with these insider tips from seasoned globetrotters.', author: { fullName: 'Emily Chen' }, publishedAt: '2026-05-20', tags: ['Budget', 'Travel Tips'], readTime: '6 min' },
  { id: '4', slug: 'solo-travel-safety-tips', title: 'Solo Travel: Essential Safety Tips for 2026', excerpt: 'Stay safe and confident while exploring the world on your own with our comprehensive guide.', author: { fullName: 'Michael Rodriguez' }, publishedAt: '2026-05-10', tags: ['Solo Travel', 'Safety'], readTime: '4 min' },
];

export default function BlogPage() {
  return (
    <>
      <Section background="brand" className="pt-32 pb-24">
        <Container>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white text-center">Blog</h1>
          <p className="mt-4 text-lg text-brand-100 text-center max-w-2xl mx-auto">
            Travel stories, tips, and inspiration from around the world
          </p>
        </Container>
      </Section>
      <Section background="white">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="group h-full">
                  <div className="h-48 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 mb-4" />
                  <div className="flex gap-2 mb-3">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="default">{tag}</Badge>
                    ))}
                  </div>
                  <h3 className="font-display text-xl font-bold group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-500">
                    <span>{post.author.fullName}</span>
                    <div className="flex gap-3">
                      <span>{formatDate(post.publishedAt)}</span>
                      <span>{post.readTime} read</span>
                    </div>
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
