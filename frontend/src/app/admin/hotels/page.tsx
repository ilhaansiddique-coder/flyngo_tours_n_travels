'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { useApi } from '@/hooks/use-api';
import { useAuthStore } from '@/stores/auth.store';
import { Modal, FormField, FormInput, FormSelect, FormTextarea, ConfirmDialog } from '@/components/admin/ui';
import { Building2, Plus, Pencil, Trash2, Star, Search } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
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
  isActive: boolean;
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
  address: '',
  amenities: '',
  checkInTime: '',
  checkOutTime: '',
  isActive: true,
};

export default function AdminHotelsPage() {
  const { createHotel, updateHotel, deleteHotel, getDestinations } = useApi();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
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

  const authHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
    return headers;
  };

  const fetchHotels = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page: String(pageNum), limit: String(LIMIT) });
      if (search) params.set('search', search);
      const res = await fetch(`${API_BASE}/hotels?${params}`, { headers: authHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to fetch hotels');
      setHotels(json.data ?? []);
      if (json.meta) setMeta(json.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDestinations = async () => {
    try {
      const res = await fetch(`${API_BASE}/destinations?limit=1000`, { headers: authHeaders() });
      const json = await res.json();
      if (res.ok) {
        setDestinations(json.data ?? []);
      }
    } catch {
      // non-critical
    }
  };

  useEffect(() => {
    fetchHotels(page);
    fetchDestinations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchHotels(1);
  };

  const openCreate = () => {
    setEditingHotel(null);
    setForm({ ...defaultForm });
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
      address: hotel.address || '',
      amenities: Array.isArray(hotel.amenities) ? hotel.amenities.join(', ') : (hotel.amenities || ''),
      checkInTime: hotel.checkInTime || '',
      checkOutTime: hotel.checkOutTime || '',
      isActive: hotel.isActive ?? true,
    });
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
        address: form.address.trim() || undefined,
        amenities: form.amenities
          ? form.amenities.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        checkInTime: form.checkInTime || undefined,
        checkOutTime: form.checkOutTime || undefined,
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
          className={`w-3.5 h-3.5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
        />
      ))}
      <span className="ml-1 text-xs text-gray-400">{rating}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search hotels..."
              className="w-64 pl-9 px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
            />
          </div>
          <Button variant="outline" size="md" onClick={handleSearch}>Search</Button>
        </div>
        <Button size="md" className="gap-2" onClick={openCreate}>
          <Plus className="w-4 h-4" /> Add Hotel
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
          {error}
          <button onClick={() => fetchHotels(page)} className="ml-4 underline">Retry</button>
        </div>
      )}

      <Card hover={false} padding="none">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-600 border-t-transparent" />
          </div>
        ) : hotels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Building2 className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-700" />
            <p className="text-sm">No hotels found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 bg-gray-50 dark:bg-gray-800/50">
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
                    <tr key={h.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="p-4 font-medium">{h.name}</td>
                      <td className="p-4 text-gray-500">{h.destination?.name ?? '—'}</td>
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
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600"
                            title="Edit"
                            onClick={() => openEdit(h)}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 text-gray-500 hover:text-red-600"
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
              <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-500">
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
            <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm mb-2">
              {formError}
            </div>
          )}

          <FormField label="Name" required>
            <FormInput value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Hotel name" required />
          </FormField>

          <FormField label="Destination" required>
            <FormSelect
              value={form.destinationId}
              onChange={(v) => setForm((f) => ({ ...f, destinationId: v }))}
              options={destinations.map((d) => ({ label: d.name, value: d.id }))}
              placeholder="Select a destination"
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
                className="rounded border-gray-300 dark:border-gray-700 text-brand-600 focus:ring-brand-500"
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
    </div>
  );
}
