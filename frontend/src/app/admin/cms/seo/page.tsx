'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Globe, Save } from 'lucide-react';

const seoItems = [
  { id: '1', url: '/', title: 'Flyngo — Tours & Travels', description: 'Discover extraordinary journeys with Flyngo. Book tours, hotels, flights, and visa services worldwide.', keywords: 'travel, tours, hotels, flights, visa', ogImage: '/og-home.jpg', indexed: true, sitemap: true },
  { id: '2', url: '/tours', title: 'Tour Packages | Flyngo', description: 'Explore our curated tour packages to destinations worldwide.', keywords: 'tour packages, holiday packages, travel tours', ogImage: '/og-tours.jpg', indexed: true, sitemap: true },
  { id: '3', url: '/destinations/bali', title: 'Bali Travel Guide | Flyngo', description: 'Discover the best tours, hotels, and activities in Bali.', keywords: 'bali travel, bali tours, bali hotels', ogImage: '/og-bali.jpg', indexed: true, sitemap: true },
  { id: '4', url: '/about', title: 'About Flyngo — Your Trusted Travel Partner', description: 'Learn about Flyngo Tours & Travels.', keywords: 'about flyngo, travel company', ogImage: '/og-about.jpg', indexed: true, sitemap: true },
];

export default function SeoPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search URLs..." className="pl-9 w-64" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="md" className="gap-2"><Globe className="w-4 h-4" /> Generate Sitemap</Button>
          <Button size="md" className="gap-2"><Save className="w-4 h-4" /> Save All</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {seoItems.map((item) => (
          <Card key={item.id} hover={false}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="font-mono text-sm text-brand-600">{item.url}</span>
                </div>
                <div className="flex gap-2">
                  <Badge variant={item.indexed ? 'success' : 'warning'}>{item.indexed ? 'Indexed' : 'Noindex'}</Badge>
                  <Badge variant={item.sitemap ? 'info' : 'default'}>{item.sitemap ? 'Sitemap' : 'No Sitemap'}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Meta Title</label>
                  <Input value={item.title} className="text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Meta Keywords</label>
                  <Input value={item.keywords} className="text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Meta Description</label>
                <textarea className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" rows={2} value={item.description} readOnly />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">OG Image</label>
                <Input value={item.ogImage} className="text-sm" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
