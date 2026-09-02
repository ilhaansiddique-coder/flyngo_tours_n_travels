'use client';

import { useApi } from '@/hooks/use-api';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal, FormField, FormInput, FormSelect, FormTextarea, ConfirmDialog } from '@/components/admin/ui';
import { useEffect, useState } from 'react';
import { FileText, Plus, Pencil, Trash2 } from 'lucide-react';

interface Page {
  id: string;
  title: string;
  slug: string;
  content?: string;
  status: 'published' | 'draft' | 'archived';
  metaTitle?: string;
  metaDescription?: string;
  updatedAt: string;
}

interface FormData {
  title: string;
  content: string;
  status: string;
  metaTitle: string;
  metaDescription: string;
}

const initialForm: FormData = {
  title: '',
  content: '',
  status: 'draft',
  metaTitle: '',
  metaDescription: '',
};

export default function CmsPagesPage() {
  const { listPages, createPage, updatePage, deletePage } = useApi();

  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ page: number; total: number; totalPages: number }>({
    page: 1,
    total: 0,
    totalPages: 1,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  const fetchPages = async (page?: number) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: String(page ?? meta.page) };
      const res = await listPages(params);
      const data = res as any;
      setPages(Array.isArray(data) ? data : data?.data ?? []);
      setMeta(data?.meta ?? { page: 1, total: 0, totalPages: 1 });
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

  const openCreateModal = () => {
    setEditingPage(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (page: Page) => {
    setEditingPage(page);
    setForm({
      title: page.title || '',
      content: page.content || '',
      status: page.status || 'draft',
      metaTitle: page.metaTitle || '',
      metaDescription: page.metaDescription || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        title: form.title,
        content: form.content,
        status: form.status,
        metaTitle: form.metaTitle || undefined,
        metaDescription: form.metaDescription || undefined,
      };
      if (editingPage) {
        await updatePage(editingPage.id, body);
      } else {
        await createPage(body);
      }
      setModalOpen(false);
      fetchPages(1);
    } catch {
      // error handled silently
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    try {
      await deletePage(confirmDelete.id);
      setConfirmDelete({ open: false, id: null });
      fetchPages();
    } catch {
      // error handled silently
    }
  };

  const goToPage = (page: number) => {
    setLoading(true);
    setError(null);
    listPages({ page: String(page) })
      .then((res: any) => {
        setPages(Array.isArray(res) ? res : res?.data ?? []);
        setMeta((res?.meta as typeof meta) ?? { page: 1, total: 0, totalPages: 1 });
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to load pages');
      })
      .finally(() => setLoading(false));
  };

  const statusBadgeVariant = (status: string) => {
    if (status === 'published') return 'success' as const;
    if (status === 'draft') return 'warning' as const;
    return 'default' as const;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div />
        <Button size="md" className="gap-2" onClick={openCreateModal}>
          <Plus className="w-4 h-4" /> New Page
        </Button>
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
            <Button variant="outline" onClick={() => fetchPages()}>
              Retry
            </Button>
          </div>
        </Card>
      )}

      {!loading && !error && (
        <>
          <Card hover={false} padding="none">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 bg-gray-50 dark:bg-surface-container/50">
                    <th className="p-4 font-medium">Title</th>
                    <th className="p-4 font-medium">Slug</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Updated</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-gray-500">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>No pages found</p>
                      </td>
                    </tr>
                  ) : (
                    pages.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                      >
                        <td className="p-4 font-medium">{p.title}</td>
                        <td className="p-4 font-mono text-xs text-gray-500">/{p.slug}</td>
                        <td className="p-4">
                          <Badge variant={statusBadgeVariant(p.status)}>{p.status}</Badge>
                        </td>
                        <td className="p-4 text-gray-500 text-xs">{p.updatedAt}</td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            <button
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-container-high text-gray-500 hover:text-brand-600"
                              title="Edit"
                              onClick={() => openEditModal(p)}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 text-gray-500 hover:text-red-600"
                              title="Delete"
                              onClick={() => setConfirmDelete({ open: true, id: p.id })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                Showing {pages.length} of {meta.total} pages
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page <= 1}
                  onClick={() => goToPage(meta.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => goToPage(meta.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPage ? 'Edit Page' : 'New Page'}
      >
        <form onSubmit={handleSubmit}>
          <FormField label="Title" required>
            <FormInput
              value={form.title}
              onChange={(v) => setForm({ ...form, title: v })}
              placeholder="Page title"
              required
            />
          </FormField>

          <FormField label="Content">
            <FormTextarea
              value={form.content}
              onChange={(v) => setForm({ ...form, content: v })}
              placeholder="Page content..."
              rows={6}
            />
          </FormField>

          <FormField label="Status">
            <FormSelect
              value={form.status}
              onChange={(v) => setForm({ ...form, status: v })}
              options={[
                { label: 'Draft', value: 'draft' },
                { label: 'Published', value: 'published' },
                { label: 'Archived', value: 'archived' },
              ]}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Meta Title">
              <FormInput
                value={form.metaTitle}
                onChange={(v) => setForm({ ...form, metaTitle: v })}
                placeholder="SEO title"
              />
            </FormField>
            <FormField label="Meta Description">
              <FormInput
                value={form.metaDescription}
                onChange={(v) => setForm({ ...form, metaDescription: v })}
                placeholder="SEO description"
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingPage ? 'Update' : 'Create'} Page
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Page"
        message="Are you sure you want to delete this page? This action cannot be undone."
      />
    </div>
  );
}
