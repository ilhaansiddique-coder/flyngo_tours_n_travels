'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, HelpCircle } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Modal, FormField, FormInput, ConfirmDialog } from '@/components/admin/ui';
import { adminButtonStyle, adminButtonSmStyle } from '@/components/admin/button-styles';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
  isPublished: boolean;
}

const emptyForm = {
  question: '',
  answer: '',
  category: '',
  order: 0,
  isPublished: false,
};

export default function FaqsPage() {
  const { listFaqs, createFaq, updateFaq, deleteFaq } = useApi();

  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchFaqs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listFaqs() as unknown as { items?: FaqItem[]; data?: FaqItem[] };
      setFaqs((res.items ?? res.data ?? []) as FaqItem[]);
    } catch (err: any) {
      setError(err.message || 'Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps

    fetchFaqs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  };

  const openEditModal = (f: FaqItem) => {
    setEditingId(f.id);
    setForm({
      question: f.question,
      answer: f.answer,
      category: f.category ?? '',
      order: f.order,
      isPublished: f.isPublished,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    try {
      const body = {
        question: form.question.trim(),
        answer: form.answer.trim(),
        category: form.category.trim() || undefined,
        order: form.order,
        isPublished: form.isPublished,
      };
      if (editingId) {
        await updateFaq(editingId, body);
      } else {
        await createFaq(body);
      }
      setModalOpen(false);
      fetchFaqs();
    } catch {
      // keep modal open on error
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteFaq(deleteId);
      setDeleteId(null);
      fetchFaqs();
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading FAQs...</p>
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
          <HelpCircle className="w-5 h-5 text-brand-600" /> FAQs
        </h1>
        <button
          onClick={openAddModal}
          style={adminButtonStyle}
          className="hover:opacity-95 active:scale-[0.98] transition-all duration-200"
        >
          <Plus className="w-4 h-4" /> Add FAQ
        </button>
      </div>

      <Card hover={false} padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 dark:bg-surface-container/50">
                <th className="p-4 font-medium">Question</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Order</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {faqs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    No FAQs found
                  </td>
                </tr>
              ) : (
                faqs.map((f) => (
                  <tr key={f.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="p-4 font-medium">{f.question}</td>
                    <td className="p-4">
                      {f.category ? (
                        <Badge variant="info">{f.category}</Badge>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-4">{f.order}</td>
                    <td className="p-4">
                      <Badge variant={f.isPublished ? 'success' : 'warning'}>
                        {f.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <button
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-container-high text-gray-500 hover:text-brand-600"
                          title="Edit"
                          onClick={() => openEditModal(f)}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 text-gray-500 hover:text-red-600"
                          title="Delete"
                          onClick={() => setDeleteId(f.id)}
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit FAQ' : 'Add FAQ'}
      >
        <FormField label="Question" required>
          <FormInput
            value={form.question}
            onChange={(v) => setForm((f) => ({ ...f, question: v }))}
            placeholder="e.g. How do I book a tour?"
            required
          />
        </FormField>

        <FormField label="Answer" required>
          <textarea
            value={form.answer}
            onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
            placeholder="FAQ answer..."
            rows={4}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-surface-container focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none"
            required
          />
        </FormField>

        <FormField label="Category">
          <FormInput
            value={form.category}
            onChange={(v) => setForm((f) => ({ ...f, category: v }))}
            placeholder="e.g. Booking, Payments"
          />
        </FormField>

        <FormField label="Order">
          <input
            type="number"
            min={0}
            value={form.order}
            onChange={(e) => setForm((f) => ({ ...f, order: Math.max(0, Number(e.target.value) || 0) }))}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-surface-container focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
          />
        </FormField>

        <label className="flex items-center gap-2 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm font-medium">Published</span>
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
            disabled={saving || !form.question.trim() || !form.answer.trim()}
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
        title="Delete FAQ"
        message="Are you sure you want to delete this FAQ? This action cannot be undone."
      />
    </div>
  );
}
