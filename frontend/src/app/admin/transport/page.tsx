'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal, FormField, FormInput, FormSelect, ConfirmDialog } from '@/components/admin/ui';
import { formatCurrency } from '@/lib/utils';
import { transportImage } from '@/lib/entity-image';
import { useApi } from '@/hooks/use-api';
import { useEffect, useState } from 'react';
import { Car, Plus, Pencil, Trash2, Search } from 'lucide-react';

interface Transport {
  id: string;
  vehicleType: string;
  operatorName?: string;
  title: string;
  originCity: string;
  destinationCity: string;
  boardingPoints: string[];
  droppingPoints: string[];
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
  price: number;
  currency: string;
  totalSeats: number;
  availableSeats: number;
  amenities: string[];
  isActive: boolean;
  pointsAwarded?: number;
}

interface FormData {
  vehicleType: string;
  operatorName: string;
  title: string;
  originCity: string;
  destinationCity: string;
  boardingPoints: string;
  droppingPoints: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: string;
  currency: string;
  totalSeats: string;
  availableSeats: string;
  amenities: string;
  pointsAwarded: string;
  isActive: boolean;
}

const VEHICLE_TYPES = [
  { label: 'Car / Sedan', value: 'car' },
  { label: 'Microbus', value: 'microbus' },
  { label: 'Bus / Coach', value: 'bus' },
  { label: 'Ferry / Launch', value: 'ferry' },
  { label: 'Shuttle', value: 'shuttle' },
  { label: 'SUV / 4x4', value: 'suv' },
];

const initialForm: FormData = {
  vehicleType: 'car',
  operatorName: '',
  title: '',
  originCity: '',
  destinationCity: '',
  boardingPoints: '',
  droppingPoints: '',
  departureTime: '',
  arrivalTime: '',
  duration: '',
  price: '',
  currency: 'BDT',
  totalSeats: '',
  availableSeats: '',
  amenities: '',
  pointsAwarded: '',
  isActive: true,
};

export default function TransportPage() {
  const { getTransport, createTransport, updateTransport, deleteTransport } = useApi();

  const [items, setItems] = useState<Transport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transport | null>(null);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  const fetchItems = async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: String(p), limit: '20' };
      if (search) params.search = search;
      const res = await getTransport(params);
      const data = res as any;
      if (Array.isArray(data)) {
        setItems(data);
        setTotalPages(1);
      } else {
        setItems(data?.items ?? data?.data ?? []);
        setTotalPages(data?.meta?.totalPages ?? 1);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load transport options');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps

    fetchItems(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateModal = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (t: Transport) => {
    setEditing(t);
    setForm({
      vehicleType: t.vehicleType,
      operatorName: t.operatorName || '',
      title: t.title,
      originCity: t.originCity,
      destinationCity: t.destinationCity,
      boardingPoints: (t.boardingPoints || []).join(', '),
      droppingPoints: (t.droppingPoints || []).join(', '),
      departureTime: t.departureTime || '',
      arrivalTime: t.arrivalTime || '',
      duration: t.duration || '',
      price: String(t.price),
      currency: t.currency || 'BDT',
      totalSeats: String(t.totalSeats || 0),
      availableSeats: String(t.availableSeats || 0),
      amenities: (t.amenities || []).join(', '),
      pointsAwarded: String(t.pointsAwarded ?? ''),
      isActive: t.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        vehicleType: form.vehicleType,
        operatorName: form.operatorName || undefined,
        title: form.title,
        originCity: form.originCity,
        destinationCity: form.destinationCity,
        boardingPoints: form.boardingPoints.split(',').map((s) => s.trim()).filter(Boolean),
        droppingPoints: form.droppingPoints.split(',').map((s) => s.trim()).filter(Boolean),
        departureTime: form.departureTime || undefined,
        arrivalTime: form.arrivalTime || undefined,
        duration: form.duration || undefined,
        price: Number(form.price),
        currency: form.currency,
        totalSeats: Number(form.totalSeats) || 0,
        availableSeats: Number(form.availableSeats) || 0,
        amenities: form.amenities.split(',').map((s) => s.trim()).filter(Boolean),
        pointsAwarded: form.pointsAwarded ? Number(form.pointsAwarded) : 0,
        isActive: form.isActive,
      };
      if (editing) {
        await updateTransport(editing.id, body);
      } else {
        await createTransport(body);
      }
      setModalOpen(false);
      fetchItems(1);
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    try {
      await deleteTransport(confirmDelete.id);
      setConfirmDelete({ open: false, id: null });
      fetchItems(page);
    } catch {
      // silently fail
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <Input
            placeholder="Search transport..."
            className="pl-9 w-full sm:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') fetchItems(1); }}
          />
        </div>
        <Button size="md" className="gap-2" onClick={openCreateModal}>
          <Plus className="w-4 h-4" /> Add Transport
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
            <Button variant="outline" onClick={() => fetchItems(page)}>Retry</Button>
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
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Route</th>
                    <th className="p-4 font-medium">Departure</th>
                    <th className="p-4 font-medium">Price</th>
                    <th className="p-4 font-medium">Seats</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-12 text-center text-on-surface-variant">
                        <Car className="w-8 h-8 mx-auto mb-2 text-on-surface-variant/40" />
                        <p>No transport options found</p>
                      </td>
                    </tr>
                  ) : (
                    items.map((t) => (
                      <tr key={t.id} className="border-b border-outline-variant hover:bg-surface-container-high">
                        <td className="p-4">
                          {(() => {
                            const url = transportImage(t);
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
                        <td className="p-4 capitalize">{t.vehicleType}</td>
                        <td className="p-4 text-xs">{t.originCity} → {t.destinationCity}</td>
                        <td className="p-4 text-xs">{t.departureTime || '\u2014'}</td>
                        <td className="p-4 font-medium">{formatCurrency(Number(t.price), t.currency || 'BDT')}</td>
                        <td className="p-4 text-xs">{t.availableSeats}/{t.totalSeats}</td>
                        <td className="p-4">
                          <Badge variant={t.isActive ? 'success' : 'default'}>
                            {t.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-on-surface-variant">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { setPage(page - 1); fetchItems(page - 1); }}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => { setPage(page + 1); fetchItems(page + 1); }}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Transport' : 'Add Transport'}>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Vehicle Type" required>
              <FormSelect
                value={form.vehicleType}
                onChange={(v) => setForm({ ...form, vehicleType: v })}
                options={VEHICLE_TYPES}
              />
            </FormField>
            <FormField label="Operator">
              <FormInput
                value={form.operatorName}
                onChange={(v) => setForm({ ...form, operatorName: v })}
                placeholder="e.g. Green Line, Shyamoli"
              />
            </FormField>
          </div>

          <FormField label="Title" required>
            <FormInput
              value={form.title}
              onChange={(v) => setForm({ ...form, title: v })}
              placeholder="e.g. Dhaka to Cox's Bazar AC Bus"
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Origin City" required>
              <FormInput
                value={form.originCity}
                onChange={(v) => setForm({ ...form, originCity: v })}
                placeholder="e.g. Dhaka"
                required
              />
            </FormField>
            <FormField label="Destination City" required>
              <FormInput
                value={form.destinationCity}
                onChange={(v) => setForm({ ...form, destinationCity: v })}
                placeholder="e.g. Cox's Bazar"
                required
              />
            </FormField>
          </div>

          <FormField label="Boarding Points (comma-separated)">
            <FormInput
              value={form.boardingPoints}
              onChange={(v) => setForm({ ...form, boardingPoints: v })}
              placeholder="e.g. Gabtoli, Mohakhali, Farmgate"
            />
          </FormField>
          <FormField label="Dropping Points (comma-separated)">
            <FormInput
              value={form.droppingPoints}
              onChange={(v) => setForm({ ...form, droppingPoints: v })}
              placeholder="e.g. Kolatoli, Sugandha, Teknaf"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Departure">
              <FormInput
                value={form.departureTime}
                onChange={(v) => setForm({ ...form, departureTime: v })}
                placeholder="e.g. 10:30 PM"
              />
            </FormField>
            <FormField label="Arrival">
              <FormInput
                value={form.arrivalTime}
                onChange={(v) => setForm({ ...form, arrivalTime: v })}
                placeholder="e.g. 06:00 AM"
              />
            </FormField>
            <FormField label="Duration">
              <FormInput
                value={form.duration}
                onChange={(v) => setForm({ ...form, duration: v })}
                placeholder="e.g. 8h"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Price" required>
              <FormInput
                type="number"
                value={form.price}
                onChange={(v) => setForm({ ...form, price: v })}
                placeholder="0"
                required
              />
            </FormField>
            <FormField label="Total Seats" required>
              <FormInput
                type="number"
                value={form.totalSeats}
                onChange={(v) => setForm({ ...form, totalSeats: v })}
                placeholder="0"
                required
              />
            </FormField>
            <FormField label="Available" required>
              <FormInput
                type="number"
                value={form.availableSeats}
                onChange={(v) => setForm({ ...form, availableSeats: v })}
                placeholder="0"
                required
              />
            </FormField>
          </div>

          <FormField label="Loyalty points awarded">
            <FormInput
              type="number"
              value={form.pointsAwarded}
              onChange={(v) => setForm({ ...form, pointsAwarded: v })}
              placeholder="0"
            />
          </FormField>

          <FormField label="Currency">
            <FormSelect
              value={form.currency}
              onChange={(v) => setForm({ ...form, currency: v })}
              options={[
                { label: 'BDT (৳)', value: 'BDT' },
              ]}
            />
          </FormField>

          <FormField label="Amenities (comma-separated)">
            <FormInput
              value={form.amenities}
              onChange={(v) => setForm({ ...form, amenities: v })}
              placeholder="e.g. AC, WiFi, Water, TV"
            />
          </FormField>

          <div className="flex items-center gap-6 mb-4">
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
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>
              {editing ? 'Update' : 'Create'} Transport
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Transport"
        message="Are you sure you want to delete this transport option?"
      />
    </div>
  );
}
