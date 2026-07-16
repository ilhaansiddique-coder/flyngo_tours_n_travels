'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { Search, Upload, Trash2, Image, File, Film, Music } from 'lucide-react';

const mediaItems = [
  { id: '1', name: 'hero-banner.jpg', type: 'image', size: '2.4 MB', dimensions: '1920x1080', url: '#', uploadedAt: '2026-07-15' },
  { id: '2', name: 'bali-beach.jpg', type: 'image', size: '1.8 MB', dimensions: '1600x900', url: '#', uploadedAt: '2026-07-14' },
  { id: '3', name: 'dubai-skyline.jpg', type: 'image', size: '3.1 MB', dimensions: '2000x1200', url: '#', uploadedAt: '2026-07-13' },
  { id: '4', name: 'welcome-video.mp4', type: 'video', size: '45.2 MB', dimensions: '—', url: '#', uploadedAt: '2026-07-12' },
  { id: '5', name: 'brochure-2026.pdf', type: 'document', size: '8.5 MB', dimensions: '—', url: '#', uploadedAt: '2026-07-10' },
  { id: '6', name: 'paris-eiffel.jpg', type: 'image', size: '2.1 MB', dimensions: '1800x1200', url: '#', uploadedAt: '2026-07-08' },
];

const typeIcons: Record<string, any> = {
  image: Image, video: Film, document: File, audio: Music,
};

export default function MediaPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search media..." className="pl-9 w-64" />
        </div>
        <Button size="md" className="gap-2"><Upload className="w-4 h-4" /> Upload</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {mediaItems.map((m) => {
          const Icon = typeIcons[m.type] || File;
          return (
            <Card key={m.id} hover className="group">
              <div className="h-32 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3 overflow-hidden relative">
                {m.type === 'image' ? (
                  <div className="w-full h-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                    <Image className="w-8 h-8 text-white/60" />
                  </div>
                ) : (
                  <Icon className="w-8 h-8 text-gray-400" />
                )}
                <button className="absolute top-2 right-2 p-1 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs font-medium truncate">{m.name}</p>
              <p className="text-xs text-gray-500">{m.size}</p>
              <p className="text-xs text-gray-400">{m.uploadedAt}</p>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center">
        <div className="flex gap-1">
          <button className="px-3 py-1 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200">Prev</button>
          <button className="px-3 py-1 rounded-lg text-sm bg-brand-600 text-white">1</button>
          <button className="px-3 py-1 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200">Next</button>
        </div>
      </div>
    </div>
  );
}
