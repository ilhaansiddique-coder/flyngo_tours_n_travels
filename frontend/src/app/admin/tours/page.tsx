'use client';

import { useApi } from '@/hooks/use-api';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal, FormField, FormInput, FormSelect, FormTextarea, ConfirmDialog } from '@/components/admin/ui';
import { ImageUploader } from '@/components/admin/image-uploader';
import { CountryAutocomplete } from '@/components/admin/country-autocomplete';
import { MultiCountryAutocomplete } from '@/components/admin/multi-country-autocomplete';
import type { CountryOption } from '@/components/admin/country-autocomplete';
import { tourImage } from '@/lib/entity-image';
import { useEffect, useState } from 'react';
import { Map, Search, Plus, Pencil, Trash2, Share2 } from 'lucide-react';
import { ShareMenu } from '@/components/shared/share-menu';

interface Tour {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  price: number;
  duration: number;
  maxGuests?: number;
  difficulty?: string;
  tourType?: string;
  coverImageUrl?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  destinationId?: string;
  destination?: { id: string; name: string };
  additionalDestinations?: { destination?: { id: string; name: string; flagUrl?: string | null } }[];
  images?: { id: string; url: string; alt?: string }[];
  pointsAwarded?: number;
}

interface FormData {
  title: string;
  destinationId: string;
  description: string;
  price: string;
  duration: string;
  maxGuests: string;
  pointsAwarded: string;
  difficulty: string;
  tourType: string;
  coverImageUrl: string;
  isFeatured: boolean;
  isActive: boolean;
}

const initialForm: FormData = {
  title: '',
  destinationId: '',
  description: '',
  price: '',
  duration: '',
  maxGuests: '',
  pointsAwarded: '',
  difficulty: 'moderate',
  tourType: 'group',
  coverImageUrl: '',
  isFeatured: false,
  isActive: true,
};

export default function AdminToursPage() {
  const { getTours, createTour, updateTour, deleteTour, uploadMedia } = useApi();

  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ page: number; total: number; totalPages: number }>({
    page: 1,
    total: 0,
    totalPages: 1,
  });
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  const [destName, setDestName] = useState('');
  const [additionalNames, setAdditionalNames] = useState<CountryOption[]>([]);

  const fetchTours = async (page?: number) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: String(page ?? meta.page) };
      if (search) params.search = search;
      const res = await getTours(params);
      const data = res as any;
      setTours(Array.isArray(data) ? data : data?.data ?? []);
      setMeta(data?.meta ?? { page: 1, total: 0, totalPages: 1 });
    } catch (err: any) {
      setError(err.message || 'Failed to load tours');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateModal = () => {
    setEditingTour(null);
    setForm(initialForm);
    setDestName('');
    setAdditionalNames([]);
    setModalOpen(true);
  };

  const openEditModal = (tour: Tour) => {
    setEditingTour(tour);
    setForm({
      title: tour.title || '',
      destinationId: tour.destinationId || tour.destination?.id || '',
      description: tour.description || '',
      price: String(tour.price ?? ''),
      duration: String(tour.duration ?? ''),
      maxGuests: String(tour.maxGuests ?? ''),
      pointsAwarded: String(tour.pointsAwarded ?? ''),
      difficulty: tour.difficulty || 'moderate',
      tourType: tour.tourType || 'group',
      coverImageUrl: tour.coverImageUrl || (tour.images?.[0]?.url ?? ''),
      isFeatured: tour.isFeatured ?? false,
      isActive: tour.isActive ?? true,
    });
    setDestName(tour.destination?.name || '');
    setAdditionalNames(
      (tour.additionalDestinations || [])
        .map((ad) => ad.destination)
        .filter((d): d is { id: string; name: string; flagUrl?: string | null } => !!d),
    );
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        title: form.title,
        destinationId: form.destinationId,
        additionalDestinationIds: additionalNames.map((a) => ({
          id: a.id || undefined,
          name: a.name,
        })),
        description: form.description,
        price: Number(form.price),
        duration: Number(form.duration),
        maxGuests: form.maxGuests ? Number(form.maxGuests) : undefined,
        pointsAwarded: form.pointsAwarded ? Number(form.pointsAwarded) : 0,
        difficulty: form.difficulty,
        tourType: form.tourType,
        coverImageUrl: form.coverImageUrl || undefined,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
      };
      if (editingTour) {
        await updateTour(editingTour.id, body);
      } else {
        await createTour(body);
      }
      setModalOpen(false);
      fetchTours(1);
    } catch {
      // error handled silently
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    try {
      await deleteTour(confirmDelete.id);
      setConfirmDelete({ open: false, id: null });
      fetchTours();
    } catch {
      // error handled silently
    }
  };

  const handleSearch = () => {
    fetchTours(1);
  };

  const goToPage = (page: number) => {
    const params: Record<string, string> = { page: String(page) };
    if (search) params.search = search;
    setLoading(true);
    setError(null);
    getTours(params)
      .then((res: any) => {
        setTours(Array.isArray(res) ? res : res?.data ?? []);
        setMeta((res?.meta as typeof meta) ?? { page: 1, total: 0, totalPages: 1 });
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to load tours');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <Input
            placeholder="Search tours..."
            className="pl-9 w-full sm:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
          />
        </div>
        <Button size="md" className="gap-2" onClick={openCreateModal}>
          <Plus className="w-4 h-4" /> Add Tour
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      )}

      {error && !loading && (
        <Card hover={false}>
          <div className="text-center py-12">
            <p className="text-error mb-4">{error}</p>
            <Button variant="outline" onClick={() => fetchTours()}>
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
                    <tr className="text-left text-on-surface-variant bg-surface-container-low">
                    <th className="p-4 font-medium">Image</th>
                    <th className="p-4 font-medium">Title</th>
                    <th className="p-4 font-medium">Destination</th>
                    <th className="p-4 font-medium">Price</th>
                    <th className="p-4 font-medium">Duration</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tours.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-on-surface-variant">
                        <Map className="w-8 h-8 mx-auto mb-2 text-on-surface-variant/40" />
                        <p>No tours found</p>
                      </td>
                    </tr>
                  ) : (
                    tours.map((t) => (
                      <tr
                        key={t.id}
                        className="border-b border-outline-variant hover:bg-surface-container-high"
                      >
                        <td className="p-4">
                          {(() => {
                            const url = tourImage(t);
                            return (
                              <a href={url} target="_blank" rel="noreferrer">
                                <img
                                  src={url}
                                  alt={t.title}
                                  className="w-14 h-10 object-cover rounded-lg border border-outline-variant"
                                />
                              </a>
                            );
                          })()}
                        </td>
                        <td className="p-4 font-medium">{t.title}</td>
                        <td className="p-4 text-on-surface-variant">
                          {t.destination?.name || '—'}
                          {(t.additionalDestinations || []).length > 0 && (
                            <span className="text-on-surface-variant/60">
                              {' '}+{(t.additionalDestinations || []).length} more
                            </span>
                          )}
                        </td>
                        <td className="p-4 font-medium">{formatCurrency(t.price)}</td>
                        <td className="p-4">{t.duration} days</td>
                        <td className="p-4">
                          <Badge variant={t.isActive ? 'success' : 'default'}>
                            {t.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            <ShareMenu
                              path={t.slug ? `/tours/${t.slug}` : `/booking?type=tour&id=${t.id}`}
                              title={t.title}
                              trigger={
                                <button
                                  type="button"
                                  className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-primary"
                                  title="Share"
                                >
                                  <Share2 className="w-4 h-4" />
                                </button>
                              }
                            />
                            <button
                              className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-primary"
                              title="Edit"
                              onClick={() => openEditModal(t)}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1.5 rounded-lg hover:bg-danger-soft text-on-surface-variant hover:text-error"
                              title="Delete"
                              onClick={() => setConfirmDelete({ open: true, id: t.id })}
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
            <div className="flex items-center justify-between text-sm text-on-surface-variant">
              <span>
                Showing {tours.length} of {meta.total} tours
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
        title={editingTour ? 'Edit Tour' : 'Add Tour'}
      >
        <form onSubmit={handleSubmit}>
          <FormField label="Title" required>
            <FormInput
              value={form.title}
              onChange={(v) => setForm({ ...form, title: v })}
              placeholder="Tour title"
              required
            />
          </FormField>

          <FormField label="Destination" required>
            <CountryAutocomplete
              value={destName}
              onChange={(opt) => {
                setDestName(opt.name);
                setForm({ ...form, destinationId: opt.id || '' });
              }}
              placeholder="Select or type a destination/Country…"
            />
          </FormField>

          <FormField label="Additional Destinations">
            <MultiCountryAutocomplete
              value={additionalNames}
              onChange={setAdditionalNames}
              placeholder="Add destinations this tour also visits…"
            />
            <p className="text-xs text-on-surface-variant mt-1">
              Optional. Pick a country or type a new one — it will be created automatically.
            </p>
          </FormField>

          <FormField label="Description">
            <FormTextarea
              value={form.description}
              onChange={(v) => setForm({ ...form, description: v })}
              placeholder="Tour description"
              rows={3}
            />
          </FormField>

          <FormField label="Cover Image">
            <ImageUploader
              value={form.coverImageUrl}
              onChange={(url) => setForm({ ...form, coverImageUrl: url ?? '' })}
              onUpload={async (file) => {
                const res = await uploadMedia(file, { folder: 'tours' });
                return { url: (res as any).url };
              }}
              aspectRatio={1.7777}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Price" required>
              <FormInput
                type="number"
                value={form.price}
                onChange={(v) => setForm({ ...form, price: v })}
                placeholder="0"
                required
              />
            </FormField>
            <FormField label="Duration (days)" required>
              <FormInput
                type="number"
                value={form.duration}
                onChange={(v) => setForm({ ...form, duration: v })}
                placeholder="0"
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Max Guests">
              <FormInput
                type="number"
                value={form.maxGuests}
                onChange={(v) => setForm({ ...form, maxGuests: v })}
                placeholder="Optional"
              />
            </FormField>
            <FormField label="Loyalty points awarded">
              <FormInput
                type="number"
                value={form.pointsAwarded}
                onChange={(v) => setForm({ ...form, pointsAwarded: v })}
                placeholder="0"
              />
            </FormField>
            <FormField label="Difficulty">
              <FormSelect
                value={form.difficulty}
                onChange={(v) => setForm({ ...form, difficulty: v })}
                options={[
                  { label: 'Easy', value: 'easy' },
                  { label: 'Moderate', value: 'moderate' },
                  { label: 'Challenging', value: 'challenging' },
                ]}
              />
            </FormField>
          </div>

          <FormField label="Tour Type">
            <FormSelect
              value={form.tourType}
              onChange={(v) => setForm({ ...form, tourType: v })}
              options={[
                { label: 'Group', value: 'group' },
                { label: 'Private', value: 'private' },
                { label: 'Adventure', value: 'adventure' },
                { label: 'Luxury', value: 'luxury' },
              ]}
            />
          </FormField>

          <div className="flex items-center gap-6 mb-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="rounded border-outline-variant text-primary focus:ring-primary/50"
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="rounded border-outline-variant text-primary focus:ring-primary/50"
              />
              Active
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingTour ? 'Update' : 'Create'} Tour
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Tour"
        message="Are you sure you want to delete this tour? This action cannot be undone."
      />
    </div>
  );
}
