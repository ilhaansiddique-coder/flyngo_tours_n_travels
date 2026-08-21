'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Modal, FormField, FormInput, FormSelect, FormTextarea, ConfirmDialog } from '@/components/admin/ui';
import { ImageUploader } from '@/components/admin/image-uploader';
import { useApi } from '@/hooks/use-api';
import { formatCurrency } from '@/lib/utils';
import { Sparkles, Plus, Pencil, Trash2, Search, Image as ImageIcon } from 'lucide-react';

interface UmrahPackage {
  id: string;
  title: string;
  durationDays: number;
  price: number;
  currency: string;
  makkahNights: number;
  madinahNights: number;
  addOnCity?: string;
  inclusions: string[];
  highlights: string[];
  imageUrl?: string;
  coverImageUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
}

export default function AdminUmrahPage() {
  const { getUmrahPackages, createUmrahPackage, updateUmrahPackage, deleteUmrahPackage } = useApi();
  const [items, setItems] = useState<UmrahPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<UmrahPackage | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<UmrahPackage | null>(null);

  const load = () => {
    setLoading(true);
    getUmrahPackages({ limit: '100' })
      .then((r: any) => setItems(r?.items ?? []))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter((i) => i.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Umrah Packages</h1>
          <p className="text-sm text-muted">{items.length} packages</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> New package
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-md">
        <Search className="w-4 h-4 text-muted" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search packages..." />
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <Card key={p.id} className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 min-w-0">
                  {(() => {
                    const url = p.coverImageUrl || p.imageUrl;
                    return url ? (
                      <a href={url} target="_blank" rel="noreferrer" className="shrink-0">
                        <img
                          src={url}
                          alt={p.title}
                          className="w-14 h-14 rounded-lg object-cover border border-outline-variant"
                        />
                      </a>
                    ) : (
                      <div className="w-14 h-14 shrink-0 flex items-center justify-center rounded-lg border border-outline-variant bg-surface-container-high text-on-surface-variant/40">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    );
                  })()}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                      <Badge variant={p.isActive ? 'success' : 'default'}>{p.durationDays} days</Badge>
                      {p.addOnCity && <Badge variant="cyan">+ {p.addOnCity}</Badge>}
                      {p.isFeatured && <Badge variant="warning">Featured</Badge>}
                    </div>
                    <h3 className="font-semibold truncate">{p.title}</h3>
                    <p className="text-xs text-muted mt-1">
                      {p.makkahNights}N Makkah · {p.madinahNights}N Madinah
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-lg">{formatCurrency(p.price, p.currency)}</div>
                  <div className="text-xs text-muted">per person</div>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => { setEditing(p); setShowForm(true); }}>
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleting(p)}>
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <UmrahForm
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); load(); }}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Delete package?"
        message={`This will remove "${deleting?.title}".`}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { if (deleting) await deleteUmrahPackage(deleting.id); setDeleting(null); load(); }}
      />
    </div>
  );
}

function UmrahForm({ initial, onClose, onSaved }: { initial: UmrahPackage | null; onClose: () => void; onSaved: () => void }) {
  const { createUmrahPackage, updateUmrahPackage, uploadMedia } = useApi();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [durationDays, setDurationDays] = useState(String(initial?.durationDays ?? 14));
  const [price, setPrice] = useState(String(initial?.price ?? 0));
  const [currency, setCurrency] = useState(initial?.currency ?? 'BDT');
  const [makkahNights, setMakkahNights] = useState(String(initial?.makkahNights ?? 0));
  const [madinahNights, setMadinahNights] = useState(String(initial?.madinahNights ?? 0));
  const [addOnCity, setAddOnCity] = useState(initial?.addOnCity ?? '');
  const [highlights, setHighlights] = useState((initial?.highlights ?? []).join('\n'));
  const [inclusions, setInclusions] = useState((initial?.inclusions ?? []).join('\n'));
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl ?? '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [order, setOrder] = useState(String(initial?.order ?? 0));
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      title,
      durationDays: Number(durationDays) || 0,
      price: Number(price) || 0,
      currency,
      makkahNights: Number(makkahNights) || 0,
      madinahNights: Number(madinahNights) || 0,
      addOnCity: addOnCity || undefined,
      highlights: highlights.split('\n').map((s) => s.trim()).filter(Boolean),
      inclusions: inclusions.split('\n').map((s) => s.trim()).filter(Boolean),
      imageUrl: imageUrl || undefined,
      coverImageUrl: coverImageUrl || undefined,
      isActive,
      isFeatured,
      order: Number(order) || 0,
    };
    try {
      if (initial) await updateUmrahPackage(initial.id, body);
      else await createUmrahPackage(body);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={initial ? 'Edit Umrah Package' : 'New Umrah Package'}>
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Title"><FormInput value={title} onChange={setTitle} required /></FormField>
        <div className="grid grid-cols-3 gap-3">
          <FormField label="Duration (days)"><FormInput value={durationDays} onChange={setDurationDays} type="number" /></FormField>
          <FormField label="Price"><FormInput value={price} onChange={setPrice} type="number" /></FormField>
          <FormField label="Currency"><FormSelect value={currency} onChange={setCurrency} options={[{ value: 'BDT', label: 'BDT' }, { value: 'USD', label: 'USD' }]} /></FormField>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <FormField label="Makkah nights"><FormInput value={makkahNights} onChange={setMakkahNights} type="number" /></FormField>
          <FormField label="Madinah nights"><FormInput value={madinahNights} onChange={setMadinahNights} type="number" /></FormField>
          <FormField label="Add-on city"><FormInput value={addOnCity} onChange={setAddOnCity} placeholder="e.g. Istanbul" /></FormField>
        </div>
        <FormField label="Order"><FormInput value={order} onChange={setOrder} type="number" /></FormField>
        <FormField label="Highlights (one per line)"><FormTextarea value={highlights} onChange={setHighlights} rows={4} /></FormField>
        <FormField label="Inclusions (one per line)"><FormTextarea value={inclusions} onChange={setInclusions} rows={4} /></FormField>
        <FormField label="Image URL"><FormInput value={imageUrl} onChange={setImageUrl} /></FormField>
        <FormField label="Cover Image">
          <ImageUploader
            value={coverImageUrl}
            onChange={setCoverImageUrl}
            onUpload={async (file) => {
              const res = await uploadMedia(file, { folder: 'umrah' });
              return { url: (res as any).url };
            }}
            aspectRatio={1.7777}
          />
        </FormField>
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
