'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Modal, FormField, FormInput, FormTextarea } from '@/components/admin/ui';
import { useApi } from '@/hooks/use-api';
import { Languages, Plus, Pencil, Trash2, RotateCcw, Save } from 'lucide-react';

interface HeroStat {
  value: string;
  labelEn: string;
  labelBn?: string;
}

interface HeroSection {
  id: string;
  badgeTextEn?: string;
  badgeTextBn?: string;
  titleLineAEn?: string;
  titleLineABn?: string;
  titleLineBEn?: string;
  titleLineBBn?: string;
  titleLineCEn?: string;
  titleLineCBn?: string;
  subtitleEn?: string;
  subtitleBn?: string;
  ctaExploreEn?: string;
  ctaExploreBn?: string;
  ctaVisaEn?: string;
  ctaVisaBn?: string;
  ctaDestinationsEn?: string;
  ctaDestinationsBn?: string;
  stats: HeroStat[];
  quickPlaces: string[];
  isActive: boolean;
}

export default function AdminHeroPage() {
  const { getHero, saveHero, getHeroDefaults } = useApi();
  const [hero, setHero] = useState<HeroSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [defaults, setDefaults] = useState<any>(null);
  const [showStatModal, setShowStatModal] = useState(false);
  const [editingStat, setEditingStat] = useState<HeroStat | null>(null);
  const [statDraft, setStatDraft] = useState<HeroStat>({ value: '', labelEn: '', labelBn: '' });
  const [placesDraft, setPlacesDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = (await getHero()) as HeroSection;
      setHero(res);
      setPlacesDraft((res.quickPlaces ?? []).join(', '));
    } catch (err: any) {
      setError(err?.message || 'Failed to load hero section');
    } finally {
      setLoading(false);
    }
  };

  const loadDefaults = async () => {
    try {
      const d = await getHeroDefaults();
      setDefaults(d);
    } catch {
      // non-critical
    }
  };

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps

    load();
    loadDefaults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (patch: Partial<HeroSection>) => {
    setHero((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const handleSave = async () => {
    if (!hero) return;
    setSaving(true);
    setError(null);
    try {
      const body = {
        ...hero,
        quickPlaces: placesDraft
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const res = (await saveHero(body)) as HeroSection;
      setHero(res);
      setPlacesDraft((res.quickPlaces ?? []).join(', '));
    } catch (err: any) {
      setError(err?.message || 'Failed to save hero section');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!defaults) return;
    if (!confirm('Reset hero section to defaults? This will overwrite your current changes.')) return;
    setSaving(true);
    try {
      const res = (await saveHero(defaults)) as HeroSection;
      setHero(res);
      setPlacesDraft((res.quickPlaces ?? []).join(', '));
    } finally {
      setSaving(false);
    }
  };

  const openNewStat = () => {
    setEditingStat(null);
    setStatDraft({ value: '', labelEn: '', labelBn: '' });
    setShowStatModal(true);
  };

  const openEditStat = (stat: HeroStat, idx: number) => {
    setEditingStat(stat);
    setStatDraft({ ...stat });
    setShowStatModal(true);
  };

  const saveStat = () => {
    if (!statDraft.value.trim() || !statDraft.labelEn.trim()) return;
    const stats = [...(hero?.stats ?? [])];
    if (editingStat) {
      const idx = stats.indexOf(editingStat);
      if (idx >= 0) stats[idx] = statDraft;
    } else {
      stats.push(statDraft);
    }
    update({ stats });
    setShowStatModal(false);
  };

  const removeStat = (stat: HeroStat) => {
    update({ stats: (hero?.stats ?? []).filter((s) => s !== stat) });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!hero) {
    return (
      <Card hover={false}>
        <div className="text-center py-12">
          <p className="text-error">{error || 'Hero section not found'}</p>
          <Button onClick={load} className="mt-4">Retry</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Languages className="w-5 h-5 text-primary" />
            Hero Section
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Edit the homepage hero. Fields are bilingual (English + বাংলা).
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={!defaults || saving}>
            <RotateCcw className="w-4 h-4 mr-1" /> Reset to defaults
          </Button>
          <Button onClick={handleSave} loading={saving}>
            <Save className="w-4 h-4 mr-1" /> Save changes
          </Button>
        </div>
      </div>

      {error && (
        <Card hover={false}>
          <p className="text-error text-sm">{error}</p>
        </Card>
      )}

      <Card hover={false}>
        <h2 className="text-lg font-semibold mb-4">Badge</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Badge (English)">
            <FormInput value={hero.badgeTextEn ?? ''} onChange={(v) => update({ badgeTextEn: v })} />
          </FormField>
          <FormField label="Badge (বাংলা)">
            <FormInput value={hero.badgeTextBn ?? ''} onChange={(v) => update({ badgeTextBn: v })} />
          </FormField>
        </div>
      </Card>

      <Card hover={false}>
        <h2 className="text-lg font-semibold mb-4">Heading</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Title line A (English)">
            <FormInput value={hero.titleLineAEn ?? ''} onChange={(v) => update({ titleLineAEn: v })} />
          </FormField>
          <FormField label="Title line A (বাংলা)">
            <FormInput value={hero.titleLineABn ?? ''} onChange={(v) => update({ titleLineABn: v })} />
          </FormField>
          <FormField label="Title line B (English)">
            <FormInput value={hero.titleLineBEn ?? ''} onChange={(v) => update({ titleLineBEn: v })} />
          </FormField>
          <FormField label="Title line B (বাংলা)">
            <FormInput value={hero.titleLineBBn ?? ''} onChange={(v) => update({ titleLineBBn: v })} />
          </FormField>
          <FormField label="Title line C (English)">
            <FormInput value={hero.titleLineCEn ?? ''} onChange={(v) => update({ titleLineCEn: v })} />
          </FormField>
          <FormField label="Title line C (বাংলা)">
            <FormInput value={hero.titleLineCBn ?? ''} onChange={(v) => update({ titleLineCBn: v })} />
          </FormField>
        </div>
      </Card>

      <Card hover={false}>
        <h2 className="text-lg font-semibold mb-4">Subtitle</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Subtitle (English)">
            <FormTextarea rows={3} value={hero.subtitleEn ?? ''} onChange={(v) => update({ subtitleEn: v })} />
          </FormField>
          <FormField label="Subtitle (বাংলা)">
            <FormTextarea rows={3} value={hero.subtitleBn ?? ''} onChange={(v) => update({ subtitleBn: v })} />
          </FormField>
        </div>
      </Card>

      <Card hover={false}>
        <h2 className="text-lg font-semibold mb-4">Call to actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Explore tours (English)">
            <FormInput value={hero.ctaExploreEn ?? ''} onChange={(v) => update({ ctaExploreEn: v })} />
          </FormField>
          <FormField label="Explore tours (বাংলা)">
            <FormInput value={hero.ctaExploreBn ?? ''} onChange={(v) => update({ ctaExploreBn: v })} />
          </FormField>
          <FormField label="Visa (English)">
            <FormInput value={hero.ctaVisaEn ?? ''} onChange={(v) => update({ ctaVisaEn: v })} />
          </FormField>
          <FormField label="Visa (বাংলা)">
            <FormInput value={hero.ctaVisaBn ?? ''} onChange={(v) => update({ ctaVisaBn: v })} />
          </FormField>
          <FormField label="Destinations (English)">
            <FormInput value={hero.ctaDestinationsEn ?? ''} onChange={(v) => update({ ctaDestinationsEn: v })} />
          </FormField>
          <FormField label="Destinations (বাংলা)">
            <FormInput value={hero.ctaDestinationsBn ?? ''} onChange={(v) => update({ ctaDestinationsBn: v })} />
          </FormField>
        </div>
      </Card>

      <Card hover={false}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Stats</h2>
          <Button size="sm" onClick={openNewStat}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Add stat
          </Button>
        </div>
        <div className="space-y-2">
          {(hero.stats ?? []).length === 0 ? (
            <p className="text-sm text-on-surface-variant">No stats yet. Click "Add stat" to create one.</p>
          ) : (
            (hero.stats ?? []).map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant bg-surface-container-low">
                <span className="text-xl font-bold w-20">{s.value}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.labelEn}</p>
                  {s.labelBn && <p className="text-xs text-on-surface-variant truncate">{s.labelBn}</p>}
                </div>
                <button
                  className="p-1.5 rounded hover:bg-surface-container-high"
                  onClick={() => openEditStat(s, i)}
                  title="Edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  className="p-1.5 rounded hover:bg-error/10 text-error"
                  onClick={() => removeStat(s)}
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card hover={false}>
        <h2 className="text-lg font-semibold mb-4">Quick destination chips</h2>
        <FormField label="Quick places (comma-separated)">
          <FormInput
            value={placesDraft}
            onChange={setPlacesDraft}
            placeholder="Bali, Dubai, Maldives, Switzerland, Thailand"
          />
        </FormField>
      </Card>

      <Card hover={false}>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={hero.isActive}
            onChange={(e) => update({ isActive: e.target.checked })}
            className="rounded border-outline-variant text-primary focus:ring-primary/50"
          />
          <span className="font-medium">Active — show this hero on the homepage</span>
        </label>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleReset} disabled={!defaults || saving}>
          <RotateCcw className="w-4 h-4 mr-1" /> Reset to defaults
        </Button>
        <Button onClick={handleSave} loading={saving}>
          <Save className="w-4 h-4 mr-1" /> Save changes
        </Button>
      </div>

      <Modal open={showStatModal} onClose={() => setShowStatModal(false)} title={editingStat ? 'Edit stat' : 'New stat'}>
        <FormField label="Value (e.g. 500+, 24/7)">
          <FormInput value={statDraft.value} onChange={(v) => setStatDraft({ ...statDraft, value: v })} />
        </FormField>
        <FormField label="Label (English)">
          <FormInput value={statDraft.labelEn} onChange={(v) => setStatDraft({ ...statDraft, labelEn: v })} />
        </FormField>
        <FormField label="Label (বাংলা, optional)">
          <FormInput value={statDraft.labelBn ?? ''} onChange={(v) => setStatDraft({ ...statDraft, labelBn: v })} />
        </FormField>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setShowStatModal(false)}>Cancel</Button>
          <Button onClick={saveStat}>{editingStat ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>
    </div>
  );
}
