'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Calendar, Users } from 'lucide-react';

export function SearchBar() {
  const [tab, setTab] = useState<'tours' | 'hotels' | 'flights'>('tours');

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-black/10 p-6 sm:p-8 max-w-5xl mx-auto -mt-16 relative z-20 border border-gray-100 dark:border-gray-800">
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {(['tours', 'hotels', 'flights'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              tab === t
                ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Where to?"
            className="pl-10"
          />
        </div>
        {tab === 'flights' && (
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="From?"
              className="pl-10"
            />
          </div>
        )}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input type="date" className="pl-10" />
        </div>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input type="number" placeholder="Guests" min={1} defaultValue={1} className="pl-10" />
        </div>
        <Button size="lg" className="w-full gap-2 shadow-lg shadow-brand-500/25">
          <Search className="w-5 h-5" />
          Search
        </Button>
      </div>
    </div>
  );
}
