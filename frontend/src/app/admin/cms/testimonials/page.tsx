'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Pencil, Trash2, Star } from 'lucide-react';

const testimonials = [
  { id: '1', customer: 'Sarah Johnson', title: 'Solo Traveler', content: 'Amazing experience booking with Flyngo.', rating: 5, status: 'approved', date: '2026-07-10' },
  { id: '2', customer: 'Ahmed Khan', title: 'Family Traveler', content: 'Family trip to Dubai was seamless from start to finish.', rating: 5, status: 'approved', date: '2026-07-05' },
  { id: '3', customer: 'Emily Chen', title: 'Adventure Enthusiast', content: 'Tokyo tour exceeded all expectations.', rating: 5, status: 'approved', date: '2026-06-28' },
  { id: '4', customer: 'John Smith', title: 'Business Traveler', content: 'Great corporate booking experience. Highly recommended.', rating: 4, status: 'pending', date: '2026-07-16' },
];

export default function TestimonialsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search testimonials..." className="pl-9 w-64" />
        </div>
        <Button size="md" className="gap-2"><Plus className="w-4 h-4" /> Add Testimonial</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((t) => (
          <Card key={t.id} hover={false}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-medium">{t.customer}</p>
                <p className="text-xs text-gray-500">{t.title}</p>
              </div>
              <Badge variant={t.status === 'approved' ? 'success' : 'warning'}>{t.status}</Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t.content}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600"><Pencil className="w-4 h-4" /></button>
                <button className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
