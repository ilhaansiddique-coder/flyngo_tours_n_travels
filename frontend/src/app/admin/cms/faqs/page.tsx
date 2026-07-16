'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Pencil, Trash2, GripVertical } from 'lucide-react';

const faqs = [
  { id: '1', question: 'How do I book a tour?', category: 'Booking', order: 1, status: 'published' },
  { id: '2', question: 'What payment methods do you accept?', category: 'Payments', order: 2, status: 'published' },
  { id: '3', question: 'Can I cancel my booking?', category: 'Booking', order: 3, status: 'published' },
  { id: '4', question: 'Do you provide visa assistance?', category: 'Services', order: 4, status: 'published' },
  { id: '5', question: 'Is travel insurance included?', category: 'Services', order: 5, status: 'draft' },
];

export default function FaqsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search FAQs..." className="pl-9 w-64" />
        </div>
        <Button size="md" className="gap-2"><Plus className="w-4 h-4" /> Add FAQ</Button>
      </div>

      <Card hover={false} padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                <th className="p-4 font-medium w-8" />
                <th className="p-4 font-medium">Question</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Order</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {faqs.map((f) => (
                <tr key={f.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="p-4"><GripVertical className="w-4 h-4 text-gray-400 cursor-grab" /></td>
                  <td className="p-4 font-medium">{f.question}</td>
                  <td className="p-4"><Badge variant="info">{f.category}</Badge></td>
                  <td className="p-4">{f.order}</td>
                  <td className="p-4"><Badge variant={f.status === 'published' ? 'success' : 'warning'}>{f.status}</Badge></td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600"><Pencil className="w-4 h-4" /></button>
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
