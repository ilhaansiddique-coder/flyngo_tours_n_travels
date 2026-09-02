'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, Save, Upload, ImageIcon, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField, FormInput, FormTextarea } from '@/components/admin/ui';
import { useApi } from '@/hooks/use-api';
import { ImageUploader } from '@/components/admin/image-uploader';

interface CeoMessage {
  id: string;
  name: string;
  title: string;
  imageUrl?: string | null;
  bodyEn: string;
  bodyBn?: string | null;
  signatureEn?: string | null;
  signatureBn?: string | null;
  isActive: boolean;
}

const emptyForm = {
  name: '',
  title: '',
  imageUrl: '',
  bodyEn: '',
  bodyBn: '',
  signatureEn: '',
  signatureBn: '',
  isActive: true,
};

export default function AdminCeoPage() {
  const {
    listCeoMessagesAdmin, upsertCeoMessage, getAboutDefaults,
    uploadMedia,
  } = useApi();

  const [form, setForm] = useState({ ...emptyForm });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [defaults, setDefaults] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, d] = await Promise.all([
        listCeoMessagesAdmin() as Promise<CeoMessage[]>,
        getAboutDefaults().catch(() => null),
      ]);
      const active = list.find((m) => m.isActive) ?? list[0];
      if (active) {
        setActiveId(active.id);
        setForm({
          name: active.name,
          title: active.title,
          imageUrl: active.imageUrl ?? '',
          bodyEn: active.bodyEn,
          bodyBn: active.bodyBn ?? '',
          signatureEn: active.signatureEn ?? '',
          signatureBn: active.signatureBn ?? '',
          isActive: active.isActive,
        });
      }
      setDefaults(d);
    } catch (err: any) {
      setError(err?.message || 'Failed to load CEO message');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!form.name.trim() || !form.title.trim() || !form.bodyEn.trim()) {
      setError('Name, title, and English body are required.');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const body = {
        name: form.name.trim(),
        title: form.title.trim(),
        imageUrl: form.imageUrl.trim() || undefined,
        bodyEn: form.bodyEn.trim(),
        bodyBn: form.bodyBn.trim() || undefined,
        signatureEn: form.signatureEn.trim() || undefined,
        signatureBn: form.signatureBn.trim() || undefined,
        isActive: form.isActive,
      };
      const res = await upsertCeoMessage(body) as CeoMessage;
      setActiveId(res.id);
      setSuccess('CEO message saved.');
    } catch (err: any) {
      setError(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!defaults?.ceo) return;
    if (!confirm('Reset the CEO message to defaults? This will overwrite your current values.')) return;
    const c = defaults.ceo;
    setForm({
      name: c.name ?? '',
      title: c.title ?? '',
      imageUrl: c.imageUrl ?? '',
      bodyEn: c.bodyEn ?? '',
      bodyBn: c.bodyBn ?? '',
      signatureEn: c.signatureEn ?? '',
      signatureBn: c.signatureBn ?? '',
      isActive: c.isActive ?? true,
    });
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
            <MessageCircle className="w-5 h-5 text-primary" />
            Message from CEO
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Manage the personal note shown on the <code className="px-1 py-0.5 rounded bg-surface-container text-xs">/about/ceo</code> page.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={!defaults?.ceo || saving}>
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
      {success && (
        <Card hover={false}>
          <p className="text-sm text-success">{success}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card hover={false}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Profile
          </h2>
          <div className="space-y-4">
            <FormField label="Full name" required>
              <FormInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. Alex Morgan" />
            </FormField>
            <FormField label="Title / Role" required>
              <FormInput
                value={form.title}
                onChange={(v) => setForm({ ...form, title: v })}
                placeholder="Founder & Chief Executive Officer, FlynGo"
              />
            </FormField>
            <FormField label="Photo">
              <ImageUploader
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
                onUpload={handleUpload}
                folder="about"
                alt="CEO"
                aspectRatio={1}
              />
            </FormField>
            <p className="text-xs text-on-surface-variant">
              Tip: drop a 1:1 portrait PNG/JPG under 10 MB. If you don&apos;t upload one, the public page will show the
              initials of the CEO&apos;s name.
            </p>
          </div>
        </Card>

        <Card hover={false}>
          <h2 className="text-lg font-semibold mb-4">Message Body</h2>
          <div className="space-y-4">
            <FormField label="Message (English)" required>
              <FormTextarea
                rows={14}
                value={form.bodyEn}
                onChange={(v) => setForm({ ...form, bodyEn: v })}
                placeholder="Dear Travelers, …"
              />
            </FormField>
            <FormField label="Message (বাংলা, optional)">
              <FormTextarea
                rows={10}
                value={form.bodyBn}
                onChange={(v) => setForm({ ...form, bodyBn: v })}
              />
            </FormField>
          </div>
        </Card>

        <Card hover={false}>
          <h2 className="text-lg font-semibold mb-4">Signature</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Signature (English)">
              <FormInput value={form.signatureEn} onChange={(v) => setForm({ ...form, signatureEn: v })} placeholder="Founder & CEO, FlynGo" />
            </FormField>
            <FormField label="Signature (বাংলা)">
              <FormInput value={form.signatureBn} onChange={(v) => setForm({ ...form, signatureBn: v })} placeholder="প্রতিষ্ঠাতা ও সিইও, FlynGo" />
            </FormField>
          </div>
          <label className="flex items-center gap-2 text-sm mt-4">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded border-outline-variant text-primary focus:ring-primary/50"
            />
            <span className="font-medium">Active — show this message on the public Message from CEO page</span>
          </label>
        </Card>

        <Card hover={false}>
          <h2 className="text-lg font-semibold mb-4">Preview</h2>
          <div className="rounded-2xl border border-hairline p-5 bg-surface-container-low">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-tertiary flex items-center justify-center text-on-primary font-display text-2xl font-bold flex-shrink-0">
                {form.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.imageUrl} alt={form.name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  (form.name || 'C').charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="font-display text-base font-bold text-on-surface truncate">{form.name || 'CEO Name'}</p>
                <p className="text-[10px] tracking-[0.18em] uppercase font-bold text-on-surface-variant truncate">
                  {form.title || 'Title'}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-on-surface-variant line-clamp-4 leading-relaxed">
              {form.bodyEn || 'Your message will appear here…'}
            </p>
          </div>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleReset} disabled={!defaults?.ceo || saving}>
          <RotateCcw className="w-4 h-4 mr-1" /> Reset to defaults
        </Button>
        <Button onClick={handleSave} loading={saving}>
          <Save className="w-4 h-4 mr-1" /> Save changes
        </Button>
      </div>
    </div>
  );
}
