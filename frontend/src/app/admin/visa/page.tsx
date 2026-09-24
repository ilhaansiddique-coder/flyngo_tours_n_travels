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
import { Plus, Pencil, Trash2, Search, Coins, Loader2, Share2 } from 'lucide-react';
import { ShareMenu } from '@/components/shared/share-menu';
import { AutoTranslatePanel } from '@/components/admin/auto-translate-panel';
import { hasBanglaChars } from '@/lib/translations/translator';
import { toast } from 'sonner';

interface VisaService {
  id: string;
  slug?: string;
  title: string;
  titleBn?: string;
  country?: { id: string; name: string; slug?: string };
  destinationId?: string;
  destination?: { id: string; name: string };
  additionalDestinations?: { destination?: { id: string; name: string; flagUrl?: string | null } }[];
  description?: string;
  descriptionBn?: string;
  price: number;
  processingTime?: string;
  processingTimeBn?: string;
  requirements?: string[];
  requirementsBn?: string[];
  pointsAwarded?: number;
  isActive: boolean;
}

export default function AdminVisaPage() {
  const {
    getVisaServices,
    createVisaService,
    updateVisaService,
    deleteVisaService,
  } = useApi();

  const [services, setServices] = useState<VisaService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<VisaService | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteItem, setDeleteItem] = useState<VisaService | null>(null);

  const [additionalNames, setAdditionalNames] = useState<CountryOption[]>([]);

  const [formLang, setFormLang] = useState<'en' | 'bn'>('en');
  const [form, setForm] = useState({
    title: '',
    titleBn: '',
    countryName: '',
    description: '',
    descriptionBn: '',
    processingTime: '',
    processingTimeBn: '',
    price: '',
    points: '',
    requirements: '',
    requirementsBn: '',
    isActive: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const visaData = await getVisaServices({ all: 'true' });
      const raw = Array.isArray(visaData) ? visaData : (visaData as any)?.items || (visaData as any)?.data || [];
      setServices(raw);
    } catch (err: any) {
      const msg = err.message || 'Failed to load visa services';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    setEditItem(null);
    setFormLang('en');
    setForm({
      title: '',
      titleBn: '',
      countryName: '',
      description: '',
      descriptionBn: '',
      processingTime: '',
      processingTimeBn: '',
      price: '',
      points: '',
      requirements: '',
      requirementsBn: '',
      isActive: true,
    });
    setAdditionalNames([]);
    setModalOpen(true);
  };

  const openEditModal = (item: VisaService) => {
    setEditItem(item);
    setFormLang('en');
    const isTitleBangla = hasBanglaChars(item.title);
    setForm({
      title: isTitleBangla && !item.titleBn ? '' : item.title || '',
      titleBn: item.titleBn || (isTitleBangla ? item.title : ''),
      countryName: item.destination?.name || item.country?.name || '',
      description: item.description || '',
      descriptionBn: item.descriptionBn || '',
      processingTime: item.processingTime || '',
      processingTimeBn: item.processingTimeBn || '',
      price: String(item.price || ''),
      points: String(item.pointsAwarded ?? ''),
      requirements: Array.isArray(item.requirements) ? item.requirements.join('\n') : (item.requirements || ''),
      requirementsBn: Array.isArray(item.requirementsBn) ? item.requirementsBn.join('\n') : (item.requirementsBn || ''),
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
    const finalTitle = form.title.trim() || form.titleBn.trim();
    if (!finalTitle || !form.countryName.trim() || !form.price) return;
    try {
      setSubmitting(true);
      const splitReqs = (str: string) =>
        (typeof str === 'string' ? str : '')
          .split(/(?:\r?\n)+|[•🔹▪▫‣⁃◆*]+|(?:\s*;\s*)|(?:\s*,\s*)/u)
          .map((r) => r.replace(/^[-\s\u2022\u25aa\u25b6\u25c6\u2705\u2714\u2713]+/, '').trim())
          .filter(Boolean);

      const body: any = {
        title: form.title.trim() || form.titleBn.trim(),
        titleBn: form.titleBn.trim() || undefined,
        countryName: form.countryName.trim(),
        additionalDestinationIds: additionalNames.map((a) => ({ id: a.id || undefined, name: a.name })),
        description: form.description.trim() || form.descriptionBn.trim() || '',
        descriptionBn: form.descriptionBn.trim() || undefined,
        processingTime: form.processingTime.trim() || form.processingTimeBn.trim() || undefined,
        processingTimeBn: form.processingTimeBn.trim() || undefined,
        price: Number(form.price),
        pointsAwarded: Number(form.points) || 0,
        currency: 'BDT',
        requirements: splitReqs(form.requirements),
        requirementsBn: splitReqs(form.requirementsBn),
        isActive: form.isActive,
      };

      if (editItem) {
        await updateVisaService(editItem.id, body);
        toast.success('Visa service updated');
      } else {
        await createVisaService(body);
        toast.success('Visa service created');
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
      toast.success('Visa service deleted');
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
      {error && (
        <div className="bg-error-container border border-error/30 text-on-error-container px-4 py-3 rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            className="ml-2 underline font-medium hover:opacity-80"
            onClick={loadData}
          >
            Retry
          </button>
        </div>
      )}

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
            <p className="text-lg font-medium">No visa services found</p>
            <p className="text-sm mt-1">Get started by adding your first visa service.</p>
          </div>
        </Card>
      ) : (
        <Card hover={false} padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-on-surface-variant bg-surface-container-low">
                  <th className="p-4 font-medium">Country</th>
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">Processing Time</th>
                  <th className="p-4 font-medium">Requirements</th>
                  <th className="p-4 font-medium">Points</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => {
                  const countryName = v.destination?.name || v.country?.name || 'Unknown';
                  const img = countryImage(countryName, 120, 80);
                  const additionals = (v.additionalDestinations || [])
                    .map((a) => a.destination?.name)
                    .filter((n): n is string => Boolean(n));

                  return (
                    <tr key={v.id} className="border-b border-outline-variant hover:bg-surface-container-high">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={img}
                            alt={countryName}
                            className="w-10 h-7 object-cover rounded border border-outline-variant flex-shrink-0"
                          />
                          <div>
                            <span className="font-medium">{countryName}</span>
                            {additionals.length > 0 && (
                              <p className="text-xs text-on-surface-variant line-clamp-1">
                                + {additionals.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium">{v.title}</td>
                      <td className="p-4 font-medium">{formatCurrency(v.price)}</td>
                      <td className="p-4 text-on-surface-variant">{v.processingTime || '—'}</td>
                      <td className="p-4 text-on-surface-variant max-w-xs truncate">
                        {v.requirements && v.requirements.length > 0
                          ? `${v.requirements.length} requirement(s)`
                          : 'None'}
                      </td>
                      <td className="p-4">
                        {v.pointsAwarded && v.pointsAwarded > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            <Coins className="w-3 h-3" /> +{v.pointsAwarded} pts
                          </span>
                        ) : (
                          <span className="text-on-surface-variant text-xs">0</span>
                        )}
                      </td>
                      <td className="p-4">
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={v.isActive}
                            onChange={async (e) => {
                              const newActive = e.target.checked;
                              setServices((prev) =>
                                prev.map((item) => (item.id === v.id ? { ...item, isActive: newActive } : item))
                              );
                              try {
                                await updateVisaService(v.id, { isActive: newActive });
                              } catch (err: any) {
                                setServices((prev) =>
                                  prev.map((item) => (item.id === v.id ? { ...item, isActive: !newActive } : item))
                                );
                                alert(err.message || 'Failed to update visa status');
                              }
                            }}
                            className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                          />
                          <Badge variant={v.isActive ? 'success' : 'default'}>
                            {v.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </label>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Visa Service' : 'Add Visa Service'}>
        <AutoTranslatePanel
          sourceFields={{
            title: form.title || form.titleBn,
            description: form.description || form.descriptionBn,
            processingTime: form.processingTime || form.processingTimeBn,
            requirements: form.requirements || form.requirementsBn,
          }}
          fieldLabels={{
            title: 'Visa Title',
            description: 'Description',
            processingTime: 'Processing Time',
            requirements: 'Requirements / Documents',
          }}
          category="visa"
          onApplyBangla={(translated) => {
            setForm((f) => ({
              ...f,
              titleBn: translated.title || f.titleBn,
              descriptionBn: translated.description || f.descriptionBn,
              processingTimeBn: translated.processingTime || f.processingTimeBn,
              requirementsBn: translated.requirements || f.requirementsBn,
            }));
            setFormLang('bn');
            toast.success('Bangla translation applied to বাংলা tab! English version preserved.');
          }}
        />

        {/* Bilingual Tab Switcher */}
        <div className="flex items-center justify-between border-b border-outline-variant pb-2.5 mb-4">
          <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setFormLang('en')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                formLang === 'en'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              English (EN)
            </button>
            <button
              type="button"
              onClick={() => setFormLang('bn')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                formLang === 'bn'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>বাংলা (BN)</span>
              {form.titleBn ? <span className="w-2 h-2 rounded-full bg-emerald-500" title="Bangla translation present" /> : null}
            </button>
          </div>
          <span className="text-[11px] text-muted">
            {formLang === 'en' ? 'English content for EN visitors' : 'বাংলা সংস্করণ (BN সাইটে প্রদর্শিত হবে)'}
          </span>
        </div>

        {formLang === 'en' ? (
          <>
            <FormField label="Title (English)" required>
              <FormInput
                value={form.title}
                onChange={(v) => setForm((f) => ({ ...f, title: v }))}
                placeholder="e.g. Malaysia Tourist Visa — Your Dream Malaysia Trip Is Now Easier!"
              />
            </FormField>
            <FormField label="Description (English)" required>
              <FormTextarea
                value={form.description}
                onChange={(v) => setForm((f) => ({ ...f, description: v }))}
                placeholder="Visa service description in English..."
                rows={3}
              />
            </FormField>
            <FormField label="Processing Time (English)">
              <FormInput
                value={form.processingTime}
                onChange={(v) => setForm((f) => ({ ...f, processingTime: v }))}
                placeholder="e.g. 5-10 Days"
              />
            </FormField>
            <FormField label="Requirements / Required Documents (English)">
              <FormTextarea
                value={form.requirements}
                onChange={(v) => setForm((f) => ({ ...f, requirements: v }))}
                placeholder="e.g. Valid passport (6+ months), 2 Passport Photos, Bank statement (6 months), Trade License, NOC..."
                rows={3}
              />
              <p className="text-xs text-on-surface-variant mt-1">
                Separate items with commas, newlines, or bullets.
              </p>
            </FormField>
          </>
        ) : (
          <>
            <FormField label="Title (বাংলা)" required>
              <FormInput
                value={form.titleBn}
                onChange={(v) => setForm((f) => ({ ...f, titleBn: v }))}
                placeholder="যেমন: মালয়েশিয়া ট্যুরিস্ট ভিসা — আপনার স্বপ্নের মালয়েশিয়া ভ্রমণ এখন আরও সহজ!"
              />
            </FormField>
            <FormField label="Description (বাংলা)">
              <FormTextarea
                value={form.descriptionBn}
                onChange={(v) => setForm((f) => ({ ...f, descriptionBn: v }))}
                placeholder="বাংলায় ভিসার বিবরণ লিখুন..."
                rows={3}
              />
            </FormField>
            <FormField label="Processing Time (বাংলা)">
              <FormInput
                value={form.processingTimeBn}
                onChange={(v) => setForm((f) => ({ ...f, processingTimeBn: v }))}
                placeholder="যেমন: ৫-১০ দিন"
              />
            </FormField>
            <FormField label="Requirements / Required Documents (বাংলা)">
              <FormTextarea
                value={form.requirementsBn}
                onChange={(v) => setForm((f) => ({ ...f, requirementsBn: v }))}
                placeholder="যেমন: মূল পাসপোর্ট (৬ মাসের মেয়াদ), ২ কপি ছবি, ব্যাংক স্টেটমেন্ট (৬ মাসের)..."
                rows={3}
              />
              <p className="text-xs text-on-surface-variant mt-1">
                প্রতিটি আবশ্যিক নথি কমা, নতুন লাইন বা বুলেট দিয়ে আলাদা করুন।
              </p>
            </FormField>
          </>
        )}

        <FormField label="Country name" required>
          <CountryAutocomplete
            value={form.countryName}
            onQueryChange={(q) => setForm((f) => ({ ...f, countryName: q }))}
            onChange={(opt) => setForm((f) => ({ ...f, countryName: opt.country || opt.name }))}
            placeholder="e.g. Malaysia"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Price (BDT)" required>
            <FormInput value={form.price} onChange={(v) => setForm((f) => ({ ...f, price: v }))} type="number" placeholder="0" />
          </FormField>
          <FormField label="Points awarded" required>
            <FormInput value={form.points} onChange={(v) => setForm((f) => ({ ...f, points: v }))} type="number" placeholder="0" />
            <p className="text-xs text-on-surface-variant mt-1">
              Loyalty points the buyer earns when this visa is processed.
            </p>
          </FormField>
        </div>
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
    </div>
  );
}
