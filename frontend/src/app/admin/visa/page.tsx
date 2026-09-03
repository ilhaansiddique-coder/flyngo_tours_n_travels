'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal, FormField, FormInput, FormTextarea, ConfirmDialog } from '@/components/admin/ui';
import { CountryAutocomplete } from '@/components/admin/country-autocomplete';
import { MultiCountryAutocomplete } from '@/components/admin/multi-country-autocomplete';
import type { CountryOption } from '@/components/admin/country-autocomplete';
import { countryImage } from '@/lib/country-image';
import { VisaContentEditor, type VisaCountryEditor } from './content-editor';
import { Globe, Plus, Pencil, Trash2, Search, Coins, FileText, Loader2, Share2 } from 'lucide-react';
import { ShareMenu } from '@/components/shared/share-menu';

interface VisaService {
  id: string;
  slug?: string;
  title: string;
  country?: { id: string; name: string; slug?: string };
  destinationId?: string;
  destination?: { id: string; name: string };
  additionalDestinations?: { destination?: { id: string; name: string; flagUrl?: string | null } }[];
  description?: string;
  price: number;
  processingTime?: string;
  requirements?: string[];
  pointsAwarded?: number;
  isActive: boolean;
}

export default function AdminVisaPage() {
  const {
    getVisaServices,
    createVisaService,
    updateVisaService,
    deleteVisaService,
    getVisaCountries,
    createVisaCountry,
    deleteVisaCountry,
  } = useApi();

  const [tab, setTab] = useState<'services' | 'countries'>('services');
  const [services, setServices] = useState<VisaService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [countries, setCountries] = useState<VisaCountryEditor[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [editorCountry, setEditorCountry] = useState<VisaCountryEditor | null>(null);
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [countryForm, setCountryForm] = useState({ name: '', flagUrl: '' });
  const [countrySaving, setCountrySaving] = useState(false);
  const [deleteCountry, setDeleteCountry] = useState<VisaCountryEditor | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<VisaService | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteItem, setDeleteItem] = useState<VisaService | null>(null);

  const [additionalNames, setAdditionalNames] = useState<CountryOption[]>([]);

  const [form, setForm] = useState({
    title: '',
    countryName: '',
    description: '',
    processingTime: '',
    price: '',
    points: '',
    requirements: '',
    isActive: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const visaData = await getVisaServices();
      setServices(Array.isArray(visaData) ? visaData : (visaData as any)?.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load visa services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (tab !== 'countries') return;
    (async () => {
      try {
        setCountriesLoading(true);
        const data = await getVisaCountries();
        setCountries(Array.isArray(data) ? data : (data as any)?.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load visa countries');
      } finally {
        setCountriesLoading(false);
      }
    })();
  }, [tab]);

  const reloadCountries = async () => {
    try {
      const data = await getVisaCountries();
      setCountries(Array.isArray(data) ? data : (data as any)?.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load visa countries');
    }
  };

  const handleCreateCountry = async () => {
    if (!countryForm.name.trim()) return;
    try {
      setCountrySaving(true);
      await createVisaCountry({
        name: countryForm.name.trim(),
        flagUrl: countryForm.flagUrl.trim() || undefined,
        content: {},
      });
      setCountryModalOpen(false);
      setCountryForm({ name: '', flagUrl: '' });
      await reloadCountries();
    } catch (err: any) {
      setError(err.message || 'Failed to create visa country');
    } finally {
      setCountrySaving(false);
    }
  };

  const handleDeleteCountry = async () => {
    if (!deleteCountry) return;
    try {
      await deleteVisaCountry(deleteCountry.id);
      setDeleteCountry(null);
      await reloadCountries();
    } catch (err: any) {
      setError(err.message || 'Failed to delete visa country');
    }
  };

  const openAddModal = () => {
    setEditItem(null);
    setForm({ title: '', countryName: '', description: '', processingTime: '', price: '', points: '', requirements: '', isActive: true });
    setAdditionalNames([]);
    setModalOpen(true);
  };

  const openEditModal = (item: VisaService) => {
    setEditItem(item);
    setForm({
      title: item.title || '',
      countryName: item.destination?.name || item.country?.name || '',
      description: item.description || '',
      processingTime: item.processingTime || '',
      price: String(item.price || ''),
      points: String(item.pointsAwarded ?? ''),
      requirements: Array.isArray(item.requirements) ? item.requirements.join(', ') : (item.requirements || ''),
      isActive: item.isActive,
    });
    setAdditionalNames(
      (item.additionalDestinations || [])
        .map((ad) => ad.destination)
        .filter((d): d is { id: string; name: string; flagUrl?: string | null } => !!d),
    );
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.countryName.trim() || !form.description.trim() || !form.price) return;
    try {
      setSubmitting(true);
      const body: any = {
        title: form.title.trim(),
        countryName: form.countryName.trim(),
        additionalDestinationIds: additionalNames.map((a) => ({ id: a.id || undefined, name: a.name })),
        description: form.description.trim(),
        processingTime: form.processingTime.trim(),
        price: Number(form.price),
        pointsAwarded: Number(form.points) || 0,
        currency: 'BDT',
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
      <div className="flex gap-1 border-b border-outline-variant">
        {([
          { key: 'services', label: 'Visa Services' },
          { key: 'countries', label: 'Country Pages' },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium -mb-px border-b-2 transition-colors ${
              tab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'services' && (
        <>
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <Input
            placeholder="Search visa services..."
            className="pl-9 w-full sm:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button size="md" className="gap-2" onClick={openAddModal}>
          <Plus className="w-4 h-4" /> Add Visa Service
        </Button>
      </div>

      {error && (
        <div className="bg-error-container border border-error/30 text-on-error-container px-4 py-3 rounded-xl text-sm">
          {error}
          <button className="ml-2 underline" onClick={loadData}>Retry</button>
        </div>
      )}

      {loading ? (
        <Card hover={false} padding="md">
          <div className="flex items-center justify-center py-12 text-on-surface-variant">
            <Loader2 className="animate-spin h-6 w-6 mr-3" />
            Loading visa services...
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card hover={false} padding="md">
          <div className="text-center py-12 text-on-surface-variant">
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
                <tr className="text-left text-on-surface-variant bg-surface-container-low">
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium">Country</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">Points</th>
                  <th className="p-4 font-medium">Processing Time</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id} className="border-b border-outline-variant hover:bg-surface-container-high">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={countryImage(v.country?.name || v.destination?.name, 120, 80)}
                          alt=""
                          loading="lazy"
                          className="w-12 h-9 rounded-md object-cover shrink-0 border border-outline-variant"
                        />
                        <span className="font-medium">{v.title}</span>
                      </div>
                    </td>
                    <td className="p-4 text-on-surface-variant">
                      {v.country?.name || v.destination?.name || '—'}
                      {(v.additionalDestinations || []).length > 0 && (
                        <span className="text-on-surface-variant/60">
                          {' '}+{(v.additionalDestinations || []).length} more
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-medium">{formatCurrency(v.price)}</td>
                    <td className="p-4">
                      {v.pointsAwarded ? (
                        <Badge variant="info" className="gap-1">
                          <Coins className="w-3 h-3" /> {v.pointsAwarded.toLocaleString()} pts
                        </Badge>
                      ) : (
                        <span className="text-on-surface-variant">—</span>
                      )}
                    </td>
                    <td className="p-4">{v.processingTime || '—'}</td>
                    <td className="p-4">
                      <Badge variant={v.isActive ? 'success' : 'warning'}>
                        {v.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <ShareMenu
                          path={`/booking?type=visa&id=${v.id}`}
                          title={v.title}
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
                          onClick={() => openEditModal(v)}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 rounded-lg hover:bg-danger-soft text-on-surface-variant hover:text-error"
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
        <FormField label="Country name" required>
          <CountryAutocomplete
            value={form.countryName}
            onChange={(opt) => setForm((f) => ({ ...f, countryName: opt.name }))}
            placeholder="e.g. Indonesia"
          />
          <p className="text-xs text-on-surface-variant mt-1">
            Pick from the list or type a new country — it will be created automatically and show up next time.
          </p>
        </FormField>
        <FormField label="Additional Countries">
          <MultiCountryAutocomplete
            value={additionalNames}
            onChange={setAdditionalNames}
            placeholder="Add other countries covered by this visa…"
          />
          <p className="text-xs text-on-surface-variant mt-1">
            Optional. Add multiple countries this visa service covers.
          </p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Price" required>
            <FormInput value={form.price} onChange={(v) => setForm((f) => ({ ...f, price: v }))} type="number" placeholder="0" />
          </FormField>
          <FormField label="Points awarded" required>
            <FormInput value={form.points} onChange={(v) => setForm((f) => ({ ...f, points: v }))} type="number" placeholder="0" />
            <p className="text-xs text-on-surface-variant mt-1">
              Loyalty points the buyer earns when this visa is processed.
            </p>
          </FormField>
        </div>
        <FormField label="Requirements">
          <FormInput
            value={form.requirements}
            onChange={(v) => setForm((f) => ({ ...f, requirements: v }))}
            placeholder="e.g. Passport, Photo, Bank Statement"
          />
          <p className="text-xs text-on-surface-variant mt-1">Comma-separated list of requirements</p>
        </FormField>
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/50"
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
        </>
      )}

      {tab === 'countries' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <p className="text-sm text-on-surface-variant">
              Manage the content shown on each public visa country detail page (/visa/:slug).
            </p>
            <Button size="md" className="gap-2" onClick={() => setCountryModalOpen(true)}>
              <Plus className="w-4 h-4" /> Add Visa Country
            </Button>
          </div>

          {countriesLoading ? (
            <Card hover={false} padding="md">
              <div className="flex items-center justify-center py-10 text-on-surface-variant">
                <Loader2 className="animate-spin h-6 w-6 mr-3" />
                Loading visa countries...
              </div>
            </Card>
          ) : countries.length === 0 ? (
            <Card hover={false} padding="md">
              <div className="text-center py-10 text-on-surface-variant">
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No visa countries yet</p>
                <p className="text-sm mt-1">Add a country to unlock its detail page and content editor.</p>
              </div>
            </Card>
          ) : (
            <Card hover={false} padding="none">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-on-surface-variant bg-surface-container-low">
                      <th className="p-4 font-medium">Country</th>
                      <th className="p-4 font-medium">Slug</th>
                      <th className="p-4 font-medium">Content</th>
                      <th className="p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {countries.map((cd) => {
                      const ct = cd.content;
                      const hasContent = ct && (ct.pricingTiers?.length || ct.intro || ct.faq?.length);
                      return (
                        <tr key={cd.id} className="border-b border-outline-variant hover:bg-surface-container-high">
                          <td className="p-4 font-medium">{cd.name}</td>
                          <td className="p-4 text-on-surface-variant">/{cd.slug}</td>
                          <td className="p-4">
                            {hasContent ? (
                              <Badge variant="success" className="gap-1">
                                <FileText className="w-3 h-3" /> {ct!.pricingTiers?.length || 0} tiers
                              </Badge>
                            ) : (
                              <Badge variant="warning">No content</Badge>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              <ShareMenu
                                path={`/visa/${cd.slug || cd.id}`}
                                title={`${cd.name} Visa`}
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
                                title="Edit page content"
                                onClick={() => setEditorCountry(cd)}
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                className="p-1.5 rounded-lg hover:bg-danger-soft text-on-surface-variant hover:text-error"
                                title="Delete country"
                                onClick={() => setDeleteCountry(cd)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          <VisaContentEditor
            open={!!editorCountry}
            onClose={() => setEditorCountry(null)}
            country={editorCountry!}
            onSaved={reloadCountries}
          />

          <Modal open={countryModalOpen} onClose={() => setCountryModalOpen(false)} title="Add Visa Country">
            <FormField label="Country name" required>
              <FormInput
                value={countryForm.name}
                onChange={(v) => setCountryForm((f) => ({ ...f, name: v }))}
                placeholder="e.g. United Arab Emirates"
              />
            </FormField>
            <FormField label="Flag image URL">
              <FormInput
                value={countryForm.flagUrl}
                onChange={(v) => setCountryForm((f) => ({ ...f, flagUrl: v }))}
                placeholder="https://..."
              />
              <p className="text-xs text-on-surface-variant mt-1">
                Optional. If left empty the flag falls back to a generated image.
              </p>
            </FormField>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setCountryModalOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleCreateCountry} loading={countrySaving}>Create</Button>
            </div>
          </Modal>

          <ConfirmDialog
            open={!!deleteCountry}
            onClose={() => setDeleteCountry(null)}
            onConfirm={handleDeleteCountry}
            title="Delete Visa Country"
            message={`Are you sure you want to delete "${deleteCountry?.name}"? This will remove its country detail page. This action cannot be undone.`}
          />
        </div>
      )}
    </div>
  );
}
