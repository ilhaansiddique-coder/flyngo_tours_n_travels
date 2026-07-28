'use client';

import { useEffect, useState } from 'react';
import { Plane, Plus, Pencil, Trash2, ArrowRight } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal, FormField, FormInput, FormSelect, ConfirmDialog } from '@/components/admin/ui';

interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  originCode: string;
  originCity?: string;
  destinationCode: string;
  destinationCity?: string;
  departureTime: string;
  arrivalTime: string;
  duration?: number;
  price: number;
  availableSeats?: number;
  cabinClass?: string;
  isActive: boolean;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const emptyForm = {
  airline: '',
  flightNumber: '',
  originCode: '',
  originCity: '',
  destinationCode: '',
  destinationCity: '',
  departureTime: '',
  arrivalTime: '',
  duration: '',
  price: '',
  availableSeats: '',
  cabinClass: 'economy',
  isActive: true,
};

export default function AdminFlightsPage() {
  const { getFlights, createFlight, updateFlight, deleteFlight } = useApi();

  const [flights, setFlights] = useState<Flight[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Flight | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchFlights = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res: any = await getFlights({ page: String(page), limit: String(meta.limit) });
      if (res && res.data) {
        setFlights(res.data);
        if (res.meta) setMeta(res.meta);
      } else if (Array.isArray(res)) {
        setFlights(res);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load flights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (flight: Flight) => {
    setEditingId(flight.id);
    setFormData({
      airline: flight.airline || '',
      flightNumber: flight.flightNumber || '',
      originCode: flight.originCode || '',
      originCity: flight.originCity || '',
      destinationCode: flight.destinationCode || '',
      destinationCity: flight.destinationCity || '',
      departureTime: flight.departureTime ? flight.departureTime.slice(0, 16) : '',
      arrivalTime: flight.arrivalTime ? flight.arrivalTime.slice(0, 16) : '',
      duration: flight.duration != null ? String(flight.duration) : '',
      price: flight.price != null ? String(flight.price) : '',
      availableSeats: flight.availableSeats != null ? String(flight.availableSeats) : '',
      cabinClass: flight.cabinClass || 'economy',
      isActive: flight.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        airline: formData.airline,
        flightNumber: formData.flightNumber,
        originCode: formData.originCode,
        originCity: formData.originCity || undefined,
        destinationCode: formData.destinationCode,
        destinationCity: formData.destinationCity || undefined,
        departureTime: formData.departureTime ? new Date(formData.departureTime).toISOString() : undefined,
        arrivalTime: formData.arrivalTime ? new Date(formData.arrivalTime).toISOString() : undefined,
        duration: formData.duration ? Number(formData.duration) : undefined,
        price: Number(formData.price),
        availableSeats: formData.availableSeats ? Number(formData.availableSeats) : undefined,
        cabinClass: formData.cabinClass,
        isActive: formData.isActive,
      };

      if (editingId) {
        await updateFlight(editingId, body);
      } else {
        await createFlight(body);
      }

      setModalOpen(false);
      fetchFlights(meta.page);
    } catch (e: any) {
      setError(e.message || 'Failed to save flight');
    } finally {
      setSaving(false);
    }
  };

  const openDelete = (flight: Flight) => {
    setDeleteTarget(flight);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteFlight(deleteTarget.id);
      setDeleteOpen(false);
      setDeleteTarget(null);
      const newPage = flights.length === 1 && meta.page > 1 ? meta.page - 1 : meta.page;
      fetchFlights(newPage);
    } catch (e: any) {
      setError(e.message || 'Failed to delete flight');
    } finally {
      setDeleting(false);
    }
  };

  const updateForm = (key: keyof typeof emptyForm, value: string | boolean) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const requiredFields = !formData.airline || !formData.flightNumber || !formData.originCode || !formData.destinationCode || !formData.departureTime || !formData.arrivalTime || !formData.price;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Flights</h1>
          <p className="text-gray-500 text-sm mt-1">Manage flight schedules and pricing</p>
        </div>
        <Button size="md" onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Add Flight
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm">{error}</div>
      )}

      <Card hover={false} padding="none">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Plane className="w-6 h-6 animate-pulse mr-3" />
            Loading flights...
          </div>
        ) : flights.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Plane className="w-10 h-10 mb-3" />
            <p className="text-sm">No flights found</p>
            <button onClick={openCreate} className="mt-2 text-sm text-brand-600 hover:text-brand-700 font-medium">
              Add your first flight
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                    <th className="p-4 font-medium">Airline</th>
                    <th className="p-4 font-medium">Flight No.</th>
                    <th className="p-4 font-medium">Route</th>
                    <th className="p-4 font-medium">Price</th>
                    <th className="p-4 font-medium">Seats</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {flights.map((f) => (
                    <tr
                      key={f.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                    >
                      <td className="p-4 font-medium">{f.airline}</td>
                      <td className="p-4 font-mono text-xs">{f.flightNumber}</td>
                      <td className="p-4 text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          {f.originCode}
                          <ArrowRight className="w-3 h-3" />
                          {f.destinationCode}
                        </span>
                      </td>
                      <td className="p-4 font-medium">{formatCurrency(f.price)}</td>
                      <td className="p-4">{f.availableSeats ?? '-'}</td>
                      <td className="p-4">
                        <Badge variant={f.isActive ? 'success' : 'warning'}>
                          {f.isActive ? 'active' : 'inactive'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEdit(f)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDelete(f)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 text-gray-500 hover:text-red-600"
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
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-500">
                  Page {meta.page} of {meta.totalPages} ({meta.total} total)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchFlights(meta.page - 1)}
                    disabled={meta.page <= 1}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchFlights(meta.page + 1)}
                    disabled={meta.page >= meta.totalPages}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Flight' : 'Add Flight'}
      >
        <FormField label="Airline" required>
          <FormInput
            value={formData.airline}
            onChange={(v) => updateForm('airline', v)}
            placeholder="e.g. Emirates"
          />
        </FormField>

        <FormField label="Flight Number" required>
          <FormInput
            value={formData.flightNumber}
            onChange={(v) => updateForm('flightNumber', v)}
            placeholder="e.g. EK501"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Origin Code" required>
            <FormInput
              value={formData.originCode}
              onChange={(v) => updateForm('originCode', v)}
              placeholder="e.g. JFK"
            />
          </FormField>
          <FormField label="Origin City">
            <FormInput
              value={formData.originCity}
              onChange={(v) => updateForm('originCity', v)}
              placeholder="e.g. New York"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Destination Code" required>
            <FormInput
              value={formData.destinationCode}
              onChange={(v) => updateForm('destinationCode', v)}
              placeholder="e.g. DXB"
            />
          </FormField>
          <FormField label="Destination City">
            <FormInput
              value={formData.destinationCity}
              onChange={(v) => updateForm('destinationCity', v)}
              placeholder="e.g. Dubai"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Departure Time" required>
            <FormInput
              type="datetime-local"
              value={formData.departureTime}
              onChange={(v) => updateForm('departureTime', v)}
            />
          </FormField>
          <FormField label="Arrival Time" required>
            <FormInput
              type="datetime-local"
              value={formData.arrivalTime}
              onChange={(v) => updateForm('arrivalTime', v)}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Duration (minutes)">
            <FormInput
              type="number"
              value={formData.duration}
              onChange={(v) => updateForm('duration', v)}
              placeholder="e.g. 360"
            />
          </FormField>
          <FormField label="Price" required>
            <FormInput
              type="number"
              value={formData.price}
              onChange={(v) => updateForm('price', v)}
              placeholder="e.g. 899"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Available Seats">
            <FormInput
              type="number"
              value={formData.availableSeats}
              onChange={(v) => updateForm('availableSeats', v)}
              placeholder="e.g. 120"
            />
          </FormField>
          <FormField label="Cabin Class">
            <FormSelect
              value={formData.cabinClass}
              onChange={(v) => updateForm('cabinClass', v)}
              options={[
                { label: 'Economy', value: 'economy' },
                { label: 'Business', value: 'business' },
                { label: 'First', value: 'first' },
              ]}
            />
          </FormField>
        </div>

        <label className="flex items-center gap-3 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => updateForm('isActive', e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm font-medium">Active</span>
        </label>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={requiredFields || saving}
            className="px-4 py-2 text-sm rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : editingId ? 'Update Flight' : 'Create Flight'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteTarget(null); }}
        onConfirm={handleDelete}
        title="Delete Flight"
        message={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.airline} ${deleteTarget.flightNumber} (${deleteTarget.originCode} → ${deleteTarget.destinationCode})? This action cannot be undone.`
            : 'Are you sure you want to delete this flight?'
        }
      />
    </div>
  );
}
