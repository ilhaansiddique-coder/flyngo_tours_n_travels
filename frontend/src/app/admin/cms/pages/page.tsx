'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Pencil, Trash2, Globe, Eye, Copy } from 'lucide-react';

const pages = [
  { id: '1', title: 'Homepage', slug: 'home', status: 'published', updatedAt: '2026-07-15', author: 'admin@flyngo.com' },
  { id: '2', title: 'About Us', slug: 'about-us', status: 'published', updatedAt: '2026-07-10', author: 'manager@flyngo.com' },
  { id: '3', title: 'Privacy Policy', slug: 'privacy-policy', status: 'published', updatedAt: '2026-06-28', author: 'admin@flyngo.com' },
  { id: '4', title: 'Terms & Conditions', slug: 'terms-and-conditions', status: 'published', updatedAt: '2026-06-28', author: 'admin@flyngo.com' },
  { id: '5', title: 'Summer Sale Landing', slug: 'summer-sale-2026', status: 'draft', updatedAt: '2026-07-16', author: 'editor@flyngo.com' },
  { id: '6', title: 'Refund Policy', slug: 'refund-policy', status: 'draft', updatedAt: '2026-07-01', author: 'admin@flyngo.com' },
];

export default function CmsPagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search pages..." className="pl-9 w-64" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="md" className="gap-2"><Globe className="w-4 h-4" /> View Site</Button>
          <Button size="md" className="gap-2"><Plus className="w-4 h-4" /> New Page</Button>
        </div>
      </div>

      <Card hover={false} padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                <th className="p-4 font-medium">Page</th>
                <th className="p-4 font-medium">Slug</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Updated</th>
                <th className="p-4 font-medium">Author</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="p-4 font-medium">{p.title}</td>
                  <td className="p-4 font-mono text-xs text-gray-500">/{p.slug}</td>
                  <td className="p-4"><Badge variant={p.status === 'published' ? 'success' : 'warning'}>{p.status}</Badge></td>
                  <td className="p-4 text-gray-500 text-xs">{p.updatedAt}</td>
                  <td className="p-4 text-gray-500 text-xs">{p.author}</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600" title="Edit"><Pencil className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600" title="View"><Eye className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600" title="Duplicate"><Copy className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 text-gray-500 hover:text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></button>
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
