'use client';

import { useEffect, useState } from 'react';
import { MapPin, Plus, Pencil, Trash2, Star } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Modal, FormField, FormInput, FormSelect, ConfirmDialog } from '@/components/admin/ui';

interface DestinationItem {
  id: string;
  name: string;
  slug: string;
  country: string;
  continent?: string;
  description?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  isFeatured?: boolean;
  _count?: { tours: number; hotels: number };
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const emptyForm = {
  name: '',
  country: '',
  continent: '',
  description: '',
  imageUrl: '',
  latitude: '',
  longitude: '',
  isFeatured: false,
};

export default function AdminDestinationsPage() {
  const { getDestinations, createDestination, updateDestination, deleteDestination } = useApi();

  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchDestinations = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDestinations({ page: String(page), limit: '10' }) as unknown as { data: DestinationItem[]; meta: PaginationMeta };
      setDestinations(res.data ?? []);
      setMeta(res.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 });
    } catch (err: any) {
      setError(err.message || 'Failed to load destinations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps

    fetchDestinations(meta.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  };

  const openEditModal = (d: DestinationItem) => {
    setEditingId(d.id);
    setForm({
      name: d.name,
      country: d.country,
      continent: d.continent ?? '',
      description: d.description ?? '',
      imageUrl: d.imageUrl ?? '',
      latitude: d.latitude != null ? String(d.latitude) : '',
      longitude: d.longitude != null ? String(d.longitude) : '',
      isFeatured: d.isFeatured ?? false,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.country.trim()) return;
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        country: form.country.trim(),
        continent: form.continent.trim() || undefined,
        description: form.description.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
        isFeatured: form.isFeatured,
      };
      if (editingId) {
        await updateDestination(editingId, body);
      } else {
        await createDestination(body);
      }
      setModalOpen(false);
      fetchDestinations(meta.page);
    } catch (err: any) {
      // keep modal open on error
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDestination(deleteId);
      setDeleteId(null);
      fetchDestinations(meta.page);
    } catch {
      // ignore
    }
  };

  const goToPage = (p: number) => {
    if (p < 1 || p > meta.totalPages) return;
    fetchDestinations(p);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading destinations...</p>
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
          <MapPin className="w-5 h-5 text-brand-600" /> Destinations
        </h1>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-all duration-200"
        >
          <Plus className="w-4 h-4" /> Add Destination
        </button>
      </div>

      <Card hover={false} padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Country</th>
                <th className="p-4 font-medium">Continent</th>
                <th className="p-4 font-medium">Tours</th>
                <th className="p-4 font-medium">Hotels</th>
                <th className="p-4 font-medium">Featured</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {destinations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    No destinations found
                  </td>
                </tr>
              ) : (
                destinations.map((d) => (
                  <tr key={d.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="p-4 font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {d.name}
                    </td>
                    <td className="p-4 text-gray-500">{d.country}</td>
                    <td className="p-4">{d.continent ?? '—'}</td>
                    <td className="p-4">{d._count?.tours ?? 0}</td>
                    <td className="p-4">{d._count?.hotels ?? 0}</td>
                    <td className="p-4">
                      {d.isFeatured ? (
                        <Badge variant="warning">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3" /> Featured
                          </span>
                        </Badge>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <button
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600"
                          title="Edit"
                          onClick={() => openEditModal(d)}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 text-gray-500 hover:text-red-600"
                          title="Delete"
                          onClick={() => setDeleteId(d.id)}
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

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <span className="text-sm text-gray-500">
              Page {meta.page} of {meta.totalPages} ({meta.total} total)
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => goToPage(meta.page - 1)}
                disabled={meta.page <= 1}
                className="px-3 py-1 text-sm rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={
                    p === meta.page
                      ? 'px-3 py-1 text-sm rounded-lg bg-brand-600 text-white'
                      : 'px-3 py-1 text-sm rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => goToPage(meta.page + 1)}
                disabled={meta.page >= meta.totalPages}
                className="px-3 py-1 text-sm rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Destination' : 'Add Destination'}
      >
        <FormField label="Name" required>
          <FormInput
            value={form.name}
            onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            placeholder="e.g. Bali"
            required
          />
        </FormField>

        <FormField label="Country" required>
          <FormInput
            value={form.country}
            onChange={(v) => setForm((f) => ({ ...f, country: v }))}
            placeholder="e.g. Indonesia"
            required
          />
        </FormField>

        <FormField label="Continent">
          <FormSelect
            value={form.continent}
            onChange={(v) => setForm((f) => ({ ...f, continent: v }))}
            placeholder="Select continent"
            options={[
              { label: 'Africa', value: 'Africa' },
              { label: 'Antarctica', value: 'Antarctica' },
              { label: 'Asia', value: 'Asia' },
              { label: 'Europe', value: 'Europe' },
              { label: 'North America', value: 'North America' },
              { label: 'Oceania', value: 'Oceania' },
              { label: 'South America', value: 'South America' },
            ]}
          />
        </FormField>

        <FormField label="Description">
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Brief description..."
            rows={3}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none"
          />
        </FormField>

        <FormField label="Image URL">
          <FormInput
            value={form.imageUrl}
            onChange={(v) => setForm((f) => ({ ...f, imageUrl: v }))}
            placeholder="https://..."
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Latitude">
            <FormInput
              value={form.latitude}
              onChange={(v) => setForm((f) => ({ ...f, latitude: v }))}
              placeholder="e.g. -8.3405"
              type="number"
            />
          </FormField>
          <FormField label="Longitude">
            <FormInput
              value={form.longitude}
              onChange={(v) => setForm((f) => ({ ...f, longitude: v }))}
              placeholder="e.g. 115.0920"
              type="number"
            />
          </FormField>
        </div>

        <label className="flex items-center gap-2 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm font-medium">Featured destination</span>
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
            disabled={saving || !form.name.trim() || !form.country.trim()}
            className="px-4 py-2 text-sm rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Destination"
        message="Are you sure you want to delete this destination? This action cannot be undone."
      />
    </div>
  );
}
