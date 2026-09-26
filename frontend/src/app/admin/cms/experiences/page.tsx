'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Modal, FormField, FormInput, FormTextarea } from '@/components/admin/ui';
import { ImageUploader } from '@/components/admin/image-uploader';
import { useApi } from '@/hooks/use-api';
import {
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  Save,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  MapPin,
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export interface AdminExperienceItem {
  id: string;
  badgeEn?: string;
  badgeBn?: string;
  badgeTone?: 'cyan' | 'amber' | 'rose' | 'emerald' | 'purple';
  titleEn: string;
  titleBn?: string;
  descriptionEn: string;
  descriptionBn?: string;
  locationEn: string;
  locationBn?: string;
  metaEn: string;
  metaBn?: string;
  image: string;
  ctaEn: string;
  ctaBn?: string;
  href: string;
  size?: 'lg' | 'sm';
  hasPlay?: boolean;
  order?: number;
  isActive?: boolean;
}

export interface AdminExperiencesConfig {
  id?: string;
  eyebrowEn?: string;
  eyebrowBn?: string;
  titlePrefixEn?: string;
  titleHighlightEn?: string;
  titlePrefixBn?: string;
  titleHighlightBn?: string;
  subtitleEn?: string;
  subtitleBn?: string;
  actionLabelEn?: string;
  actionLabelBn?: string;
  actionHref?: string;
  statusTextEn?: string;
  statusTextBn?: string;
  items?: AdminExperienceItem[];
  isActive?: boolean;
}

const BADGE_TONE_OPTIONS: Array<{ value: 'cyan' | 'amber' | 'rose' | 'emerald' | 'purple'; label: string; bg: string }> = [
  { value: 'cyan', label: 'Cyan / Teal', bg: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30' },
  { value: 'amber', label: 'Amber / Gold', bg: 'bg-amber-500/10 text-amber-500 border-amber-500/30' },
  { value: 'rose', label: 'Rose / Coral', bg: 'bg-rose-500/10 text-rose-500 border-rose-500/30' },
  { value: 'emerald', label: 'Emerald / Green', bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' },
  { value: 'purple', label: 'Purple / Royal', bg: 'bg-purple-500/10 text-purple-500 border-purple-500/30' },
];

export default function AdminExperiencesPage() {
  const { getCuratedExperiencesAdmin, saveCuratedExperiences, getCuratedExperiencesDefaults, uploadMedia } = useApi();

  const [config, setConfig] = useState<AdminExperiencesConfig>({
    eyebrowEn: 'Curated Experiences',
    eyebrowBn: 'বাছাইকৃত অভিজ্ঞতা',
    titlePrefixEn: 'Beyond booking.',
    titleHighlightEn: 'Beyond ordinary.',
    titlePrefixBn: 'বুকিংয়ের চেয়েও বেশি।',
    titleHighlightBn: 'সাধারণের চেয়েও অনন্য।',
    subtitleEn: 'Bespoke itineraries designed for those who value time, texture, and the quiet luxury of detail in their global travels.',
    subtitleBn: 'যারা বিশ্বভ্রমণে সময়, গুণমান ও আভিজাত্যকে মূল্যায়ন করেন—তাদের জন্যই আমাদের বিশেষ পরিকল্পনা।',
    actionLabelEn: 'View all experiences',
    actionLabelBn: 'সব অভিজ্ঞতা দেখুন',
    actionHref: '/destinations',
    statusTextEn: 'live · updated daily',
    statusTextBn: 'লাইভ · প্রতিদিন আপডেট',
    items: [],
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [itemDraft, setItemDraft] = useState<AdminExperienceItem>({
    id: '',
    badgeEn: '',
    badgeBn: '',
    badgeTone: 'cyan',
    titleEn: '',
    titleBn: '',
    descriptionEn: '',
    descriptionBn: '',
    locationEn: '',
    locationBn: '',
    metaEn: '',
    metaBn: '',
    image: '',
    ctaEn: 'Explore Destination',
    ctaBn: 'গন্তব্য দেখুন',
    href: '/destinations',
    size: 'sm',
    hasPlay: false,
    isActive: true,
  });

  useEffect(() => {
    async function load() {
      try {
        const res = (await getCuratedExperiencesAdmin()) as AdminExperiencesConfig;
        if (res) {
          setConfig({
            ...res,
            items: Array.isArray(res.items) ? res.items : [],
          });
        }
      } catch (err: any) {
        setFeedback({ type: 'error', message: err.message || 'Failed to load curated experiences' });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getCuratedExperiencesAdmin]);

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await saveCuratedExperiences(config);
      setFeedback({ type: 'success', message: 'Curated experiences updated successfully!' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save changes' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all experiences and section text to default values? Any unsaved edits will be replaced.')) {
      return;
    }
    setSaving(true);
    try {
      const defaults = (await getCuratedExperiencesDefaults()) as AdminExperiencesConfig;
      if (defaults) {
        setConfig({
          ...defaults,
          items: Array.isArray(defaults.items) ? defaults.items : [],
        });
        setFeedback({ type: 'success', message: 'Restored default template. Click "Save Changes" to apply to website.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load defaults' });
    } finally {
      setSaving(false);
    }
  };

  const openAddItemModal = () => {
    setEditingItemIndex(null);
    setItemDraft({
      id: `exp-${Date.now()}`,
      badgeEn: 'Special Feature',
      badgeBn: 'বিশেষ ফিচার',
      badgeTone: 'cyan',
      titleEn: '',
      titleBn: '',
      descriptionEn: '',
      descriptionBn: '',
      locationEn: '',
      locationBn: '',
      metaEn: '',
      metaBn: '',
      image: '',
      ctaEn: 'Explore Destination',
      ctaBn: 'গন্তব্য দেখুন',
      href: '/destinations',
      size: 'sm',
      hasPlay: false,
      isActive: true,
    });
    setShowItemModal(true);
  };

  const openEditItemModal = (index: number) => {
    setEditingItemIndex(index);
    const item = config.items?.[index];
    if (item) {
      setItemDraft({ ...item });
      setShowItemModal(true);
    }
  };

  const saveItemModal = () => {
    if (!itemDraft.titleEn.trim()) {
      alert('English Title is required.');
      return;
    }
    if (!itemDraft.image.trim()) {
      alert('Card Image is required.');
      return;
    }

    const currentItems = [...(config.items || [])];
    if (editingItemIndex !== null && editingItemIndex >= 0) {
      currentItems[editingItemIndex] = { ...itemDraft };
    } else {
      currentItems.push({ ...itemDraft, id: itemDraft.id || `exp-${Date.now()}` });
    }

    setConfig({ ...config, items: currentItems });
    setShowItemModal(false);
  };

  const deleteItem = (index: number) => {
    if (!window.confirm('Are you sure you want to delete this experience card?')) return;
    const currentItems = [...(config.items || [])];
    currentItems.splice(index, 1);
    setConfig({ ...config, items: currentItems });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const currentItems = [...(config.items || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentItems.length) return;
    const temp = currentItems[index];
    currentItems[index] = currentItems[targetIndex];
    currentItems[targetIndex] = temp;
    setConfig({ ...config, items: currentItems });
  };

  const handleUploadImage = async (file: File) => {
    const res: any = await uploadMedia(file, { folder: 'experiences' });
    return { url: res?.url || res?.data?.url || '' };
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-soft">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-display font-bold text-on-surface">Curated Experiences CMS</h1>
          </div>
          <p className="text-sm text-muted">
            Manage the homepage &quot;Beyond booking. Beyond ordinary.&quot; section, texts, badges, and featured cards.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleResetDefaults}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Defaults
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[var(--color-primary)] text-white hover:opacity-95"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="text-sm font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Section Global Settings */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-soft pb-4">
          <div>
            <h2 className="text-lg font-bold text-on-surface">Section Header & Settings</h2>
            <p className="text-xs text-muted">Headline text, gradient accent, subtitle, and action button</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs font-semibold text-muted">Section Active</span>
            <input
              type="checkbox"
              checked={config.isActive !== false}
              onChange={(e) => setConfig({ ...config, isActive: e.target.checked })}
              className="w-4 h-4 accent-[var(--color-primary)]"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Eyebrow (English)">
            <FormInput
              value={config.eyebrowEn || ''}
              onChange={(val) => setConfig({ ...config, eyebrowEn: val })}
              placeholder="Curated Experiences"
            />
          </FormField>
          <FormField label="Eyebrow (Bangla)">
            <FormInput
              value={config.eyebrowBn || ''}
              onChange={(val) => setConfig({ ...config, eyebrowBn: val })}
              placeholder="বাছাইকৃত অভিজ্ঞতা"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Title Prefix (English)">
            <FormInput
              value={config.titlePrefixEn || ''}
              onChange={(val) => setConfig({ ...config, titlePrefixEn: val })}
              placeholder="Beyond booking."
            />
          </FormField>
          <FormField label="Title Gradient Highlight (English)">
            <FormInput
              value={config.titleHighlightEn || ''}
              onChange={(val) => setConfig({ ...config, titleHighlightEn: val })}
              placeholder="Beyond ordinary."
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Title Prefix (Bangla)">
            <FormInput
              value={config.titlePrefixBn || ''}
              onChange={(val) => setConfig({ ...config, titlePrefixBn: val })}
              placeholder="বুকিংয়ের চেয়েও বেশি।"
            />
          </FormField>
          <FormField label="Title Gradient Highlight (Bangla)">
            <FormInput
              value={config.titleHighlightBn || ''}
              onChange={(val) => setConfig({ ...config, titleHighlightBn: val })}
              placeholder="সাধারণের চেয়েও অনন্য।"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Subtitle (English)">
            <FormTextarea
              rows={2}
              value={config.subtitleEn || ''}
              onChange={(val) => setConfig({ ...config, subtitleEn: val })}
              placeholder="Bespoke itineraries designed for those who value time..."
            />
          </FormField>
          <FormField label="Subtitle (Bangla)">
            <FormTextarea
              rows={2}
              value={config.subtitleBn || ''}
              onChange={(val) => setConfig({ ...config, subtitleBn: val })}
              placeholder="যারা বিশ্বভ্রমণে সময়, গুণমান ও আভিজাত্যকে মূল্যায়ন করেন..."
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Action Button Label (English)">
            <FormInput
              value={config.actionLabelEn || ''}
              onChange={(val) => setConfig({ ...config, actionLabelEn: val })}
              placeholder="View all experiences"
            />
          </FormField>
          <FormField label="Action Button Label (Bangla)">
            <FormInput
              value={config.actionLabelBn || ''}
              onChange={(val) => setConfig({ ...config, actionLabelBn: val })}
              placeholder="সব অভিজ্ঞতা দেখুন"
            />
          </FormField>
          <FormField label="Action Button Link">
            <FormInput
              value={config.actionHref || ''}
              onChange={(val) => setConfig({ ...config, actionHref: val })}
              placeholder="/destinations"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Status Text (English)">
            <FormInput
              value={config.statusTextEn || ''}
              onChange={(val) => setConfig({ ...config, statusTextEn: val })}
              placeholder="live · updated daily"
            />
          </FormField>
          <FormField label="Status Text (Bangla)">
            <FormInput
              value={config.statusTextBn || ''}
              onChange={(val) => setConfig({ ...config, statusTextBn: val })}
              placeholder="লাইভ · প্রতিদিন আপডেট"
            />
          </FormField>
        </div>
      </Card>

      {/* Experience Cards Section */}
      <Card className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-soft pb-4">
          <div>
            <h2 className="text-lg font-bold text-on-surface">Experience Cards ({config.items?.length || 0})</h2>
            <p className="text-xs text-muted">
              Add, edit, reorder or toggle showcase cards. The first card can be set to &quot;Large&quot; to give it premium emphasis.
            </p>
          </div>
          <Button onClick={openAddItemModal} className="flex items-center gap-1.5 bg-[var(--color-primary)] text-white">
            <Plus className="w-4 h-4" />
            Add Experience Card
          </Button>
        </div>

        {(!config.items || config.items.length === 0) ? (
          <div className="p-12 text-center border border-dashed border-soft rounded-2xl">
            <Sparkles className="w-8 h-8 text-muted mx-auto mb-2" />
            <p className="text-sm font-semibold text-on-surface">No custom cards added yet</p>
            <p className="text-xs text-muted mt-1">Default curated showcases will be displayed on the homepage until you add custom cards.</p>
            <Button onClick={openAddItemModal} className="mt-4">
              Add First Card
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {config.items.map((item, index) => {
              const tone = BADGE_TONE_OPTIONS.find((t) => t.value === item.badgeTone) || BADGE_TONE_OPTIONS[0];
              return (
                <div
                  key={item.id || index}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                    item.isActive !== false ? 'border-soft bg-surface-container/50' : 'border-dashed border-soft opacity-60 bg-surface-container/20'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/10 shrink-0 relative">
                      <img src={item.image} alt={item.titleEn} className="w-full h-full object-cover" />
                      {item.hasPlay && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play className="w-4 h-4 text-white fill-current" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {item.badgeEn && (
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${tone.bg}`}>
                            {item.badgeEn}
                          </span>
                        )}
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-container border border-soft text-muted">
                          {item.size === 'lg' ? 'Featured (2-col)' : 'Standard (1-col)'}
                        </span>
                        {item.isActive === false && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">
                            Inactive
                          </span>
                        )}
                      </div>
                      <h4 className="font-display font-bold text-on-surface text-base truncate">{item.titleEn}</h4>
                      {item.titleBn && <p className="text-xs text-muted truncate">{item.titleBn}</p>}
                      <div className="flex items-center gap-2 text-xs text-muted mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[var(--color-primary)]" />
                          {item.locationEn}
                        </span>
                        {item.metaEn && <span>· {item.metaEn}</span>}
                        {item.href && (
                          <a href={item.href} target="_blank" rel="noreferrer" className="flex items-center gap-0.5 text-[var(--color-primary)] hover:underline ml-1">
                            <span>{item.href}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                      className="p-2 h-8 w-8"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === (config.items?.length || 0) - 1}
                      className="p-2 h-8 w-8"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditItemModal(index)}
                      className="flex items-center gap-1.5 h-8 text-xs font-semibold"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteItem(index)}
                      className="p-2 h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                      title="Delete Card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Edit / Add Modal */}
      <Modal
        open={showItemModal}
        onClose={() => setShowItemModal(false)}
        title={editingItemIndex !== null ? 'Edit Experience Card' : 'Add Experience Card'}
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
          {/* Card Image */}
          <FormField label="Card Image (Required)">
            <ImageUploader
              value={itemDraft.image}
              onChange={(url) => setItemDraft({ ...itemDraft, image: url })}
              onUpload={handleUploadImage}
              placeholder="Upload showcase image or paste image URL"
              allowUrl
            />
          </FormField>

          {/* Titles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Title (English) *">
              <FormInput
                value={itemDraft.titleEn}
                onChange={(val) => setItemDraft({ ...itemDraft, titleEn: val })}
                placeholder="The Santorini Sky Loft"
              />
            </FormField>
            <FormField label="Title (Bangla)">
              <FormInput
                value={itemDraft.titleBn || ''}
                onChange={(val) => setItemDraft({ ...itemDraft, titleBn: val })}
                placeholder="দ্য সান্তোরিনি স্কাই লফট"
              />
            </FormField>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Description (English)">
              <FormTextarea
                rows={3}
                value={itemDraft.descriptionEn}
                onChange={(val) => setItemDraft({ ...itemDraft, descriptionEn: val })}
                placeholder="Private jet transfers and cliffside glass villas..."
              />
            </FormField>
            <FormField label="Description (Bangla)">
              <FormTextarea
                rows={3}
                value={itemDraft.descriptionBn || ''}
                onChange={(val) => setItemDraft({ ...itemDraft, descriptionBn: val })}
                placeholder="প্রাইভেট জেট স্থানান্তর ও ক্লিফসাইড গ্লাস ভিলা..."
              />
            </FormField>
          </div>

          {/* Location & Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Location (English)">
              <FormInput
                value={itemDraft.locationEn}
                onChange={(val) => setItemDraft({ ...itemDraft, locationEn: val })}
                placeholder="Santorini, Greece"
              />
            </FormField>
            <FormField label="Location (Bangla)">
              <FormInput
                value={itemDraft.locationBn || ''}
                onChange={(val) => setItemDraft({ ...itemDraft, locationBn: val })}
                placeholder="সান্তোরিনি, গ্রিস"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Meta / Pricing Tag (English)">
              <FormInput
                value={itemDraft.metaEn}
                onChange={(val) => setItemDraft({ ...itemDraft, metaEn: val })}
                placeholder="7 nights · from $12,400"
              />
            </FormField>
            <FormField label="Meta / Pricing Tag (Bangla)">
              <FormInput
                value={itemDraft.metaBn || ''}
                onChange={(val) => setItemDraft({ ...itemDraft, metaBn: val })}
                placeholder="৭ রাত · $১২,৪০০ থেকে"
              />
            </FormField>
          </div>

          {/* Badge & Tone */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Badge Text (English)">
              <FormInput
                value={itemDraft.badgeEn || ''}
                onChange={(val) => setItemDraft({ ...itemDraft, badgeEn: val })}
                placeholder="Seasonal Feature"
              />
            </FormField>
            <FormField label="Badge Text (Bangla)">
              <FormInput
                value={itemDraft.badgeBn || ''}
                onChange={(val) => setItemDraft({ ...itemDraft, badgeBn: val })}
                placeholder="মৌসুমি ফিচার"
              />
            </FormField>
            <FormField label="Badge Color Tone">
              <select
                value={itemDraft.badgeTone || 'cyan'}
                onChange={(e) => setItemDraft({ ...itemDraft, badgeTone: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-soft bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                {BADGE_TONE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          {/* CTA & Link */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Button Label (English)">
              <FormInput
                value={itemDraft.ctaEn}
                onChange={(val) => setItemDraft({ ...itemDraft, ctaEn: val })}
                placeholder="Explore Destination"
              />
            </FormField>
            <FormField label="Button Label (Bangla)">
              <FormInput
                value={itemDraft.ctaBn || ''}
                onChange={(val) => setItemDraft({ ...itemDraft, ctaBn: val })}
                placeholder="গন্তব্য দেখুন"
              />
            </FormField>
            <FormField label="Button Link / URL">
              <FormInput
                value={itemDraft.href}
                onChange={(val) => setItemDraft({ ...itemDraft, href: val })}
                placeholder="/destinations or /booking"
              />
            </FormField>
          </div>

          {/* Layout Options */}
          <div className="pt-2 border-t border-soft grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase mb-1.5">Card Width</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setItemDraft({ ...itemDraft, size: 'sm' })}
                  className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-semibold ${
                    itemDraft.size !== 'lg' ? 'border-[var(--color-primary)] bg-primary/10 text-primary' : 'border-soft text-muted'
                  }`}
                >
                  Standard (1 Col)
                </button>
                <button
                  type="button"
                  onClick={() => setItemDraft({ ...itemDraft, size: 'lg' })}
                  className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-semibold ${
                    itemDraft.size === 'lg' ? 'border-[var(--color-primary)] bg-primary/10 text-primary' : 'border-soft text-muted'
                  }`}
                >
                  Featured (2 Col)
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer mt-6 select-none">
              <input
                type="checkbox"
                checked={!!itemDraft.hasPlay}
                onChange={(e) => setItemDraft({ ...itemDraft, hasPlay: e.target.checked })}
                className="w-4 h-4 accent-[var(--color-primary)]"
              />
              <span className="text-xs font-semibold text-on-surface">Show Play / Video Button</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer mt-6 select-none">
              <input
                type="checkbox"
                checked={itemDraft.isActive !== false}
                onChange={(e) => setItemDraft({ ...itemDraft, isActive: e.target.checked })}
                className="w-4 h-4 accent-[var(--color-primary)]"
              />
              <span className="text-xs font-semibold text-on-surface">Card Active</span>
            </label>
          </div>

          <div className="pt-4 border-t border-soft flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowItemModal(false)}>
              Cancel
            </Button>
            <Button onClick={saveItemModal} className="bg-[var(--color-primary)] text-white">
              {editingItemIndex !== null ? 'Update Card' : 'Add Card'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
