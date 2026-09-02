'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { useApi } from '@/hooks/use-api';
import { Modal, FormField, FormInput, FormSelect, FormTextarea, ConfirmDialog } from '@/components/admin/ui';
import { ImageUploader } from '@/components/admin/image-uploader';
import { CountryAutocomplete } from '@/components/admin/country-autocomplete';
import { HotelRoomsManager } from '@/components/admin/hotel-rooms-manager';
import { hotelImage } from '@/lib/entity-image';
import { Building2, Plus, Pencil, Trash2, Star, Search, BedDouble } from 'lucide-react';

const LIMIT = 10;

interface Destination {
  id: string;
  name: string;
}

interface Hotel {
  id: string;
  name: string;
  description: string;
  destination?: Destination | null;
  destinationId?: string;
  starRating: number;
  pricePerNight: number;
  address?: string;
  amenities?: string[];
  checkInTime?: string;
  checkOutTime?: string;
  coverImageUrl?: string;
  isActive: boolean;
  pointsAwarded?: number;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const defaultForm = {
  name: '',
  destinationId: '',
  description: '',
  starRating: 3,
  pricePerNight: '',
  pointsAwarded: '',
  address: '',
  amenities: '',
  checkInTime: '',
  checkOutTime: '',
  coverImageUrl: '',
  isActive: true,
};

export default function AdminHotelsPage() {
  const { getHotels, createHotel, updateHotel, deleteHotel, uploadMedia } = useApi();

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [destName, setDestName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: LIMIT, totalPages: 0 });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [form, setForm] = useState({ ...defaultForm });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [roomsHotel, setRoomsHotel] = useState<Hotel | null>(null);

  const fetchHotels = async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: String(pageNum), limit: String(LIMIT) };
      if (search) params.search = search;
      const res = await getHotels(params);
      const data = res as any;
      setHotels(Array.isArray(data) ? data : data?.data ?? []);
      if (data?.meta) setMeta(data.meta);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch hotels');
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps

    fetchHotels(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchHotels(1);
  };

  const openCreate = () => {
    setEditingHotel(null);
    setForm({ ...defaultForm });
    setDestName('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setForm({
      name: hotel.name || '',
      destinationId: hotel.destinationId || hotel.destination?.id || '',
      description: hotel.description || '',
      starRating: hotel.starRating || 3,
      pricePerNight: String(hotel.pricePerNight || ''),
      pointsAwarded: String(hotel.pointsAwarded ?? ''),
      address: hotel.address || '',
      amenities: Array.isArray(hotel.amenities) ? hotel.amenities.join(', ') : (hotel.amenities || ''),
      checkInTime: hotel.checkInTime || '',
      checkOutTime: hotel.checkOutTime || '',
      coverImageUrl: hotel.coverImageUrl || '',
      isActive: hotel.isActive ?? true,
    });
    setDestName(hotel.destination?.name || '');
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setFormError(null);
    if (!form.name.trim() || !form.destinationId || !form.description.trim() || !form.pricePerNight) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        destinationId: form.destinationId,
        description: form.description.trim(),
        starRating: Number(form.starRating),
        pricePerNight: Number(form.pricePerNight),
        pointsAwarded: form.pointsAwarded ? Number(form.pointsAwarded) : 0,
        address: form.address.trim() || undefined,
        amenities: form.amenities
          ? form.amenities.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        checkInTime: form.checkInTime || undefined,
        checkOutTime: form.checkOutTime || undefined,
        coverImageUrl: form.coverImageUrl || undefined,
        isActive: form.isActive,
      };
      if (editingHotel) {
        await updateHotel(editingHotel.id, body);
      } else {
        await createHotel(body);
      }
      setModalOpen(false);
      fetchHotels(page);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save hotel');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id: string) => setDeleteId(id);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteHotel(deleteId);
      setDeleteId(null);
      fetchHotels(page);
    } catch {
      // error could be shown via toast
    } finally {
      setDeleting(false);
    }
  };

  const renderStarRating = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-on-surface-variant/30'}`}
        />
      ))}
      <span className="ml-1 text-xs text-on-surface-variant/40">{rating}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search hotels..."
              className="w-64 pl-9 px-4 py-2.5 text-sm border border-outline-variant rounded-xl bg-surface-container text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-transparent outline-none"
            />
          </div>
          <Button variant="outline" size="md" onClick={handleSearch}>Search</Button>
        </div>
        <Button size="md" className="gap-2" onClick={openCreate}>
          <Plus className="w-4 h-4" /> Add Hotel
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-error-container border border-error/30 rounded-xl text-on-error-container text-sm">
          {error}
          <button onClick={() => fetchHotels(page)} className="ml-4 underline">Retry</button>
        </div>
      )}

      <Card hover={false} padding="none">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        ) : hotels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <Building2 className="w-12 h-12 mb-3 text-on-surface-variant/40" />
            <p className="text-sm">No hotels found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-on-surface-variant bg-surface-container-low">
                    <th className="p-4 font-medium">Image</th>
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Destination</th>
                    <th className="p-4 font-medium">Price/Night</th>
                    <th className="p-4 font-medium">Star Rating</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hotels.map((h) => (
                      <tr key={h.id} className="border-b border-outline-variant hover:bg-surface-container-high">
                      <td className="p-4">
                        {(() => {
                          const url = hotelImage(h);
                          return (
                            <a href={url} target="_blank" rel="noreferrer">
                              <img
                                src={url}
                                alt={h.name}
                                className="w-14 h-10 object-cover rounded-lg border border-outline-variant"
                              />
                            </a>
                          );
                        })()}
                      </td>
                      <td className="p-4 font-medium">{h.name}</td>
                      <td className="p-4 text-on-surface-variant">{h.destination?.name ?? '—'}</td>
                      <td className="p-4 font-medium">{formatCurrency(h.pricePerNight)}</td>
                      <td className="p-4">{renderStarRating(h.starRating)}</td>
                      <td className="p-4">
                        <Badge variant={h.isActive ? 'success' : 'warning'}>
                          {h.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <button
                            className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-primary"
                            title="Manage rooms"
                            onClick={() => setRoomsHotel(h)}
                          >
                            <BedDouble className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-primary"
                            title="Edit"
                            onClick={() => openEdit(h)}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 rounded-lg hover:bg-danger-soft text-on-surface-variant hover:text-error"
                            title="Delete"
                            onClick={() => confirmDelete(h.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-outline-variant">
                <p className="text-sm text-on-surface-variant">
                  Showing {((meta.page - 1) * meta.limit) + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                    <Button
                      key={p}
                      variant={p === meta.page ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.page >= meta.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingHotel ? 'Edit Hotel' : 'Add Hotel'}>
        <div className="space-y-1">
          {formError && (
            <div className="p-3 bg-error-container border border-error/30 rounded-lg text-on-error-container text-sm mb-2">
              {formError}
            </div>
          )}

          <FormField label="Name" required>
            <FormInput value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Hotel name" required />
          </FormField>

          <FormField label="Destination" required>
            <CountryAutocomplete
              value={destName}
              onChange={(opt) => {
                setDestName(opt.name);
                setForm((f) => ({ ...f, destinationId: opt.id || '' }));
              }}
              placeholder="Select or type a destination…"
            />
          </FormField>

          <FormField label="Description" required>
            <FormTextarea
              value={form.description}
              onChange={(v) => setForm((f) => ({ ...f, description: v }))}
              placeholder="Hotel description"
              rows={3}
            />
          </FormField>

          <FormField label="Cover Image">
            <ImageUploader
              value={form.coverImageUrl}
              onChange={(url) => setForm((f) => ({ ...f, coverImageUrl: url ?? '' }))}
              onUpload={async (file) => {
                const res = await uploadMedia(file, { folder: 'hotels' });
                return { url: (res as any).url };
              }}
              aspectRatio={1.7777}
            />
          </FormField>

          <FormField label="Star Rating">
            <FormSelect
              value={String(form.starRating)}
              onChange={(v) => setForm((f) => ({ ...f, starRating: Number(v) }))}
              options={[
                { label: '1 Star', value: '1' },
                { label: '2 Stars', value: '2' },
                { label: '3 Stars', value: '3' },
                { label: '4 Stars', value: '4' },
                { label: '5 Stars', value: '5' },
              ]}
            />
          </FormField>

          <FormField label="Price/Night" required>
            <FormInput
              value={form.pricePerNight}
              onChange={(v) => setForm((f) => ({ ...f, pricePerNight: v }))}
              placeholder="299"
              type="number"
              required
            />
          </FormField>

          <FormField label="Loyalty points awarded">
            <FormInput
              value={form.pointsAwarded}
              onChange={(v) => setForm((f) => ({ ...f, pointsAwarded: v }))}
              placeholder="0"
              type="number"
            />
          </FormField>

          <FormField label="Address">
            <FormInput
              value={form.address}
              onChange={(v) => setForm((f) => ({ ...f, address: v }))}
              placeholder="123 Main Street, City"
            />
          </FormField>

          <FormField label="Amenities">
            <FormInput
              value={form.amenities}
              onChange={(v) => setForm((f) => ({ ...f, amenities: v }))}
              placeholder="WiFi, Pool, Spa (comma-separated)"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Check-in Time">
              <FormInput
                value={form.checkInTime}
                onChange={(v) => setForm((f) => ({ ...f, checkInTime: v }))}
                placeholder="14:00"
                type="time"
              />
            </FormField>
            <FormField label="Check-out Time">
              <FormInput
                value={form.checkOutTime}
                onChange={(v) => setForm((f) => ({ ...f, checkOutTime: v }))}
                placeholder="12:00"
                type="time"
              />
            </FormField>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="rounded border-outline-variant text-primary focus:ring-primary/50"
              />
              <span className="font-medium">Active</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="md" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button size="md" loading={saving} onClick={handleSave}>
              {editingHotel ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Hotel"
        message="Are you sure you want to delete this hotel? This action cannot be undone."
      />

      <HotelRoomsManager
        open={roomsHotel !== null}
        hotelId={roomsHotel?.id ?? null}
        hotelName={roomsHotel?.name}
        onClose={() => setRoomsHotel(null)}
      />
    </div>
  );
}
