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
import { umrahImage } from '@/lib/entity-image';
import { Sparkles, Plus, Pencil, Trash2, Search, Share2 } from 'lucide-react';
import { ShareMenu } from '@/components/shared/share-menu';
import { AutoTranslatePanel } from '@/components/admin/auto-translate-panel';
import { useAutoTranslateSync } from '@/hooks/use-auto-translate-sync';

interface UmrahPackage {
  id: string;
  slug?: string;
  title: string;
  titleBn?: string;
  durationDays: number;
  price: number;
  currency: string;
  makkahNights: number;
  madinahNights: number;
  addOnCity?: string;
  inclusions: string[];
  inclusionsBn?: string[];
  highlights: string[];
  highlightsBn?: string[];
  requirements?: string[];
  requirementsBn?: string[];
  imageUrl?: string;
  coverImageUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  pointsAwarded?: number;
  totalSeats?: number;
  seatsBooked?: number;
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
    getUmrahPackages({ limit: '100', all: 'true' })
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
                    const url = umrahImage(p);
                    return (
                      <a href={url} target="_blank" rel="noreferrer" className="shrink-0">
                        <img
                          src={url}
                          alt={p.title}
                          className="w-14 h-14 rounded-lg object-cover border border-outline-variant"
                        />
                      </a>
                    );
                  })()}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                      <Badge variant="default">{p.durationDays} days</Badge>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={p.isActive}
                          onChange={async (e) => {
                            const newActive = e.target.checked;
                            setItems((prev) =>
                              prev.map((item) => (item.id === p.id ? { ...item, isActive: newActive } : item))
                            );
                            try {
                              await updateUmrahPackage(p.id, { isActive: newActive });
                            } catch (err: any) {
                              setItems((prev) =>
                                prev.map((item) => (item.id === p.id ? { ...item, isActive: !newActive } : item))
                              );
                              alert(err.message || 'Failed to update package status');
                            }
                          }}
                          className="w-3.5 h-3.5 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                        />
                        <Badge variant={p.isActive ? 'success' : 'warning'}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </label>
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
                <ShareMenu
                  path={p.slug ? `/umrah/${p.slug}` : `/umrah/${p.id}`}
                  title={p.title}
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
  const [titleBn, setTitleBn] = useState(initial?.titleBn ?? '');
  const [durationDays, setDurationDays] = useState(String(initial?.durationDays ?? 14));
  const [price, setPrice] = useState(String(initial?.price ?? 0));
  const [currency, setCurrency] = useState(initial?.currency ?? 'BDT');
  const [makkahNights, setMakkahNights] = useState(String(initial?.makkahNights ?? 0));
  const [madinahNights, setMadinahNights] = useState(String(initial?.madinahNights ?? 0));
  const [addOnCity, setAddOnCity] = useState(initial?.addOnCity ?? '');
  const [highlights, setHighlights] = useState((initial?.highlights ?? []).join('\n'));
  const [highlightsBn, setHighlightsBn] = useState((initial?.highlightsBn ?? []).join('\n'));
  const [inclusions, setInclusions] = useState((initial?.inclusions ?? []).join('\n'));
  const [inclusionsBn, setInclusionsBn] = useState((initial?.inclusionsBn ?? []).join('\n'));
  const [requirements, setRequirements] = useState((initial?.requirements ?? []).join('\n'));
  const [requirementsBn, setRequirementsBn] = useState((initial?.requirementsBn ?? []).join('\n'));
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl ?? '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [order, setOrder] = useState(String(initial?.order ?? 0));
  const [pointsAwarded, setPointsAwarded] = useState(String(initial?.pointsAwarded ?? 0));
  const [totalSeats, setTotalSeats] = useState(String(initial?.totalSeats ?? 0));
  const [saving, setSaving] = useState(false);
  const [formLang, setFormLang] = useState<'en' | 'bn'>('en');
  const { isTranslating, translatingMessage, debouncedAutoTranslate, handleFieldBlur, ensureBilingualOnSubmit } = useAutoTranslateSync();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const splitReqs = (str: string) =>
        (typeof str === 'string' ? str : '')
          .split(/(?:\r?\n)+|[•🔹▪▫‣⁃◆*]+|(?:\s*;\s*)|(?:\s*,\s*)/u)
          .map((r) => r.replace(/^[-\s\u2022\u25aa\u25b6\u25c6\u2705\u2714\u2713]+/, '').trim())
          .filter(Boolean);

      // Bi-directional translation sync: English <-> Bangla
      const { english: syncedEn, bangla: syncedBn } = await ensureBilingualOnSubmit(
        { title, highlights, inclusions, requirements },
        { title: titleBn, highlights: highlightsBn, inclusions: inclusionsBn, requirements: requirementsBn }
      );

      const body = {
        title: syncedEn.title || syncedBn.title,
        titleBn: syncedBn.title || undefined,
        durationDays: Number(durationDays) || 0,
        price: Number(price) || 0,
        currency,
        makkahNights: Number(makkahNights) || 0,
        madinahNights: Number(madinahNights) || 0,
        addOnCity: addOnCity || undefined,
        highlights: syncedEn.highlights ? syncedEn.highlights.split('\n').map((s) => s.trim()).filter(Boolean) : [],
        highlightsBn: syncedBn.highlights ? syncedBn.highlights.split('\n').map((s) => s.trim()).filter(Boolean) : undefined,
        inclusions: syncedEn.inclusions ? syncedEn.inclusions.split('\n').map((s) => s.trim()).filter(Boolean) : [],
        inclusionsBn: syncedBn.inclusions ? syncedBn.inclusions.split('\n').map((s) => s.trim()).filter(Boolean) : undefined,
        requirements: splitReqs(syncedEn.requirements),
        requirementsBn: splitReqs(syncedBn.requirements),
        imageUrl: imageUrl || undefined,
        coverImageUrl: coverImageUrl || undefined,
        isActive,
        isFeatured,
        order: Number(order) || 0,
        pointsAwarded: Number(pointsAwarded) || 0,
        totalSeats: Number(totalSeats) || 0,
      };

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
        <AutoTranslatePanel
          sourceFields={{
            title: title || titleBn,
            highlights: highlights || highlightsBn,
            inclusions: inclusions || inclusionsBn,
            requirements: requirements || requirementsBn,
          }}
          fieldLabels={{
            title: 'Package Title',
            highlights: 'Highlights',
            inclusions: 'Inclusions',
            requirements: 'Requirements / Documents',
          }}
          category="hajj_umrah"
          onApplyBangla={(translated) => {
            if (translated.title) setTitleBn(translated.title);
            if (translated.highlights) setHighlightsBn(translated.highlights);
            if (translated.inclusions) setInclusionsBn(translated.inclusions);
            if (translated.requirements) setRequirementsBn(translated.requirements);
            setFormLang('bn');
          }}
        />

        {/* Bilingual Tab Switcher */}
        <div className="flex flex-wrap items-center justify-between border-b border-outline-variant pb-2.5 mb-2 gap-2">
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
              {titleBn ? <span className="w-2 h-2 rounded-full bg-emerald-500" title="Bangla translation ready" /> : null}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isTranslating ? (
              <span className="text-[11px] text-accent font-medium animate-pulse flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 animate-spin" /> {translatingMessage || 'Auto-translating...'}
              </span>
            ) : title && titleBn ? (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                ✓ English & বাংলা synchronized
              </span>
            ) : null}
            <span className="text-[11px] text-muted">
              {formLang === 'en' ? 'English content (auto-syncs to বাংলা)' : 'বাংলা সংস্করণ (auto-syncs to English)'}
            </span>
          </div>
        </div>

        {formLang === 'en' ? (
          <>
            <FormField label="Title (English)">
              <FormInput
                value={title}
                onChange={(v) => {
                  setTitle(v);
                  debouncedAutoTranslate('title', v, titleBn, 'en', 'bn', setTitleBn);
                }}
                onBlur={() => handleFieldBlur(title, titleBn, 'en', 'bn', setTitleBn)}
                required
              />
            </FormField>
            <FormField label="Highlights (English - one per line)">
              <FormTextarea
                value={highlights}
                onChange={(v) => {
                  setHighlights(v);
                  debouncedAutoTranslate('highlights', v, highlightsBn, 'en', 'bn', setHighlightsBn);
                }}
                onBlur={() => handleFieldBlur(highlights, highlightsBn, 'en', 'bn', setHighlightsBn)}
                rows={3}
              />
            </FormField>
            <FormField label="Inclusions (English - one per line)">
              <FormTextarea
                value={inclusions}
                onChange={(v) => {
                  setInclusions(v);
                  debouncedAutoTranslate('inclusions', v, inclusionsBn, 'en', 'bn', setInclusionsBn);
                }}
                onBlur={() => handleFieldBlur(inclusions, inclusionsBn, 'en', 'bn', setInclusionsBn)}
                rows={3}
              />
            </FormField>
            <FormField label="Requirements / Documents (English - one per line)">
              <FormTextarea
                value={requirements}
                onChange={(v) => {
                  setRequirements(v);
                  debouncedAutoTranslate('requirements', v, requirementsBn, 'en', 'bn', setRequirementsBn);
                }}
                onBlur={() => handleFieldBlur(requirements, requirementsBn, 'en', 'bn', setRequirementsBn)}
                placeholder={"1. Valid passport (minimum 6 months validity)\n2. Umrah biometric visa approval\n3. Proof of vaccination (if required)"}
                rows={3}
              />
            </FormField>
          </>
        ) : (
          <>
            <FormField label="Title (বাংলা - BN)">
              <FormInput
                value={titleBn}
                onChange={(v) => {
                  setTitleBn(v);
                  debouncedAutoTranslate('title', v, title, 'bn', 'en', setTitle);
                }}
                onBlur={() => handleFieldBlur(titleBn, title, 'bn', 'en', setTitle)}
                placeholder="প্যাকেজের শিরোনাম বাংলায়"
              />
            </FormField>
            <FormField label="Highlights (বাংলা - BN, প্রতি লাইনে একটি)">
              <FormTextarea
                value={highlightsBn}
                onChange={(v) => {
                  setHighlightsBn(v);
                  debouncedAutoTranslate('highlights', v, highlights, 'bn', 'en', setHighlights);
                }}
                onBlur={() => handleFieldBlur(highlightsBn, highlights, 'bn', 'en', setHighlights)}
                rows={3}
                placeholder="প্যাকেজ হাইলাইটস বাংলায়"
              />
            </FormField>
            <FormField label="Inclusions (বাংলা - BN, প্রতি লাইনে একটি)">
              <FormTextarea
                value={inclusionsBn}
                onChange={(v) => {
                  setInclusionsBn(v);
                  debouncedAutoTranslate('inclusions', v, inclusions, 'bn', 'en', setInclusions);
                }}
                onBlur={() => handleFieldBlur(inclusionsBn, inclusions, 'bn', 'en', setInclusions)}
                rows={3}
                placeholder="যা যা অন্তর্ভুক্ত রয়েছে"
              />
            </FormField>
            <FormField label="Requirements / Documents (বাংলা - প্রতি লাইনে একটি)">
              <FormTextarea
                value={requirementsBn}
                onChange={(v) => {
                  setRequirementsBn(v);
                  debouncedAutoTranslate('requirements', v, requirements, 'bn', 'en', setRequirements);
                }}
                onBlur={() => handleFieldBlur(requirementsBn, requirements, 'bn', 'en', setRequirements)}
                rows={3}
                placeholder="উমরার প্রয়োজনীয় কাগজপত্র বা শর্তাবলী"
              />
            </FormField>
          </>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormField label="Duration (days)"><FormInput value={durationDays} onChange={setDurationDays} type="number" /></FormField>
          <FormField label="Price"><FormInput value={price} onChange={setPrice} type="number" /></FormField>
          <FormField label="Currency"><FormSelect value="BDT" onChange={setCurrency} options={[{ value: 'BDT', label: 'BDT (৳)' }]} /></FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormField label="Makkah nights"><FormInput value={makkahNights} onChange={setMakkahNights} type="number" /></FormField>
          <FormField label="Madinah nights"><FormInput value={madinahNights} onChange={setMadinahNights} type="number" /></FormField>
          <FormField label="Add-on city"><FormInput value={addOnCity} onChange={setAddOnCity} placeholder="e.g. Istanbul" /></FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Order"><FormInput value={order} onChange={setOrder} type="number" /></FormField>
          <FormField label="Loyalty points"><FormInput value={pointsAwarded} onChange={setPointsAwarded} type="number" /></FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Total seats">
            <FormInput value={totalSeats} onChange={setTotalSeats} type="number" />
            <p className="text-xs text-muted mt-1">0 = unlimited</p>
          </FormField>
          {initial && (
            <FormField label="Seats booked">
              <FormInput value={String(initial.seatsBooked ?? 0)} onChange={() => {}} type="number" disabled />
            </FormField>
          )}
        </div>
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
