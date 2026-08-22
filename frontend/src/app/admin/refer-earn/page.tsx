'use client';

import { useEffect, useState } from 'react';
import {
  Gift, Save, RotateCcw, Eye, EyeOff, Copy, Check, Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApi } from '@/hooks/use-api';
import { Card } from '@/components/ui/card';
import {
  Modal, FormField, FormInput, FormTextarea, ConfirmDialog,
} from '@/components/admin/ui';
import { ImageUploader } from '@/components/admin/image-uploader';
import { adminButtonStyle, adminButtonSmStyle, adminButtonOutlineStyle } from '@/components/admin/button-styles';
import { cn } from '@/lib/utils';

interface ReferEarnState {
  badgeTextEn: string;
  badgeTextBn: string;
  titleEn: string;
  titleBn: string;
  bodyEn: string;
  bodyBn: string;
  rewardAmountEn: string;
  rewardAmountBn: string;
  rewardLabelEn: string;
  rewardLabelBn: string;
  currencyCode: string;
  ctaTextEn: string;
  ctaTextBn: string;
  ctaHref: string;
  imageUrl: string;
  iconName: string;
  isActive: boolean;
  delaySeconds: number;
  dismissDays: number;
  showOnPaths: string;
}

const empty: ReferEarnState = {
  badgeTextEn: '',
  badgeTextBn: '',
  titleEn: '',
  titleBn: '',
  bodyEn: '',
  bodyBn: '',
  rewardAmountEn: '',
  rewardAmountBn: '',
  rewardLabelEn: '',
  rewardLabelBn: '',
  currencyCode: 'BDT',
  ctaTextEn: '',
  ctaTextBn: '',
  ctaHref: '',
  imageUrl: '',
  iconName: 'Gift',
  isActive: true,
  delaySeconds: 8,
  dismissDays: 7,
  showOnPaths: '/',
};

function boolInt(v: any, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

export default function AdminReferEarnPage() {
  const {
    getReferEarnAdmin,
    getReferEarnDefaults,
    saveReferEarn,
    deleteReferEarn,
    uploadMedia,
  } = useApi();

  const [data, setData] = useState<ReferEarnState>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = (await getReferEarnAdmin()) as any;
      if (res) {
        setData({
          badgeTextEn: res.badgeTextEn ?? '',
          badgeTextBn: res.badgeTextBn ?? '',
          titleEn: res.titleEn ?? '',
          titleBn: res.titleBn ?? '',
          bodyEn: res.bodyEn ?? '',
          bodyBn: res.bodyBn ?? '',
          rewardAmountEn: res.rewardAmountEn ?? '',
          rewardAmountBn: res.rewardAmountBn ?? '',
          rewardLabelEn: res.rewardLabelEn ?? '',
          rewardLabelBn: res.rewardLabelBn ?? '',
          currencyCode: res.currencyCode ?? 'BDT',
          ctaTextEn: res.ctaTextEn ?? '',
          ctaTextBn: res.ctaTextBn ?? '',
          ctaHref: res.ctaHref ?? '',
          imageUrl: res.imageUrl ?? '',
          iconName: res.iconName ?? 'Gift',
          isActive: res.isActive !== false,
          delaySeconds: boolInt(res.delaySeconds, 8),
          dismissDays: boolInt(res.dismissDays, 7),
          showOnPaths: res.showOnPaths ?? '/',
        });
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load popover');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = <K extends keyof ReferEarnState>(key: K, value: ReferEarnState[K]) => {
    setData((d) => ({ ...d, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveReferEarn({
        ...data,
        delaySeconds: boolInt(data.delaySeconds, 8),
        dismissDays: boolInt(data.dismissDays, 7),
      });
      toast.success('Refer & Earn popover saved');
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    setSaving(true);
    try {
      await deleteReferEarn();
      toast.success('Reset to defaults');
      setResetOpen(false);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Reset failed');
    } finally {
      setSaving(false);
    }
  };

  const loadServerDefaults = async () => {
    try {
      const d = (await getReferEarnDefaults()) as any;
      setData({
        badgeTextEn: d.badgeTextEn ?? '',
        badgeTextBn: d.badgeTextBn ?? '',
        titleEn: d.titleEn ?? '',
        titleBn: d.titleBn ?? '',
        bodyEn: d.bodyEn ?? '',
        bodyBn: d.bodyBn ?? '',
        rewardAmountEn: d.rewardAmountEn ?? '',
        rewardAmountBn: d.rewardAmountBn ?? '',
        rewardLabelEn: d.rewardLabelEn ?? '',
        rewardLabelBn: d.rewardLabelBn ?? '',
        currencyCode: d.currencyCode ?? 'BDT',
        ctaTextEn: d.ctaTextEn ?? '',
        ctaTextBn: d.ctaTextBn ?? '',
        ctaHref: d.ctaHref ?? '',
        imageUrl: d.imageUrl ?? '',
        iconName: d.iconName ?? 'Gift',
        isActive: d.isActive !== false,
        delaySeconds: boolInt(d.delaySeconds, 8),
        dismissDays: boolInt(d.dismissDays, 7),
        showOnPaths: d.showOnPaths ?? '/',
      });
      toast.success('Default values loaded — review and Save');
    } catch (err: any) {
      toast.error(err.message || 'Could not load defaults');
    }
  };

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      toast.success('JSON copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading Refer & Earn…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold dark:text-white flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-500" /> Refer & Earn Popover
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Edit the floating &ldquo;Refer & Earn&rdquo; popover shown to customers. Changes go live as soon as you save.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            style={adminButtonOutlineStyle}
          >
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button
            type="button"
            onClick={loadServerDefaults}
            style={adminButtonOutlineStyle}
          >
            <Sparkles className="w-4 h-4" /> Load defaults
          </button>
          <button
            type="button"
            onClick={() => setResetOpen(true)}
            style={adminButtonOutlineStyle}
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={adminButtonStyle}
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card hover={false}>
            <h3 className="font-semibold mb-4">Content (bilingual)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Badge text (EN)">
                <FormInput value={data.badgeTextEn} onChange={(v) => setField('badgeTextEn', v)} placeholder="Refer & Earn" />
              </FormField>
              <FormField label="Badge text (BN)">
                <FormInput value={data.badgeTextBn} onChange={(v) => setField('badgeTextBn', v)} placeholder="রেফার ও আয়" />
              </FormField>
              <FormField label="Title (EN)">
                <FormInput value={data.titleEn} onChange={(v) => setField('titleEn', v)} placeholder="Give ৳500, Get ৳500" />
              </FormField>
              <FormField label="Title (BN)">
                <FormInput value={data.titleBn} onChange={(v) => setField('titleBn', v)} placeholder="দিন ৳৫০০, নিন ৳৫০০" />
              </FormField>
              <FormField label="Body (EN)">
                <FormTextarea
                  value={data.bodyEn}
                  onChange={(v) => setField('bodyEn', v)}
                  rows={3}
                  placeholder="Share your unique referral link…"
                />
              </FormField>
              <FormField label="Body (BN)">
                <FormTextarea
                  value={data.bodyBn}
                  onChange={(v) => setField('bodyBn', v)}
                  rows={3}
                  placeholder="আপনার রেফারেল লিঙ্ক শেয়ার করুন…"
                />
              </FormField>
            </div>
          </Card>

          <Card hover={false}>
            <h3 className="font-semibold mb-4">Reward amount (shown inside popover)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Reward amount (EN)">
                <FormInput value={data.rewardAmountEn} onChange={(v) => setField('rewardAmountEn', v)} placeholder="৳500" />
              </FormField>
              <FormField label="Reward amount (BN)">
                <FormInput value={data.rewardAmountBn} onChange={(v) => setField('rewardAmountBn', v)} placeholder="৳৫০০" />
              </FormField>
              <FormField label="Reward label (EN)">
                <FormInput value={data.rewardLabelEn} onChange={(v) => setField('rewardLabelEn', v)} placeholder="per friend" />
              </FormField>
              <FormField label="Reward label (BN)">
                <FormInput value={data.rewardLabelBn} onChange={(v) => setField('rewardLabelBn', v)} placeholder="প্রতি বন্ধু" />
              </FormField>
              <FormField label="Currency code">
                <FormInput value={data.currencyCode} onChange={(v) => setField('currencyCode', v.toUpperCase())} placeholder="BDT" />
              </FormField>
            </div>
          </Card>

          <Card hover={false}>
            <h3 className="font-semibold mb-4">Call to action</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="CTA text (EN)">
                <FormInput value={data.ctaTextEn} onChange={(v) => setField('ctaTextEn', v)} placeholder="Get my referral link" />
              </FormField>
              <FormField label="CTA text (BN)">
                <FormInput value={data.ctaTextBn} onChange={(v) => setField('ctaTextBn', v)} placeholder="আমার রেফারেল লিঙ্ক নিন" />
              </FormField>
              <FormField label="CTA link (href)">
                <FormInput value={data.ctaHref} onChange={(v) => setField('ctaHref', v)} placeholder="/dashboard" />
              </FormField>
            </div>
          </Card>

          <Card hover={false}>
            <h3 className="font-semibold mb-4">Image</h3>
            <ImageUploader
              value={data.imageUrl}
              onChange={(url) => setField('imageUrl', url)}
              onUpload={async (file) => {
                const res = await uploadMedia(file, { folder: 'refer-earn' });
                return { url: (res as any).url };
              }}
              placeholder="Upload a popover illustration (optional)"
            />
          </Card>
        </div>

        <div className="space-y-4">
          <Card hover={false}>
            <h3 className="font-semibold mb-4">Behaviour</h3>

            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-gray-500">Show this popover to customers</p>
              </div>
              <button
                type="button"
                onClick={() => setField('isActive', !data.isActive)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition',
                  data.isActive ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-700',
                )}
                aria-pressed={data.isActive}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition',
                    data.isActive ? 'translate-x-6' : 'translate-x-1',
                  )}
                />
              </button>
            </div>

            <FormField label="Delay (seconds before showing)">
              <FormInput
                type="number"
                value={String(data.delaySeconds)}
                onChange={(v) => setField('delaySeconds', boolInt(v, 8))}
                placeholder="8"
              />
            </FormField>

            <FormField label="Dismiss memory (days)">
              <FormInput
                type="number"
                value={String(data.dismissDays)}
                onChange={(v) => setField('dismissDays', boolInt(v, 7))}
                placeholder="7"
              />
              <p className="text-xs text-gray-500 mt-1">After dismissing, hide for this many days.</p>
            </FormField>

            <FormField label="Show on path (regex)">
              <FormInput
                value={data.showOnPaths}
                onChange={(v) => setField('showOnPaths', v)}
                placeholder="/"
              />
              <p className="text-xs text-gray-500 mt-1">Regex matched against the current path. e.g. <code>/^\\/(?!admin|auth)/</code></p>
            </FormField>

            <FormField label="Icon name (lucide)">
              <FormInput
                value={data.iconName}
                onChange={(v) => setField('iconName', v)}
                placeholder="Gift"
              />
              <p className="text-xs text-gray-500 mt-1">Used if no image is uploaded. e.g. Gift, Sparkles, Award</p>
            </FormField>
          </Card>

          <Card hover={false}>
            <h3 className="font-semibold mb-3 flex items-center justify-between">
              <span>Live JSON</span>
              <button
                type="button"
                onClick={copyJson}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-outline-variant hover:bg-surface-container-high"
              >
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </h3>
            <pre className="text-[11px] leading-relaxed bg-surface-container rounded-lg p-3 max-h-72 overflow-auto border border-outline-variant">
{JSON.stringify(data, null, 2)}
            </pre>
          </Card>
        </div>
      </div>

      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Popover preview">
        <PopoverPreview data={data} />
        <div className="flex justify-end pt-4 border-t border-outline-variant mt-2">
          <button type="button" onClick={() => setPreviewOpen(false)} style={adminButtonOutlineStyle}>
            Close
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={handleResetDefaults}
        title="Reset to defaults"
        message="This deletes the current Refer & Earn popover config. The system will fall back to the built-in defaults on next load. Continue?"
      />
    </div>
  );
}

function PopoverPreview({ data }: { data: ReferEarnState }) {
  const title = data.titleEn || 'Refer & Earn';
  const body = data.bodyEn || 'Share your link. Earn rewards.';
  const amount = data.rewardAmountEn || '৳0';
  const label = data.rewardLabelEn || 'reward';
  const cta = data.ctaTextEn || 'Get my link';

  return (
    <div className="rounded-2xl border border-outline-variant p-4 bg-gradient-to-br from-amber-500/10 to-brand-600/10">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Gift className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-amber-600 font-semibold">
            {data.badgeTextEn || 'Refer & Earn'}
          </p>
          <p className="text-base font-bold dark:text-white">{title}</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{body}</p>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-bold text-amber-500">{amount}</span>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          style={adminButtonStyle}
          className="flex-1"
        >
          {cta}
        </button>
        <button
          type="button"
          style={adminButtonOutlineStyle}
        >
          <EyeOff className="w-4 h-4" />
          <span>Later</span>
        </button>
      </div>
    </div>
  );
}
