'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Pencil, Trash2, Eye, Calendar, Tag } from 'lucide-react';

const blogs = [
  { id: '1', title: 'Top 10 Destinations in 2026', slug: 'top-10-destinations-2026', status: 'published', tags: ['Destinations', 'Travel Tips'], author: 'admin@flyngo.com', published: '2026-06-15', views: 3420 },
  { id: '2', title: 'Ultimate Bali Travel Guide', slug: 'ultimate-bali-travel-guide', status: 'published', tags: ['Guides', 'Bali'], author: 'manager@flyngo.com', published: '2026-06-01', views: 2890 },
  { id: '3', title: '15 Budget Travel Hacks', slug: 'budget-travel-hacks', status: 'published', tags: ['Budget', 'Travel Tips'], author: 'editor@flyngo.com', published: '2026-05-20', views: 5100 },
  { id: '4', title: 'Solo Travel Safety Tips', slug: 'solo-travel-safety-tips', status: 'draft', tags: ['Solo Travel'], author: 'admin@flyngo.com', published: null, views: 0 },
  { id: '5', title: 'Best Time to Visit Japan', slug: 'best-time-visit-japan', status: 'draft', tags: ['Japan', 'Guides'], author: 'editor@flyngo.com', published: null, views: 0 },
];

export default function CmsBlogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search blog posts..." className="pl-9 w-64" />
        </div>
        <Button size="md" className="gap-2"><Plus className="w-4 h-4" /> New Post</Button>
      </div>

      <Card hover={false} padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Tags</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Author</th>
                <th className="p-4 font-medium">Published</th>
                <th className="p-4 font-medium">Views</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((b) => (
                <tr key={b.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="p-4 font-medium max-w-xs">
                    <p className="truncate">{b.title}</p>
                    <p className="text-xs text-gray-500 font-mono">/{b.slug}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      {b.tags.map((tag) => (<Badge key={tag} variant="default">{tag}</Badge>))}
                    </div>
                  </td>
                  <td className="p-4"><Badge variant={b.status === 'published' ? 'success' : 'warning'}>{b.status}</Badge></td>
                  <td className="p-4 text-gray-500 text-xs">{b.author}</td>
                  <td className="p-4 text-gray-500 text-xs">{b.published || '—'}</td>
                  <td className="p-4">{b.views.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600"><Pencil className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600"><Eye className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
