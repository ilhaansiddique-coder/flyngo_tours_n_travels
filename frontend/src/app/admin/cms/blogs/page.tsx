'use client';

import { useApi } from '@/hooks/use-api';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal, FormField, FormInput, FormSelect, FormTextarea, ConfirmDialog } from '@/components/admin/ui';
import { useEffect, useState } from 'react';
import { FileText, Plus, Pencil, Trash2 } from 'lucide-react';

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  status: 'published' | 'draft' | 'archived';
  tags: string[];
  featuredImage?: string;
  viewCount: number;
  publishedAt: string | null;
  author: { fullName: string };
  metaTitle?: string;
  metaDescription?: string;
  isPinned?: boolean;
}

interface FormData {
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  status: string;
  metaTitle: string;
  metaDescription: string;
  tags: string;
  isPinned: boolean;
}

const initialForm: FormData = {
  title: '',
  excerpt: '',
  content: '',
  featuredImage: '',
  status: 'draft',
  metaTitle: '',
  metaDescription: '',
  tags: '',
  isPinned: false,
};

export default function CmsBlogsPage() {
  const { listBlogs, createBlog, updateBlog, deleteBlog } = useApi();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ page: number; total: number; totalPages: number }>({
    page: 1,
    total: 0,
    totalPages: 1,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  const fetchBlogs = async (page?: number) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: String(page ?? meta.page) };
      const res = await listBlogs(params);
      const data = res as any;
      setBlogs(Array.isArray(data) ? data : data?.data ?? []);
      setMeta(data?.meta ?? { page: 1, total: 0, totalPages: 1 });
    } catch (err: any) {
      setError(err.message || 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps

    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateModal = () => {
    setEditingBlog(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (blog: Blog) => {
    setEditingBlog(blog);
    setForm({
      title: blog.title || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      featuredImage: blog.featuredImage || '',
      status: blog.status || 'draft',
      metaTitle: blog.metaTitle || '',
      metaDescription: blog.metaDescription || '',
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : '',
      isPinned: blog.isPinned ?? false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        title: form.title,
        excerpt: form.excerpt || undefined,
        content: form.content,
        featuredImage: form.featuredImage || undefined,
        status: form.status,
        metaTitle: form.metaTitle || undefined,
        metaDescription: form.metaDescription || undefined,
        tags: form.tags
          ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        isPinned: form.isPinned,
      };
      if (editingBlog) {
        await updateBlog(editingBlog.id, body);
      } else {
        await createBlog(body);
      }
      setModalOpen(false);
      fetchBlogs(1);
    } catch {
      // error handled silently
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    try {
      await deleteBlog(confirmDelete.id);
      setConfirmDelete({ open: false, id: null });
      fetchBlogs();
    } catch {
      // error handled silently
    }
  };

  const goToPage = (page: number) => {
    setLoading(true);
    setError(null);
    listBlogs({ page: String(page) })
      .then((res: any) => {
        setBlogs(Array.isArray(res) ? res : res?.data ?? []);
        setMeta((res?.meta as typeof meta) ?? { page: 1, total: 0, totalPages: 1 });
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to load blogs');
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
          <Plus className="w-4 h-4" /> New Post
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
            <Button variant="outline" onClick={() => fetchBlogs()}>
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
                  <tr className="text-left text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                    <th className="p-4 font-medium">Title</th>
                    <th className="p-4 font-medium">Tags</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Author</th>
                    <th className="p-4 font-medium">Views</th>
                    <th className="p-4 font-medium">Published</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-gray-500">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>No blog posts found</p>
                      </td>
                    </tr>
                  ) : (
                    blogs.map((b) => (
                      <tr
                        key={b.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                      >
                        <td className="p-4 font-medium max-w-xs">
                          <p className="truncate">{b.title}</p>
                          <p className="text-xs text-gray-500 font-mono">/{b.slug}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1 flex-wrap">
                            {b.tags?.map((tag) => (
                              <Badge key={tag} variant="default">{tag}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={statusBadgeVariant(b.status)}>{b.status}</Badge>
                        </td>
                        <td className="p-4 text-gray-500 text-xs">{b.author?.fullName || '\u2014'}</td>
                        <td className="p-4">{(b.viewCount ?? 0).toLocaleString()}</td>
                        <td className="p-4 text-gray-500 text-xs">{b.publishedAt || '\u2014'}</td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            <button
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600"
                              title="Edit"
                              onClick={() => openEditModal(b)}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 text-gray-500 hover:text-red-600"
                              title="Delete"
                              onClick={() => setConfirmDelete({ open: true, id: b.id })}
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
                Showing {blogs.length} of {meta.total} posts
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
        title={editingBlog ? 'Edit Post' : 'New Post'}
      >
        <form onSubmit={handleSubmit}>
          <FormField label="Title" required>
            <FormInput
              value={form.title}
              onChange={(v) => setForm({ ...form, title: v })}
              placeholder="Blog post title"
              required
            />
          </FormField>

          <FormField label="Excerpt">
            <FormTextarea
              value={form.excerpt}
              onChange={(v) => setForm({ ...form, excerpt: v })}
              placeholder="Short description..."
              rows={2}
            />
          </FormField>

          <FormField label="Content" required>
            <FormTextarea
              value={form.content}
              onChange={(v) => setForm({ ...form, content: v })}
              placeholder="Blog post content..."
              rows={6}
            />
          </FormField>

          <FormField label="Featured Image URL">
            <FormInput
              value={form.featuredImage}
              onChange={(v) => setForm({ ...form, featuredImage: v })}
              placeholder="https://..."
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

          <FormField label="Tags">
            <FormInput
              value={form.tags}
              onChange={(v) => setForm({ ...form, tags: v })}
              placeholder="Comma-separated, e.g. Travel, Guides"
            />
          </FormField>

          <div className="flex items-center gap-6 mb-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPinned}
                onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                className="rounded border-gray-300 dark:border-gray-700 text-brand-600 focus:ring-brand-500"
              />
              Pinned
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingBlog ? 'Update' : 'Create'} Post
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Blog Post"
        message="Are you sure you want to delete this blog post? This action cannot be undone."
      />
    </div>
  );
}
