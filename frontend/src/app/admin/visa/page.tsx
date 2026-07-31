'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal, FormField, FormInput, FormSelect, FormTextarea, ConfirmDialog } from '@/components/admin/ui';
import { Globe, Plus, Pencil, Trash2, Search } from 'lucide-react';

interface VisaService {
  id: string;
  title: string;
  country?: { id: string; name: string };
  destinationId?: string;
  destination?: { id: string; name: string };
  description?: string;
  price: number;
  processingTime?: string;
  requirements?: string[];
  isActive: boolean;
}

interface Destination {
  id: string;
  name: string;
}

export default function AdminVisaPage() {
  const { getVisaServices, createVisaService, updateVisaService, deleteVisaService, getDestinations } = useApi();

  const [services, setServices] = useState<VisaService[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<VisaService | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteItem, setDeleteItem] = useState<VisaService | null>(null);

  const [form, setForm] = useState({
    title: '',
    destinationId: '',
    description: '',
    processingTime: '',
    price: '',
    requirements: '',
    isActive: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [visaData, destData] = await Promise.all([getVisaServices(), getDestinations()]);
      setServices(Array.isArray(visaData) ? visaData : (visaData as any)?.data || []);
      setDestinations(Array.isArray(destData) ? destData : (destData as any)?.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load visa services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditItem(null);
    setForm({ title: '', destinationId: '', description: '', processingTime: '', price: '', requirements: '', isActive: true });
    setModalOpen(true);
  };

  const openEditModal = (item: VisaService) => {
    setEditItem(item);
    setForm({
      title: item.title || '',
      destinationId: item.destinationId || item.destination?.id || item.country?.id || '',
      description: item.description || '',
      processingTime: item.processingTime || '',
      price: String(item.price || ''),
      requirements: Array.isArray(item.requirements) ? item.requirements.join(', ') : (item.requirements || ''),
      isActive: item.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.destinationId || !form.description.trim() || !form.price) return;
    try {
      setSubmitting(true);
      const body: any = {
        title: form.title.trim(),
        destinationId: form.destinationId,
        description: form.description.trim(),
        processingTime: form.processingTime.trim(),
        price: Number(form.price),
        requirements: form.requirements
          .split(',')
          .map((r) => r.trim())
          .filter(Boolean),
        isActive: form.isActive,
      };

      if (editItem) {
        await updateVisaService(editItem.id, body);
      } else {
        await createVisaService(body);
      }

      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to save visa service');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteVisaService(deleteItem.id);
      setDeleteItem(null);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete visa service');
    }
  };

  const filtered = services.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      (s.country?.name || '').toLowerCase().includes(q) ||
      (s.destination?.name || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search visa services..."
            className="pl-9 w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button size="md" className="gap-2" onClick={openAddModal}>
          <Plus className="w-4 h-4" /> Add Visa Service
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
          {error}
          <button className="ml-2 underline" onClick={loadData}>Retry</button>
        </div>
      )}

      {loading ? (
        <Card hover={false} padding="md">
          <div className="flex items-center justify-center py-12 text-gray-400">
            <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading visa services...
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card hover={false} padding="md">
          <div className="text-center py-12 text-gray-400">
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No visa services found</p>
            <p className="text-sm mt-1">{search ? 'Try a different search term.' : 'Get started by adding a visa service.'}</p>
          </div>
        </Card>
      ) : (
        <Card hover={false} padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 bg-gray-50 dark:bg-gray-800/50">
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium">Country</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">Processing Time</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="p-4 font-medium">{v.title}</td>
                    <td className="p-4 text-gray-500">
                      {v.country?.name || v.destination?.name || '—'}
                    </td>
                    <td className="p-4 font-medium">{formatCurrency(v.price)}</td>
                    <td className="p-4">{v.processingTime || '—'}</td>
                    <td className="p-4">
                      <Badge variant={v.isActive ? 'success' : 'warning'}>
                        {v.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <button
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-600"
                          title="Edit"
                          onClick={() => openEditModal(v)}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 text-gray-500 hover:text-red-600"
                          title="Delete"
                          onClick={() => setDeleteItem(v)}
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
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Visa Service' : 'Add Visa Service'}>
        <FormField label="Title" required>
          <FormInput value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} placeholder="e.g. Indonesia Tourist Visa" />
        </FormField>
        <FormField label="Destination" required>
          <FormSelect
            value={form.destinationId}
            onChange={(v) => setForm((f) => ({ ...f, destinationId: v }))}
            placeholder="Select a destination..."
            options={destinations.map((d) => ({ label: d.name, value: d.id }))}
          />
        </FormField>
        <FormField label="Description" required>
          <FormTextarea
            value={form.description}
            onChange={(v) => setForm((f) => ({ ...f, description: v }))}
            placeholder="Visa service description..."
            rows={3}
          />
        </FormField>
        <FormField label="Processing Time">
          <FormInput value={form.processingTime} onChange={(v) => setForm((f) => ({ ...f, processingTime: v }))} placeholder="e.g. 3-5 days" />
        </FormField>
        <FormField label="Price" required>
          <FormInput value={form.price} onChange={(v) => setForm((f) => ({ ...f, price: v }))} type="number" placeholder="0" />
        </FormField>
        <FormField label="Requirements">
          <FormInput
            value={form.requirements}
            onChange={(v) => setForm((f) => ({ ...f, requirements: v }))}
            placeholder="e.g. Passport, Photo, Bank Statement"
          />
          <p className="text-xs text-gray-400 mt-1">Comma-separated list of requirements</p>
        </FormField>
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium">Active</span>
          </label>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button size="sm" onClick={handleSave} loading={submitting}>
            {editItem ? 'Update' : 'Create'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Delete Visa Service"
        message={`Are you sure you want to delete "${deleteItem?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
