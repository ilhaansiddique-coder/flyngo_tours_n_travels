'use client';

import { useApi } from '@/hooks/use-api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { Search, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Page {
  id: string;
  title: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
}

export default function SeoPage() {
  const { listPages, updatePage } = useApi();

  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [edits, setEdits] = useState<Record<string, { metaTitle: string; metaDescription: string }>>({});

  const fetchPages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listPages();
      const data = res as any;
      const items: Page[] = Array.isArray(data) ? data : data?.data ?? [];
      setPages(items);
      const initialEdits: Record<string, { metaTitle: string; metaDescription: string }> = {};
      items.forEach((p) => {
        initialEdits[p.id] = {
          metaTitle: p.metaTitle || '',
          metaDescription: p.metaDescription || '',
        };
      });
      setEdits(initialEdits);
    } catch (err: any) {
      setError(err.message || 'Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps

    fetchPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (page: Page) => {
    const edit = edits[page.id];
    if (!edit) return;

    setSaving((prev) => ({ ...prev, [page.id]: true }));
    try {
      await updatePage(page.id, {
        metaTitle: edit.metaTitle || undefined,
        metaDescription: edit.metaDescription || undefined,
      });
      toast.success(`SEO saved for "${page.title}"`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save SEO');
    } finally {
      setSaving((prev) => ({ ...prev, [page.id]: false }));
    }
  };

  const updateEdit = (pageId: string, field: 'metaTitle' | 'metaDescription', value: string) => {
    setEdits((prev) => ({
      ...prev,
      [pageId]: { ...prev[pageId], [field]: value },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search pages..." className="pl-9 w-64" />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
        </div>
      )}

      {error && !loading && (
        <Card hover={false}>
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button variant="outline" onClick={fetchPages}>
              Retry
            </Button>
          </div>
        </Card>
      )}

      {!loading && !error && pages.length === 0 && (
        <Card hover={false}>
          <div className="text-center py-12">
            <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500">No pages found</p>
          </div>
        </Card>
      )}

      {!loading && !error && pages.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {pages.map((page) => {
            const edit = edits[page.id];
            return (
              <Card key={page.id} hover={false}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{page.title}</h3>
                      <p className="font-mono text-sm text-gray-500 dark:text-gray-400">/{page.slug}</p>
                    </div>
                    <Button
                      size="sm"
                      className="gap-2"
                      loading={saving[page.id]}
                      onClick={() => handleSave(page)}
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Meta Title
                      </label>
                      <Input
                        value={edit?.metaTitle ?? ''}
                        onChange={(e) => updateEdit(page.id, 'metaTitle', e.target.value)}
                        placeholder="Enter meta title"
                        className="text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Meta Description
                      </label>
                      <textarea
                        value={edit?.metaDescription ?? ''}
                        onChange={(e) => updateEdit(page.id, 'metaDescription', e.target.value)}
                        placeholder="Enter meta description"
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-surface-container-low text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 mt-1"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
