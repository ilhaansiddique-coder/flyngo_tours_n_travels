'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Modal, FormField, FormInput, FormSelect, FormTextarea, ConfirmDialog } from '@/components/admin/ui';
import { useApi } from '@/hooks/use-api';
import { formatCurrency } from '@/lib/utils';
import { Globe, Plus, Pencil, Trash2, Search } from 'lucide-react';

interface VisaCountry {
  id: string;
  name: string;
  slug: string;
  flagUrl?: string;
  imageUrl?: string;
  region?: string;
  visaTypes: string[];
  processingTime?: string;
  fee: number;
  currency: string;
  requirements: string[];
  description?: string;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
}

const REGIONS = [
  { value: 'asia', label: 'Asia' },
  { value: 'europe', label: 'Europe' },
  { value: 'americas', label: 'Americas' },
  { value: 'oceania', label: 'Oceania' },
  { value: 'africa', label: 'Africa' },
  { value: 'middle_east', label: 'Middle East' },
];

export default function AdminVisaCountriesPage() {
  const { getVisaCountries, createVisaCountry, updateVisaCountry, deleteVisaCountry } = useApi();
  const [items, setItems] = useState<VisaCountry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<VisaCountry | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<VisaCountry | null>(null);

  const load = () => {
    setLoading(true);
    getVisaCountries({ limit: '100' })
      .then((r: any) => setItems(r?.items ?? []))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Visa Countries</h1>
          <p className="text-sm text-muted">{items.length} countries</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> New country
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-md">
        <Search className="w-4 h-4 text-muted" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search countries..." />
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex items-start gap-3 mb-3">
                {c.flagUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.flagUrl} alt={c.name} className="w-12 h-8 object-cover rounded border" />
                ) : (
                  <div className="w-12 h-8 rounded bg-on-surface-soft flex items-center justify-center">
                    <Globe className="w-4 h-4 text-muted" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{c.name}</h3>
                    {c.isFeatured && <Badge variant="warning">Featured</Badge>}
                  </div>
                  <p className="text-xs text-muted">{c.processingTime || '—'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-muted">Fee</span>
                <span className="font-bold">{formatCurrency(c.fee, c.currency)}</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {c.visaTypes.map((v) => (
                  <Badge key={v} variant="cyan">{v}</Badge>
                ))}
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => { setEditing(c); setShowForm(true); }}>
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleting(c)}>
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <VisaForm
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); load(); }}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Delete country?"
        message={`This will remove "${deleting?.name}".`}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { if (deleting) await deleteVisaCountry(deleting.id); setDeleting(null); load(); }}
      />
    </div>
  );
}

function VisaForm({ initial, onClose, onSaved }: { initial: VisaCountry | null; onClose: () => void; onSaved: () => void }) {
  const { createVisaCountry, updateVisaCountry } = useApi();
  const [name, setName] = useState(initial?.name ?? '');
  const [region, setRegion] = useState(initial?.region ?? 'asia');
  const [flagUrl, setFlagUrl] = useState(initial?.flagUrl ?? '');
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');
  const [processingTime, setProcessingTime] = useState(initial?.processingTime ?? '');
  const [fee, setFee] = useState(String(initial?.fee ?? 0));
  const [currency, setCurrency] = useState(initial?.currency ?? 'BDT');
  const [visaTypes, setVisaTypes] = useState((initial?.visaTypes ?? ['tourist']).join(', '));
  const [requirements, setRequirements] = useState((initial?.requirements ?? []).join('\n'));
  const [description, setDescription] = useState(initial?.description ?? '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [order, setOrder] = useState(String(initial?.order ?? 0));
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      name,
      region,
      flagUrl: flagUrl || undefined,
      imageUrl: imageUrl || undefined,
      processingTime: processingTime || undefined,
      fee: Number(fee) || 0,
      currency,
      visaTypes: visaTypes.split(',').map((s) => s.trim()).filter(Boolean),
      requirements: requirements.split('\n').map((s) => s.trim()).filter(Boolean),
      description: description || undefined,
      isActive,
      isFeatured,
      order: Number(order) || 0,
    };
    try {
      if (initial) await updateVisaCountry(initial.id, body);
      else await createVisaCountry(body);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={initial ? 'Edit Visa Country' : 'New Visa Country'}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Name"><FormInput value={name} onChange={setName} required /></FormField>
          <FormField label="Region">
            <FormSelect value={region} onChange={setRegion} options={REGIONS} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Flag URL"><FormInput value={flagUrl} onChange={setFlagUrl} placeholder="https://..." /></FormField>
          <FormField label="Image URL"><FormInput value={imageUrl} onChange={setImageUrl} placeholder="https://..." /></FormField>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <FormField label="Processing time"><FormInput value={processingTime} onChange={setProcessingTime} placeholder="e.g. 5-7 working days" /></FormField>
          <FormField label="Fee"><FormInput value={fee} onChange={setFee} type="number" /></FormField>
          <FormField label="Currency"><FormSelect value={currency} onChange={setCurrency} options={[{ value: 'BDT', label: 'BDT' }, { value: 'USD', label: 'USD' }]} /></FormField>
        </div>
        <FormField label="Visa types (comma-separated)"><FormInput value={visaTypes} onChange={setVisaTypes} placeholder="tourist, business, student" /></FormField>
        <FormField label="Requirements (one per line)"><FormTextarea value={requirements} onChange={setRequirements} rows={6} /></FormField>
        <FormField label="Description"><FormTextarea value={description} onChange={setDescription} rows={3} /></FormField>
        <FormField label="Order"><FormInput value={order} onChange={setOrder} type="number" /></FormField>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> Active</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} /> Featured</label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </div>
      </form>
    </Modal>
  );
}
