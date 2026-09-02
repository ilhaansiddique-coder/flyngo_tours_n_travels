'use client';

import { useCallback, useEffect, useState } from 'react';
import { Modal, FormField, FormInput } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/use-api';
import { Plus, Pencil, Trash2, BedDouble, Users, Loader2 } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  description?: string | null;
  pricePerNight: number | string;
  currency: string;
  capacity: number;
  available: number;
  amenities?: string[];
}

const blankRoom = {
  name: '',
  description: '',
  pricePerNight: '',
  currency: 'BDT',
  capacity: '2',
  available: '1',
  amenities: '',
};

/**
 * Per-hotel bookable-room inventory manager. Hotel bookings require a Room row,
 * so admins need to create/edit/delete rooms here. Backed by the nested
 * /hotels/:hotelId/rooms endpoints.
 */
export function HotelRoomsManager({
  hotelId,
  hotelName,
  open,
  onClose,
}: {
  hotelId: string | null;
  hotelName?: string;
  open: boolean;
  onClose: () => void;
}) {
  const { getHotelRooms, createHotelRoom, updateHotelRoom, deleteHotelRoom } = useApi();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // room id, or 'new'
  const [form, setForm] = useState({ ...blankRoom });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!hotelId) return;
    setLoading(true);
    try {
      const res: any = await getHotelRooms(hotelId);
      setRooms(res?.items ?? res?.data ?? []);
    } catch (e: any) {
      setError(e.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, [hotelId, getHotelRooms]);

  useEffect(() => {
    if (open && hotelId) {
      setEditingId(null);
      setError(null);
      load();
    }
  }, [open, hotelId, load]);

  const startNew = () => {
    setForm({ ...blankRoom });
    setEditingId('new');
  };

  const startEdit = (r: Room) => {
    setForm({
      name: r.name,
      description: r.description || '',
      pricePerNight: String(r.pricePerNight ?? ''),
      currency: r.currency || 'BDT',
      capacity: String(r.capacity ?? 2),
      available: String(r.available ?? 1),
      amenities: Array.isArray(r.amenities) ? r.amenities.join(', ') : '',
    });
    setEditingId(r.id);
  };

  const save = async () => {
    if (!hotelId) return;
    if (!form.name.trim() || !form.pricePerNight) {
      setError('Room name and price per night are required');
      return;
    }
    setSaving(true);
    setError(null);
    const body = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      pricePerNight: Number(form.pricePerNight) || 0,
      currency: form.currency.trim() || 'BDT',
      capacity: Number(form.capacity) || 1,
      available: Number(form.available) || 0,
      amenities: form.amenities.split(',').map((a) => a.trim()).filter(Boolean),
    };
    try {
      if (editingId === 'new') await createHotelRoom(hotelId, body);
      else if (editingId) await updateHotelRoom(hotelId, editingId, body);
      setEditingId(null);
      await load();
    } catch (e: any) {
      setError(e.message || 'Failed to save room');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (roomId: string) => {
    if (!hotelId) return;
    try {
      await deleteHotelRoom(hotelId, roomId);
      await load();
    } catch (e: any) {
      setError(e.message || 'Failed to delete room');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Rooms${hotelName ? ` — ${hotelName}` : ''}`}>
      {error && (
        <div className="mb-3 rounded-lg border border-error/30 bg-error-container px-3 py-2 text-sm text-on-error-container">
          {error}
        </div>
      )}

      {editingId ? (
        <div className="space-y-3">
          <FormField label="Room name" required>
            <FormInput value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="e.g. Deluxe King" />
          </FormField>
          <FormField label="Description">
            <FormInput value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="Optional" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Price / night" required>
              <FormInput value={form.pricePerNight} onChange={(v) => setForm((f) => ({ ...f, pricePerNight: v }))} type="number" placeholder="0" />
            </FormField>
            <FormField label="Currency">
              <FormInput value={form.currency} onChange={(v) => setForm((f) => ({ ...f, currency: v }))} placeholder="BDT" />
            </FormField>
            <FormField label="Capacity (guests)">
              <FormInput value={form.capacity} onChange={(v) => setForm((f) => ({ ...f, capacity: v }))} type="number" placeholder="2" />
            </FormField>
            <FormField label="Rooms available">
              <FormInput value={form.available} onChange={(v) => setForm((f) => ({ ...f, available: v }))} type="number" placeholder="1" />
            </FormField>
          </div>
          <FormField label="Amenities">
            <FormInput value={form.amenities} onChange={(v) => setForm((f) => ({ ...f, amenities: v }))} placeholder="WiFi, AC, Breakfast (comma-separated)" />
          </FormField>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
            <Button size="sm" loading={saving} onClick={save}>{editingId === 'new' ? 'Add room' : 'Save room'}</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3 flex justify-end">
            <Button size="sm" className="gap-1.5" onClick={startNew}><Plus className="h-4 w-4" /> Add room</Button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8 text-on-surface-variant"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : rooms.length === 0 ? (
            <div className="rounded-xl border border-outline-variant py-8 text-center text-sm text-on-surface-variant">
              <BedDouble className="mx-auto mb-2 h-8 w-8 opacity-40" />
              No rooms yet. Add at least one so this hotel is bookable.
            </div>
          ) : (
            <ul className="space-y-2">
              {rooms.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-outline-variant p-3">
                  <div className="min-w-0">
                    <div className="font-medium text-on-surface">{r.name}</div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-on-surface-variant">
                      <span className="font-semibold text-on-surface">{r.currency} {Number(r.pricePerNight).toLocaleString()}/night</span>
                      <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {r.capacity}</span>
                      <span>{r.available} available</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high hover:text-primary" title="Edit" onClick={() => startEdit(r)}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg p-1.5 text-on-surface-variant hover:bg-danger-soft hover:text-error" title="Delete" onClick={() => remove(r.id)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Modal>
  );
}
