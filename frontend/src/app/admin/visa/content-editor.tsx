'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Modal, FormField, FormInput, FormTextarea } from '@/components/admin/ui';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export interface FeeTier {
  id: string;
  title: string;
  subtitle?: string;
  stay?: string;
  entry?: string;
  validity?: string;
  male?: number;
  female?: number;
  child?: number;
  flatFee?: number;
  processingTime?: string;
  documents?: string[];
  notes?: string[];
}

export interface VisaContent {
  intro?: string;
  pricingTiers?: FeeTier[];
  processSteps?: string[];
  terms?: string[];
  facts?: Array<{ label: string; value: string }>;
  faq?: Array<{ question: string; answer: string }>;
  keyDestinations?: string[];
}

export interface VisaCountryEditor {
  id: string;
  name: string;
  slug: string;
  content?: VisaContent | null;
}

const inputCls = 'w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container text-on-surface placeholder:text-on-surface-variant/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-colors';

function StringListEditor({ items, onChange, label, placeholder }: {
  items: string[];
  onChange: (next: string[]) => void;
  label: string;
  placeholder?: string;
}) {
  const set = (i: number, v: string) => onChange(items.map((it, idx) => (idx === i ? v : it)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, '']);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium">{label}</span>
        <button type="button" onClick={add} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-start gap-2">
            <GripVertical className="w-4 h-4 mt-2.5 shrink-0 text-on-surface-variant/50" />
            <input value={it} onChange={(e) => set(i, e.target.value)} placeholder={placeholder} className={inputCls} />
            <button type="button" onClick={() => remove(i)} className="p-2 hover:bg-danger-soft rounded-lg text-on-surface-variant hover:text-error">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-on-surface-variant">Nothing yet.</p>}
      </div>
    </div>
  );
}

function PairListEditor({ items, onChange, label, valueLabel, valuePlaceholder }: {
  items: Array<{ label: string; value: string }>;
  onChange: (next: Array<{ label: string; value: string }>) => void;
  label: string;
  valueLabel: string;
  valuePlaceholder?: string;
}) {
  const set = (i: number, k: 'label' | 'value', v: string) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { label: '', value: '' }]);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium">{label}</span>
        <button type="button" onClick={add} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-start gap-2">
            <GripVertical className="w-4 h-4 mt-2.5 shrink-0 text-on-surface-variant/50" />
            <input value={it.label} onChange={(e) => set(i, 'label', e.target.value)} placeholder={valueLabel} className={inputCls} />
            <input value={it.value} onChange={(e) => set(i, 'value', e.target.value)} placeholder={valuePlaceholder ?? valueLabel} className={inputCls} />
            <button type="button" onClick={() => remove(i)} className="p-2 hover:bg-danger-soft rounded-lg text-on-surface-variant hover:text-error">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-on-surface-variant">Nothing yet.</p>}
      </div>
    </div>
  );
}

interface EditorModalProps {
  open: boolean;
  onClose: () => void;
  country: VisaCountryEditor;
  onSaved?: () => void;
}

export function VisaContentEditor({ open, onClose, country, onSaved }: EditorModalProps) {
  const { updateVisaCountry } = useApi();
  const c = country.content ?? {};
  const [intro, setIntro] = useState<string>(c.intro ?? '');
  const [processSteps, setProcessSteps] = useState<string[]>(c.processSteps ?? []);
  const [terms, setTerms] = useState<string[]>(c.terms ?? []);
  const [facts, setFacts] = useState<Array<{ label: string; value: string }>>(c.facts ?? []);
  const [faq, setFaq] = useState<Array<{ label: string; value: string }>>(
    (c.faq ?? []).map((f) => ({ label: f.question, value: f.answer })),
  );
  const [keyDestinations, setKeyDestinations] = useState<string[]>(c.keyDestinations ?? []);
  const [tiers, setTiers] = useState<FeeTier[]>(c.pricingTiers ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setTier = (i: number, patch: Partial<FeeTier>) =>
    setTiers((t) => t.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const setTierDoc = (i: number, v: string[]) => setTier(i, { documents: v });
  const setTierNote = (i: number, v: string[]) => setTier(i, { notes: v });

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const content: VisaContent = {
        intro: intro || undefined,
        processSteps,
        terms,
        facts,
        keyDestinations,
        faq: faq
          .filter((f) => f.label.trim() && f.value.trim())
          .map((f) => ({ question: f.label, answer: f.value })),
        pricingTiers: tiers
          .filter((t) => t.title.trim())
          .map((t) => ({
            ...t,
            documents: (t.documents ?? []).filter((d) => d.trim()),
            notes: (t.notes ?? []).filter((n) => n.trim()),
          })),
      };
      await updateVisaCountry(country.id, { content });
      onClose();
      onSaved?.();
    } catch (err: any) {
      setError(err.message || 'Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Page content — ${country.name}`}>
      <div className="space-y-6">
        {error && (
          <div className="bg-error-container border border-error/30 text-on-error-container px-4 py-3 rounded-xl text-sm">{error}</div>
        )}

        <FormField label="Intro paragraph">
          <FormTextarea value={intro} onChange={setIntro} placeholder="Long-form intro shown under the hero banner" rows={3} />
        </FormField>

        <div className="rounded-xl border border-outline-variant p-4 space-y-3">
          <h3 className="text-sm font-semibold">Pricing tiers</h3>
          {tiers.map((tier, i) => (
            <div key={tier.id} className="rounded-lg border border-outline-variant p-3 space-y-3 bg-surface-container-low">
              <div className="flex items-center justify-between gap-2">
                <GripVertical className="w-4 h-4 text-on-surface-variant/50" />
                <input
                  value={tier.title}
                  onChange={(e) => setTier(i, { title: e.target.value })}
                  placeholder="Tier title (e.g. Dubai Tourist Visa 30 days)"
                  className={inputCls + ' font-medium'}
                />
                <button type="button" onClick={() => setTiers((t) => t.filter((_, idx) => idx !== i))} className="p-2 hover:bg-danger-soft rounded-lg text-on-surface-variant hover:text-error">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input value={tier.subtitle ?? ''} onChange={(e) => setTier(i, { subtitle: e.target.value })} placeholder="Subtitle" className={inputCls} />
                <input value={tier.stay ?? ''} onChange={(e) => setTier(i, { stay: e.target.value })} placeholder="Stay (e.g. 30 days)" className={inputCls} />
                <input value={tier.entry ?? ''} onChange={(e) => setTier(i, { entry: e.target.value })} placeholder="Entry (e.g. Single Entry)" className={inputCls} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input value={tier.validity ?? ''} onChange={(e) => setTier(i, { validity: e.target.value })} placeholder="Validity" className={inputCls} />
                <input value={tier.processingTime ?? ''} onChange={(e) => setTier(i, { processingTime: e.target.value })} placeholder="Processing time" className={inputCls} />
                <input value={tier.flatFee != null ? String(tier.flatFee) : ''} onChange={(e) => setTier(i, { flatFee: e.target.value === '' ? undefined : Number(e.target.value) })} placeholder="Flat fee (all applicants)" type="number" className={inputCls} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input value={tier.male != null ? String(tier.male) : ''} onChange={(e) => setTier(i, { male: e.target.value === '' ? undefined : Number(e.target.value) })} placeholder="Male fee" type="number" className={inputCls} />
                <input value={tier.female != null ? String(tier.female) : ''} onChange={(e) => setTier(i, { female: e.target.value === '' ? undefined : Number(e.target.value) })} placeholder="Female fee" type="number" className={inputCls} />
                <input value={tier.child != null ? String(tier.child) : ''} onChange={(e) => setTier(i, { child: e.target.value === '' ? undefined : Number(e.target.value) })} placeholder="Child (<12) fee" type="number" className={inputCls} />
              </div>
              <StringListEditor items={tier.documents ?? []} onChange={(v) => setTierDoc(i, v)} label="Required documents" placeholder="Document requirement" />
              <StringListEditor items={tier.notes ?? []} onChange={(v) => setTierNote(i, v)} label="Notes" placeholder="Note (e.g. fee includes insurance)" />
            </div>
          ))}
          <Button type="button" size="sm" variant="outline" className="gap-2 w-full" onClick={() => setTiers((t) => [...t, { id: `tier-${Date.now()}`, title: '', documents: [], notes: [] }])}>
            <Plus className="w-4 h-4" /> Add pricing tier
          </Button>
        </div>

        <StringListEditor items={processSteps} onChange={setProcessSteps} label="How it works steps" placeholder="Step description" />
        <StringListEditor items={terms} onChange={setTerms} label="Terms & conditions" placeholder="Term" />
        <StringListEditor items={keyDestinations} onChange={setKeyDestinations} label="Key destinations / places to visit" placeholder="e.g. Burj Khalifa" />
        <PairListEditor items={facts} onChange={setFacts} label="Country facts" valueLabel="Value" valuePlaceholder="e.g. Abu Dhabi" />
        <PairListEditor items={faq} onChange={setFaq} label="FAQs" valueLabel="Answer" valuePlaceholder="Answer text" />

        <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave} loading={saving}>Save content</Button>
        </div>
      </div>
    </Modal>
  );
}