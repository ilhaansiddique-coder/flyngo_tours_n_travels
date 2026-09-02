'use client';

import { useEffect, useState } from 'react';
import { Star, Plus, Pencil, Trash2 } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Modal, FormField, FormInput, ConfirmDialog } from '@/components/admin/ui';
import { adminButtonStyle, adminButtonSmStyle } from '@/components/admin/button-styles';

interface TestimonialItem {
  id: string;
  customerName: string;
  customerTitle?: string;
  content: string;
  rating: number;
  isApproved: boolean;
}

const emptyForm = {
  customerName: '',
  customerTitle: '',
  content: '',
  rating: 5,
  isApproved: false,
};

export default function TestimonialsPage() {
  const { listTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } = useApi();

  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchTestimonials = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listTestimonials() as unknown as { items?: TestimonialItem[]; data?: TestimonialItem[] };
      setTestimonials((res.items ?? res.data ?? []) as TestimonialItem[]);
    } catch (err: any) {
      setError(err.message || 'Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps

    fetchTestimonials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  };

  const openEditModal = (t: TestimonialItem) => {
    setEditingId(t.id);
    setForm({
      customerName: t.customerName,
      customerTitle: t.customerTitle ?? '',
      content: t.content,
      rating: t.rating,
      isApproved: t.isApproved,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.customerName.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      const body = {
        customerName: form.customerName.trim(),
        customerTitle: form.customerTitle.trim() || undefined,
        content: form.content.trim(),
        rating: form.rating,
        isApproved: form.isApproved,
      };
      if (editingId) {
        await updateTestimonial(editingId, body);
      } else {
        await createTestimonial(body);
      }
      setModalOpen(false);
      fetchTestimonials();
    } catch {
      // keep modal open on error
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTestimonial(deleteId);
      setDeleteId(null);
      fetchTestimonials();
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading testimonials...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> Testimonials
        </h1>
        <button
          onClick={openAddModal}
          style={adminButtonStyle}
          className="hover:opacity-95 active:scale-[0.98] transition-all duration-200"
        >
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            No testimonials found
          </div>
        ) : (
          testimonials.map((t) => (
            <Card key={t.id} hover={false}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium">{t.customerName}</p>
                  {t.customerTitle && (
                    <p className="text-xs text-gray-500">{t.customerTitle}</p>
                  )}
                </div>
                <Badge variant={t.isApproved ? 'success' : 'warning'}>
                  {t.isApproved ? 'Approved' : 'Pending'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                {t.content}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-1">
                  <button
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-container-high text-gray-500 hover:text-brand-600"
                    title="Edit"
                    onClick={() => openEditModal(t)}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 text-gray-500 hover:text-red-600"
                    title="Delete"
                    onClick={() => setDeleteId(t.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Testimonial' : 'Add Testimonial'}
      >
        <FormField label="Customer Name" required>
          <FormInput
            value={form.customerName}
            onChange={(v) => setForm((f) => ({ ...f, customerName: v }))}
            placeholder="e.g. Sarah Johnson"
            required
          />
        </FormField>

        <FormField label="Customer Title">
          <FormInput
            value={form.customerTitle}
            onChange={(v) => setForm((f) => ({ ...f, customerTitle: v }))}
            placeholder="e.g. Solo Traveler"
          />
        </FormField>

        <FormField label="Content" required>
          <textarea
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            placeholder="Testimonial content..."
            rows={4}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-surface-container focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none"
            required
          />
        </FormField>

        <FormField label="Rating">
          <input
            type="number"
            min={1}
            max={5}
            value={form.rating}
            onChange={(e) => setForm((f) => ({ ...f, rating: Math.min(5, Math.max(1, Number(e.target.value) || 1)) }))}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-surface-container focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
          />
        </FormField>

        <label className="flex items-center gap-2 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isApproved}
            onChange={(e) => setForm((f) => ({ ...f, isApproved: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm font-medium">Approved</span>
        </label>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.customerName.trim() || !form.content.trim()}
            style={adminButtonSmStyle}
            className="hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Testimonial"
        message="Are you sure you want to delete this testimonial? This action cannot be undone."
      />
    </div>
  );
}
