'use client';

import { useEffect, useState } from 'react';
import {
  Save, RotateCcw, Plus, Pencil, Trash2, GripVertical, ChevronUp, ChevronDown,
  Image as ImageIcon, FileText, List, BarChart3, MapPin, Award, Users, Heart,
  Sparkles, Star, Eye, EyeOff, Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Modal, FormField, FormInput, FormTextarea, FormSelect, ConfirmDialog } from '@/components/admin/ui';
import { useApi } from '@/hooks/use-api';
import { ImageUploader } from '@/components/admin/image-uploader';

type SectionType =
  | 'STORY' | 'VISION' | 'MISSION' | 'SERVICE' | 'SERVICES'
  | 'VALUES' | 'STATS' | 'ACHIEVEMENTS' | 'TEAM' | 'TRIPS'
  | 'STRATEGIES' | 'CONTACT' | 'CUSTOM';

const SECTION_LABELS: Record<SectionType, string> = {
  STORY: 'Our Story (text)',
  VISION: 'Vision (text)',
  MISSION: 'Mission (text)',
  SERVICE: 'Service (text)',
  TEAM: 'A Team of Experts (text)',
  TRIPS: 'Our Trips (text)',
  CUSTOM: 'Custom (text)',
  ACHIEVEMENTS: 'Achievements (icon list)',
  VALUES: 'Values (icon list)',
  SERVICES: 'What Can We Do (icon list)',
  STRATEGIES: 'Key Strategies (numbered list)',
  STATS: 'Stats (numbers)',
  CONTACT: 'Office / Contact (address, phone, email)',
};

const SECTION_ICONS: Record<SectionType, React.ComponentType<{ className?: string }>> = {
  STORY: FileText,
  VISION: Sparkles,
  MISSION: Star,
  SERVICE: Heart,
  TEAM: Users,
  TRIPS: Award,
  CUSTOM: FileText,
  ACHIEVEMENTS: Award,
  VALUES: Heart,
  SERVICES: List,
  STRATEGIES: BarChart3,
  STATS: BarChart3,
  CONTACT: MapPin,
};

interface AboutSection {
  id: string;
  type: SectionType;
  order: number;
  titleEn?: string | null;
  titleBn?: string | null;
  subtitleEn?: string | null;
  subtitleBn?: string | null;
  bodyEn?: string | null;
  bodyBn?: string | null;
  payload?: any;
  isActive: boolean;
}

interface AboutMeta {
  heroEyebrowEn?: string | null;
  heroEyebrowBn?: string | null;
  heroTitleEn?: string | null;
  heroTitleBn?: string | null;
  heroSubtitleEn?: string | null;
  heroSubtitleBn?: string | null;
  heroImageUrl?: string | null;
  ctaLabelEn?: string | null;
  ctaLabelBn?: string | null;
  ctaHref?: string | null;
  officeAddress?: string | null;
  officePhone?: string | null;
  officeEmail?: string | null;
  sloganEn?: string | null;
  sloganBn?: string | null;
  isActive?: boolean;
}

const emptyMeta: AboutMeta = {
  heroEyebrowEn: '', heroEyebrowBn: '', heroTitleEn: '', heroTitleBn: '',
  heroSubtitleEn: '', heroSubtitleBn: '', heroImageUrl: '',
  ctaLabelEn: '', ctaLabelBn: '', ctaHref: '',
  officeAddress: '', officePhone: '', officeEmail: '',
  sloganEn: '', sloganBn: '', isActive: true,
};

export default function AdminAboutPage() {
  const {
    getAboutMeta, saveAboutMeta,
    listAboutSectionsAdmin, createAboutSection, updateAboutSection, deleteAboutSection,
    reorderAboutSections, getAboutDefaults,
    listMedia, uploadMedia,
  } = useApi();

  const [meta, setMeta] = useState<AboutMeta>(emptyMeta);
  const [metaSaving, setMetaSaving] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [defaults, setDefaults] = useState<any>(null);

  const [sections, setSections] = useState<AboutSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sectionModal, setSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState<AboutSection | null>(null);
  const [sectionDraft, setSectionDraft] = useState<Partial<AboutSection>>({});
  const [savingSection, setSavingSection] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [m, s, d] = await Promise.all([
        getAboutMeta() as Promise<AboutMeta>,
        listAboutSectionsAdmin() as Promise<AboutSection[]>,
        getAboutDefaults().catch(() => null),
      ]);
      setMeta({ ...emptyMeta, ...m });
      setSections(s.sort((a, b) => a.order - b.order));
      setDefaults(d);
    } catch (err: any) {
      setError(err?.message || 'Failed to load about page');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMetaSave = async () => {
    setMetaSaving(true);
    setMetaError(null);
    try {
      const res = await saveAboutMeta(meta) as AboutMeta;
      setMeta({ ...emptyMeta, ...res });
    } catch (err: any) {
      setMetaError(err?.message || 'Failed to save meta');
    } finally {
      setMetaSaving(false);
    }
  };

  const handleMetaReset = async () => {
    if (!defaults?.meta) return;
    if (!confirm('Reset the hero / contact info to defaults? This will overwrite your current values.')) return;
    setMetaSaving(true);
    try {
      const res = await saveAboutMeta(defaults.meta) as AboutMeta;
      setMeta({ ...emptyMeta, ...res });
    } finally {
      setMetaSaving(false);
    }
  };

  const openNewSection = () => {
    setEditingSection(null);
    setSectionDraft({
      type: 'CUSTOM',
      order: sections.length,
      titleEn: '', titleBn: '',
      subtitleEn: '', subtitleBn: '',
      bodyEn: '', bodyBn: '',
      payload: {},
      isActive: true,
    });
    setSectionModal(true);
  };

  const openEditSection = (s: AboutSection) => {
    setEditingSection(s);
    setSectionDraft({ ...s, payload: s.payload ?? {} });
    setSectionModal(true);
  };

  const saveSection = async () => {
    if (!sectionDraft.type) return;
    setSavingSection(true);
    try {
      const body = {
        type: sectionDraft.type,
        order: sectionDraft.order ?? 0,
        titleEn: sectionDraft.titleEn || undefined,
        titleBn: sectionDraft.titleBn || undefined,
        subtitleEn: sectionDraft.subtitleEn || undefined,
        subtitleBn: sectionDraft.subtitleBn || undefined,
        bodyEn: sectionDraft.bodyEn || undefined,
        bodyBn: sectionDraft.bodyBn || undefined,
        payload: sectionDraft.payload ?? {},
        isActive: sectionDraft.isActive ?? true,
      };
      if (editingSection) {
        await updateAboutSection(editingSection.id, body);
      } else {
        await createAboutSection(body);
      }
      setSectionModal(false);
      const s = await listAboutSectionsAdmin() as AboutSection[];
      setSections(s.sort((a, b) => a.order - b.order));
    } catch {
      // keep modal open on error
    } finally {
      setSavingSection(false);
    }
  };

  const removeSection = async () => {
    if (!deleteId) return;
    try {
      await deleteAboutSection(deleteId);
      setDeleteId(null);
      const s = await listAboutSectionsAdmin() as AboutSection[];
      setSections(s.sort((a, b) => a.order - b.order));
    } catch {
      // ignore
    }
  };

  const toggleActive = async (s: AboutSection) => {
    try {
      await updateAboutSection(s.id, { isActive: !s.isActive });
      const next = await listAboutSectionsAdmin() as AboutSection[];
      setSections(next.sort((a, b) => a.order - b.order));
    } catch {
      // ignore
    }
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[idx], next[target]] = [next[target], next[idx]];
    setSections(next);
    try {
      await reorderAboutSections(next.map((s) => s.id));
    } catch {
      // rollback
      const fresh = await listAboutSectionsAdmin() as AboutSection[];
      setSections(fresh.sort((a, b) => a.order - b.order));
    }
  };

  const handleUpload = async (file: File): Promise<{ url: string }> => {
    const res = await uploadMedia(file, { folder: 'about' }) as any;
    return { url: res?.url ?? '' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            About Us — Page Builder
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Manage the <code className="px-1 py-0.5 rounded bg-surface-container text-xs">/about</code> page — hero, slogan, contact info, and all content sections.
          </p>
        </div>
      </div>

      {error && (
        <Card hover={false}>
          <p className="text-error text-sm">{error}</p>
        </Card>
      )}

      {/* META */}
      <Card hover={false}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-primary" /> Hero & Contact Info
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">Top hero, slogan, and office contact details shown across the page.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleMetaReset} disabled={!defaults?.meta || metaSaving}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
            </Button>
            <Button size="sm" onClick={handleMetaSave} loading={metaSaving}>
              <Save className="w-3.5 h-3.5 mr-1" /> Save
            </Button>
          </div>
        </div>

        {metaError && <p className="text-error text-sm mb-3">{metaError}</p>}

        <div className="space-y-5">
          <SubHeader>Hero (banner)</SubHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Eyebrow (English)">
              <FormInput value={meta.heroEyebrowEn ?? ''} onChange={(v) => setMeta({ ...meta, heroEyebrowEn: v })} />
            </FormField>
            <FormField label="Eyebrow (বাংলা)">
              <FormInput value={meta.heroEyebrowBn ?? ''} onChange={(v) => setMeta({ ...meta, heroEyebrowBn: v })} />
            </FormField>
            <FormField label="Title (English)">
              <FormInput value={meta.heroTitleEn ?? ''} onChange={(v) => setMeta({ ...meta, heroTitleEn: v })} />
            </FormField>
            <FormField label="Title (বাংলা)">
              <FormInput value={meta.heroTitleBn ?? ''} onChange={(v) => setMeta({ ...meta, heroTitleBn: v })} />
            </FormField>
            <FormField label="Subtitle (English)">
              <FormTextarea rows={3} value={meta.heroSubtitleEn ?? ''} onChange={(v) => setMeta({ ...meta, heroSubtitleEn: v })} />
            </FormField>
            <FormField label="Subtitle (বাংলা)">
              <FormTextarea rows={3} value={meta.heroSubtitleBn ?? ''} onChange={(v) => setMeta({ ...meta, heroSubtitleBn: v })} />
            </FormField>
          </div>

          <FormField label="Hero background image (optional)">
            <ImageUploader
              value={meta.heroImageUrl ?? ''}
              onChange={(url) => setMeta({ ...meta, heroImageUrl: url })}
              onUpload={handleUpload}
              folder="about"
              alt="About hero"
              aspectRatio={2.4}
            />
          </FormField>

          <SubHeader>Slogan / Tagline</SubHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Slogan (English)">
              <FormInput value={meta.sloganEn ?? ''} onChange={(v) => setMeta({ ...meta, sloganEn: v })} placeholder="travel · enjoy · save" />
            </FormField>
            <FormField label="Slogan (বাংলা)">
              <FormInput value={meta.sloganBn ?? ''} onChange={(v) => setMeta({ ...meta, sloganBn: v })} placeholder="ভ্রমণ · উপভোগ · সাশ্রয়" />
            </FormField>
          </div>

          <SubHeader>Office / Contact</SubHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Office address">
              <FormTextarea rows={2} value={meta.officeAddress ?? ''} onChange={(v) => setMeta({ ...meta, officeAddress: v })} />
            </FormField>
            <div className="space-y-4">
              <FormField label="Phone">
                <FormInput value={meta.officePhone ?? ''} onChange={(v) => setMeta({ ...meta, officePhone: v })} />
              </FormField>
              <FormField label="Email">
                <FormInput type="email" value={meta.officeEmail ?? ''} onChange={(v) => setMeta({ ...meta, officeEmail: v })} />
              </FormField>
            </div>
          </div>

          <SubHeader>Hero CTA</SubHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="CTA label (English)">
              <FormInput value={meta.ctaLabelEn ?? ''} onChange={(v) => setMeta({ ...meta, ctaLabelEn: v })} />
            </FormField>
            <FormField label="CTA label (বাংলা)">
              <FormInput value={meta.ctaLabelBn ?? ''} onChange={(v) => setMeta({ ...meta, ctaLabelBn: v })} />
            </FormField>
            <FormField label="CTA href">
              <FormInput value={meta.ctaHref ?? ''} onChange={(v) => setMeta({ ...meta, ctaHref: v })} placeholder="/contact" />
            </FormField>
          </div>

          <label className="flex items-center gap-2 text-sm pt-2">
            <input
              type="checkbox"
              checked={!!meta.isActive}
              onChange={(e) => setMeta({ ...meta, isActive: e.target.checked })}
              className="rounded border-outline-variant text-primary focus:ring-primary/50"
            />
            <span className="font-medium">Active — show this hero on the about page</span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={handleMetaReset} disabled={!defaults?.meta || metaSaving}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
            </Button>
            <Button size="sm" onClick={handleMetaSave} loading={metaSaving}>
              <Save className="w-3.5 h-3.5 mr-1" /> Save
            </Button>
          </div>
        </div>
      </Card>

      {/* SECTIONS */}
      <Card hover={false}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <List className="w-4 h-4 text-primary" /> Content Sections
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">
              Story, Vision, Mission, Achievements, Values, Services, Stats, Contact — reorder and edit each.
            </p>
          </div>
          <Button size="sm" onClick={openNewSection}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Add section
          </Button>
        </div>

        <div className="space-y-2">
          {sections.length === 0 && (
            <p className="text-sm text-on-surface-variant py-6 text-center">No sections yet.</p>
          )}
          {sections.map((s, idx) => {
            const Icon = SECTION_ICONS[s.type] ?? FileText;
            return (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant bg-surface-container-low hover:border-primary/30 transition-colors"
              >
                <GripVertical className="w-4 h-4 text-on-surface-variant/60 flex-shrink-0" />
                <div className="flex flex-col">
                  <button
                    className="p-0.5 rounded hover:bg-surface-container-high disabled:opacity-30"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    title="Move up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    className="p-0.5 rounded hover:bg-surface-container-high disabled:opacity-30"
                    onClick={() => move(idx, 1)}
                    disabled={idx === sections.length - 1}
                    title="Move down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {s.titleEn || SECTION_LABELS[s.type]}
                  </p>
                  <p className="text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">
                    {SECTION_LABELS[s.type]}
                    {s.isActive ? '' : ' · HIDDEN'}
                  </p>
                </div>
                <button
                  className="p-1.5 rounded hover:bg-surface-container-high"
                  onClick={() => toggleActive(s)}
                  title={s.isActive ? 'Hide on page' : 'Show on page'}
                >
                  {s.isActive ? <Eye className="w-3.5 h-3.5 text-primary" /> : <EyeOff className="w-3.5 h-3.5 text-on-surface-variant" />}
                </button>
                <button
                  className="p-1.5 rounded hover:bg-surface-container-high"
                  onClick={() => openEditSection(s)}
                  title="Edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  className="p-1.5 rounded hover:bg-error/10 text-error"
                  onClick={() => setDeleteId(s.id)}
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Section modal */}
      <Modal
        open={sectionModal}
        onClose={() => setSectionModal(false)}
        title={editingSection ? 'Edit section' : 'New section'}
      >
        <div className="space-y-4">
          <FormField label="Section type" required>
            <FormSelect
              value={sectionDraft.type}
              onChange={(v) => setSectionDraft({ ...sectionDraft, type: v as SectionType })}
              options={Object.entries(SECTION_LABELS).map(([value, label]) => ({ value, label }))}
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Title (English)">
              <FormInput value={sectionDraft.titleEn ?? ''} onChange={(v) => setSectionDraft({ ...sectionDraft, titleEn: v })} />
            </FormField>
            <FormField label="Title (বাংলা)">
              <FormInput value={sectionDraft.titleBn ?? ''} onChange={(v) => setSectionDraft({ ...sectionDraft, titleBn: v })} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Subtitle (English)">
              <FormTextarea rows={2} value={sectionDraft.subtitleEn ?? ''} onChange={(v) => setSectionDraft({ ...sectionDraft, subtitleEn: v })} />
            </FormField>
            <FormField label="Subtitle (বাংলা)">
              <FormTextarea rows={2} value={sectionDraft.subtitleBn ?? ''} onChange={(v) => setSectionDraft({ ...sectionDraft, subtitleBn: v })} />
            </FormField>
          </div>

          {(sectionDraft.type === 'STORY' || sectionDraft.type === 'VISION' || sectionDraft.type === 'MISSION' || sectionDraft.type === 'SERVICE' || sectionDraft.type === 'TEAM' || sectionDraft.type === 'TRIPS' || sectionDraft.type === 'CUSTOM') && (
            <>
              <FormField label="Body (English)">
                <FormTextarea rows={6} value={sectionDraft.bodyEn ?? ''} onChange={(v) => setSectionDraft({ ...sectionDraft, bodyEn: v })} placeholder="Use blank lines to separate paragraphs." />
              </FormField>
              <FormField label="Body (বাংলা)">
                <FormTextarea rows={6} value={sectionDraft.bodyBn ?? ''} onChange={(v) => setSectionDraft({ ...sectionDraft, bodyBn: v })} />
              </FormField>
            </>
          )}

          {(sectionDraft.type === 'ACHIEVEMENTS' || sectionDraft.type === 'VALUES' || sectionDraft.type === 'SERVICES' || sectionDraft.type === 'STRATEGIES') && (
            <PayloadItemEditor
              value={(sectionDraft.payload?.items as any[]) ?? []}
              onChange={(items) => setSectionDraft({ ...sectionDraft, payload: { ...(sectionDraft.payload ?? {}), items } })}
              showIcon
            />
          )}

          {sectionDraft.type === 'STATS' && (
            <PayloadItemEditor
              value={(sectionDraft.payload?.items as any[]) ?? []}
              onChange={(items) => setSectionDraft({ ...sectionDraft, payload: { ...(sectionDraft.payload ?? {}), items } })}
              mode="stat"
            />
          )}

          {sectionDraft.type === 'CONTACT' && (
            <ContactPayloadEditor
              value={(sectionDraft.payload as any) ?? {}}
              onChange={(p) => setSectionDraft({ ...sectionDraft, payload: p })}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Display order">
              <FormInput type="number" value={String(sectionDraft.order ?? 0)} onChange={(v) => setSectionDraft({ ...sectionDraft, order: Number(v) || 0 })} />
            </FormField>
            <label className="flex items-center gap-2 text-sm mt-7">
              <input
                type="checkbox"
                checked={sectionDraft.isActive ?? true}
                onChange={(e) => setSectionDraft({ ...sectionDraft, isActive: e.target.checked })}
                className="rounded border-outline-variant text-primary focus:ring-primary/50"
              />
              <span className="font-medium">Active</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setSectionModal(false)}>Cancel</Button>
            <Button onClick={saveSection} loading={savingSection}>{editingSection ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={removeSection}
        title="Delete section"
        message="This section will be removed from the public about page. Continue?"
      />
    </div>
  );
}

function SubHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="h-px flex-1 bg-outline-variant" />
      <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-on-surface-variant">{children}</span>
      <span className="h-px flex-1 bg-outline-variant" />
    </div>
  );
}

interface PayloadItem {
  icon?: string;
  titleEn?: string;
  titleBn?: string;
  descriptionEn?: string;
  descriptionBn?: string;
  value?: string;
  labelEn?: string;
  labelBn?: string;
}

function PayloadItemEditor({
  value, onChange, mode = 'item', showIcon = false,
}: {
  value: PayloadItem[];
  onChange: (items: PayloadItem[]) => void;
  mode?: 'item' | 'stat';
  showIcon?: boolean;
}) {
  const items = value ?? [];
  const add = () => {
    const blank: PayloadItem = mode === 'stat'
      ? { value: '', labelEn: '', labelBn: '' }
      : showIcon
        ? { icon: 'Award', titleEn: '', titleBn: '', descriptionEn: '', descriptionBn: '' }
        : { titleEn: '', titleBn: '', descriptionEn: '', descriptionBn: '' };
    onChange([...items, blank]);
  };
  const update = (idx: number, patch: Partial<PayloadItem>) => {
    const next = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    onChange(next);
  };
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">
          {mode === 'stat' ? 'Stat tiles' : 'Items'}
        </p>
        <Button size="sm" variant="outline" onClick={add}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Add
        </Button>
      </div>

      <div className="space-y-2">
        {items.length === 0 && (
          <p className="text-xs text-on-surface-variant text-center py-3 border border-dashed border-outline-variant rounded-lg">
            No items yet — click &ldquo;Add&rdquo; to create one.
          </p>
        )}
        {items.map((it, idx) => (
          <div key={idx} className="rounded-lg border border-outline-variant p-3 space-y-2 bg-surface-container">
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-on-surface-variant">
                #{idx + 1}
              </span>
              <button
                className="p-1 rounded hover:bg-error/10 text-error"
                onClick={() => remove(idx)}
                title="Remove"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {mode === 'stat' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <FormInput placeholder="Value (e.g. 500+)" value={it.value ?? ''} onChange={(v) => update(idx, { value: v })} />
                <FormInput placeholder="Label (EN)" value={it.labelEn ?? ''} onChange={(v) => update(idx, { labelEn: v })} />
                <FormInput placeholder="Label (BN)" value={it.labelBn ?? ''} onChange={(v) => update(idx, { labelBn: v })} />
              </div>
            ) : (
              <>
                {showIcon && (
                  <FormField label="Icon name (lucide)">
                    <FormInput
                      value={it.icon ?? ''}
                      onChange={(v) => update(idx, { icon: v })}
                      placeholder="Award, Heart, Plane, Users, Zap…"
                    />
                  </FormField>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <FormInput placeholder="Title (English)" value={it.titleEn ?? ''} onChange={(v) => update(idx, { titleEn: v })} />
                  <FormInput placeholder="Title (বাংলা)" value={it.titleBn ?? ''} onChange={(v) => update(idx, { titleBn: v })} />
                  <FormInput placeholder="Description (English)" value={it.descriptionEn ?? ''} onChange={(v) => update(idx, { descriptionEn: v })} />
                  <FormInput placeholder="Description (বাংলা)" value={it.descriptionBn ?? ''} onChange={(v) => update(idx, { descriptionBn: v })} />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactPayloadEditor({ value, onChange }: { value: any; onChange: (p: any) => void }) {
  const v = value ?? {};
  return (
    <div className="space-y-3">
      <FormField label="Address">
        <FormTextarea rows={2} value={v.address ?? ''} onChange={(val) => onChange({ ...v, address: val })} />
      </FormField>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormField label="Phone">
          <FormInput value={v.phone ?? ''} onChange={(val) => onChange({ ...v, phone: val })} />
        </FormField>
        <FormField label="Email">
          <FormInput type="email" value={v.email ?? ''} onChange={(val) => onChange({ ...v, email: val })} />
        </FormField>
        <FormField label="Office hours">
          <FormInput value={v.hours ?? ''} onChange={(val) => onChange({ ...v, hours: val })} placeholder="Sat – Thu · 9:00 AM – 7:00 PM" />
        </FormField>
      </div>
    </div>
  );
}
