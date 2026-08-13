'use client';

import { useEffect, useState } from 'react';
import { MapPin, Plus, Pencil, Trash2, Star } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Modal, FormField, FormInput, FormSelect, ConfirmDialog } from '@/components/admin/ui';
import { ImageUploader } from '@/components/admin/image-uploader';
import { adminButtonStyle, adminButtonSmStyle } from '@/components/admin/button-styles';

interface DestinationItem {
  id: string;
  name: string;
  slug: string;
  country: string;
  continent?: string;
  description?: string;
  imageUrl?: string;
  coverImageUrl?: string;
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
  coverImageUrl: '',
  latitude: '',
  longitude: '',
  isFeatured: false,
};

export default function AdminDestinationsPage() {
  const { getDestinations, createDestination, updateDestination, deleteDestination, uploadMedia } = useApi();

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
      const res = (await getDestinations({ page: String(page), limit: '10' })) as unknown as {
        data?: DestinationItem[];
        meta?: PaginationMeta;
      };
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
      coverImageUrl: d.coverImageUrl ?? '',
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
        coverImageUrl: form.coverImageUrl.trim() || undefined,
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-brand-600" /> Destinations
        </h1>
        <button
          onClick={openAddModal}
          type="button"
          style={adminButtonStyle}
          className="hover:opacity-95 active:scale-[0.98] transition-all duration-200"
        >
          <Plus className="w-4 h-4" /> Add Destination
        </button>
      </div>

      {error && (
        <div className="text-center py-8">
          <p className="text-error">{error}</p>
        </div>
      )}

      <Card hover={false} padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-on-surface-variant bg-surface-container-low">
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-on-surface-variant">
                    <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2 align-middle" />
                    Loading destinations...
                  </td>
                </tr>
              ) : destinations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-on-surface-variant/40">
                    No destinations found
                  </td>
                </tr>
              ) : (
                destinations.map((d) => (
                  <tr key={d.id} className="border-b border-outline-variant hover:bg-surface-container-high">
                    <td className="p-4 font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-on-surface-variant/40" />
                      {d.name}
                    </td>
                    <td className="p-4 text-on-surface-variant">{d.country}</td>
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
                        <span className="text-on-surface-variant/40">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <button
                          className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-primary"
                          title="Edit"
                          onClick={() => openEditModal(d)}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 rounded-lg hover:bg-danger-soft text-on-surface-variant hover:text-error"
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant">
            <span className="text-sm text-on-surface-variant">
              Page {meta.page} of {meta.totalPages} ({meta.total} total)
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => goToPage(meta.page - 1)}
                disabled={meta.page <= 1}
                className="px-3 py-1 text-sm rounded-lg border border-outline-variant hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  style={p === meta.page ? adminButtonSmStyle : undefined}
                  className={
                    p === meta.page
                      ? 'hover:opacity-95'
                      : 'px-3 py-1 text-sm rounded-lg border border-outline-variant hover:bg-surface-container-high'
                  }
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => goToPage(meta.page + 1)}
                disabled={meta.page >= meta.totalPages}
                className="px-3 py-1 text-sm rounded-lg border border-outline-variant hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
          />
        </FormField>

        <FormField label="Image URL">
          <FormInput
            value={form.imageUrl}
            onChange={(v) => setForm((f) => ({ ...f, imageUrl: v }))}
            placeholder="https://..."
          />
        </FormField>

        <FormField label="Cover Image">
          <ImageUploader
            value={form.coverImageUrl}
            onChange={(url) => setForm((f) => ({ ...f, coverImageUrl: url ?? '' }))}
            onUpload={async (file) => {
              const res = await uploadMedia(file, { folder: 'destinations' });
              return { url: (res as any).url };
            }}
            aspectRatio={1.7777}
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
            className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/50"
          />
          <span className="text-sm font-medium">Featured destination</span>
        </label>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 text-sm rounded-lg border border-outline-variant hover:bg-surface-container-high"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.name.trim() || !form.country.trim()}
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
        title="Delete Destination"
        message="Are you sure you want to delete this destination? This action cannot be undone."
      />
    </div>
  );
}
