'use client';

import { useEffect, useState, useCallback } from 'react';
import { useApi } from '@/hooks/use-api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal, FormField, FormInput, FormSelect, FormTextarea, ConfirmDialog } from '@/components/admin/ui';
import {
  Activity, Target, Users, FileText, Settings, Loader2, Save, Plus,
  Pencil, Trash2, Eye, Copy, BarChart3, Shield, Mail, ExternalLink,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface TrackingSettings {
  id: string;
  metaPixelId: string | null;
  metaCapiToken: string | null;
  metaCapiTestCode: string | null;
  metaCapiEnabled: boolean;
  ga4MeasurementId: string | null;
  ga4ApiSecret: string | null;
  gtmContainerId: string | null;
  googleAdsConversionId: string | null;
  googleAdsConversionLabel: string | null;
  tiktokPixelId: string | null;
  snapchatPixelId: string | null;
  xPixelId: string | null;
  whatsappNumber: string | null;
  whatsappGreeting: string | null;
  trustBadges: any[];
  customerCount: number;
  yearsInBusiness: number;
}

interface Lead {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  message: string | null;
  source: string;
  campaign: string | null;
  formSlug: string | null;
  packageSlug: string | null;
  status: string;
  travelers: number | null;
  budget: string | null;
  createdAt: string;
}

interface LandingPage {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  campaign: string | null;
  isActive: boolean;
  visits: number;
  leads: number;
  bookings: number;
  revenue: number;
  createdAt: string;
}

interface Stats {
  byEvent: { name: string; count: number }[];
  byCampaign: { campaign: string; count: number; revenue: number }[];
  bySource: { source: string; count: number }[];
}

type Tab = 'overview' | 'settings' | 'leads' | 'landing-pages';

const TABS: { key: Tab; label: string; Icon: any }[] = [
  { key: 'overview', label: 'Overview', Icon: BarChart3 },
  { key: 'leads', label: 'Leads', Icon: Users },
  { key: 'landing-pages', label: 'Landing pages', Icon: FileText },
  { key: 'settings', label: 'Settings & pixels', Icon: Settings },
];

export default function AdminTrackingPage() {
  const {
    getTrackingSettings,
    updateTrackingSettings,
    getTrackingStats,
    getLeads,
    updateLead,
    getAdminLandingPages,
    createAdminLandingPage,
    updateAdminLandingPage,
    deleteAdminLandingPage,
  } = useApi();

  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<TrackingSettings | null>(null);
  const [settingsForm, setSettingsForm] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const [stats, setStats] = useState<Stats | null>(null);
  const [statsDays, setStatsDays] = useState(30);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadFilter, setLeadFilter] = useState('');

  const [pages, setPages] = useState<LandingPage[]>([]);
  const [pageModal, setPageModal] = useState<{ open: boolean; page: LandingPage | null }>({ open: false, page: null });
  const [pageForm, setPageForm] = useState<any>(null);
  const [pageSubmitting, setPageSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [copied, setCopied] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, st, l, lp] = await Promise.all([
        getTrackingSettings(),
        getTrackingStats(statsDays),
        getLeads(leadFilter ? { status: leadFilter } : undefined),
        getAdminLandingPages(),
      ]);
      setSettings(s as TrackingSettings);
      setSettingsForm({
        metaPixelId: (s as TrackingSettings).metaPixelId ?? '',
        metaCapiToken: '', // secrets are masked — leave blank to keep current
        metaCapiTestCode: (s as TrackingSettings).metaCapiTestCode ?? '',
        metaCapiEnabled: (s as TrackingSettings).metaCapiEnabled,
        ga4MeasurementId: (s as TrackingSettings).ga4MeasurementId ?? '',
        ga4ApiSecret: '',
        gtmContainerId: (s as TrackingSettings).gtmContainerId ?? '',
        googleAdsConversionId: (s as TrackingSettings).googleAdsConversionId ?? '',
        googleAdsConversionLabel: (s as TrackingSettings).googleAdsConversionLabel ?? '',
        tiktokPixelId: (s as TrackingSettings).tiktokPixelId ?? '',
        snapchatPixelId: (s as TrackingSettings).snapchatPixelId ?? '',
        xPixelId: (s as TrackingSettings).xPixelId ?? '',
        whatsappNumber: (s as TrackingSettings).whatsappNumber ?? '',
        whatsappGreeting: (s as TrackingSettings).whatsappGreeting ?? '',
        trustBadges: JSON.stringify((s as TrackingSettings).trustBadges ?? [], null, 0),
        customerCount: (s as TrackingSettings).customerCount ?? 0,
        yearsInBusiness: (s as TrackingSettings).yearsInBusiness ?? 0,
      });
      setStats(st as Stats);
      setLeads(Array.isArray(l) ? l : []);
      setPages(Array.isArray(lp) ? lp : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load tracking data');
    } finally {
      setLoading(false);
    }
  }, [getTrackingSettings, getTrackingStats, statsDays, getLeads, leadFilter, getAdminLandingPages]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const saveSettings = async () => {
    if (!settingsForm) return;
    setSaving(true);
    try {
      const body: any = { ...settingsForm };
      // Don't send empty secrets (would wipe them)
      if (!body.metaCapiToken) delete body.metaCapiToken;
      if (!body.ga4ApiSecret) delete body.ga4ApiSecret;
      if (typeof body.trustBadges === 'string') {
        try { body.trustBadges = JSON.parse(body.trustBadges); }
        catch { body.trustBadges = []; }
      }
      await updateTrackingSettings(body);
      setSavedAt(Date.now());
      await fetchAll();
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const openPageModal = (page: LandingPage | null) => {
    setPageModal({ open: true, page });
    setPageForm(page ? {
      slug: page.slug,
      title: page.title,
      subtitle: page.subtitle ?? '',
      heroImage: (page as any).heroImage ?? '',
      ctaLabel: (page as any).ctaLabel ?? '',
      ctaHref: (page as any).ctaHref ?? '',
      formSlug: (page as any).formSlug ?? '',
      metaTitle: (page as any).metaTitle ?? '',
      metaDescription: (page as any).metaDescription ?? '',
      metaImage: (page as any).metaImage ?? '',
      campaign: page.campaign ?? '',
      utmSource: (page as any).utmSource ?? '',
      isActive: page.isActive,
      body: JSON.stringify((page as any).body ?? {}, null, 2),
    } : {
      slug: '',
      title: '',
      subtitle: '',
      heroImage: '',
      ctaLabel: 'Get a quote',
      ctaHref: '',
      formSlug: '',
      metaTitle: '',
      metaDescription: '',
      metaImage: '',
      campaign: '',
      utmSource: '',
      isActive: true,
      body: '{"bullets":[]}',
    });
  };

  const submitLandingPage = async () => {
    if (!pageForm) return;
    setPageSubmitting(true);
    try {
      let body: any = {};
      try { body = JSON.parse(pageForm.body); } catch { body = {}; }
      const payload = {
        slug: pageForm.slug,
        title: pageForm.title,
        subtitle: pageForm.subtitle,
        heroImage: pageForm.heroImage,
        ctaLabel: pageForm.ctaLabel,
        ctaHref: pageForm.ctaHref,
        formSlug: pageForm.formSlug,
        metaTitle: pageForm.metaTitle,
        metaDescription: pageForm.metaDescription,
        metaImage: pageForm.metaImage,
        campaign: pageForm.campaign,
        utmSource: pageForm.utmSource,
        isActive: pageForm.isActive,
        body,
      };
      if (pageModal.page) {
        await updateAdminLandingPage(pageModal.page.id, payload);
      } else {
        await createAdminLandingPage(payload);
      }
      setPageModal({ open: false, page: null });
      await fetchAll();
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setPageSubmitting(false);
    }
  };

  const handleDeletePage = async () => {
    if (!confirmDelete.id) return;
    try {
      await deleteAdminLandingPage(confirmDelete.id);
      setConfirmDelete({ open: false, id: null });
      await fetchAll();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const updateLeadStatus = async (id: string, status: string) => {
    try {
      await updateLead(id, { status });
      await fetchAll();
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  const copyPublicUrl = async (slug: string) => {
    const url = `${window.location.origin}/lp/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* */ }
  };

  if (loading && !settings) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Target className="w-6 h-6 text-accent" /> Tracking &amp; Ads
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Meta Pixel + CAPI, GA4, GTM, lead capture, and landing pages for ad campaigns.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-outline-variant overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              tab === t.key
                ? 'border-accent text-accent'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <t.Icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && stats && (
        <>
          <div className="grid lg:grid-cols-2 gap-4">
            <Card hover={false}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold flex items-center gap-2"><Activity className="w-4 h-4" /> Events by name</h3>
                <FormSelect
                  value={String(statsDays)}
                  onChange={(v: string) => setStatsDays(Number(v) || 30)}
                  options={[
                    { value: '7', label: 'Last 7 days' },
                    { value: '30', label: 'Last 30 days' },
                    { value: '90', label: 'Last 90 days' },
                  ]}
                />
              </div>
              {stats.byEvent.length === 0 ? (
                <p className="text-sm text-on-surface-variant">No events yet — your pixel is live, give it time.</p>
              ) : (
                <ul className="space-y-1">
                  {stats.byEvent.sort((a, b) => b.count - a.count).slice(0, 10).map((e) => (
                    <li key={e.name} className="flex items-center justify-between text-sm py-1">
                      <span className="font-mono">{e.name}</span>
                      <Badge>{e.count}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card hover={false}>
              <h3 className="font-bold mb-3">By source</h3>
              {stats.bySource.length === 0 ? (
                <p className="text-sm text-on-surface-variant">No data yet.</p>
              ) : (
                <ul className="space-y-1">
                  {stats.bySource.map((s) => (
                    <li key={s.source} className="flex items-center justify-between text-sm py-1">
                      <span className="font-mono">{s.source}</span>
                      <Badge>{s.count}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <Card hover={false}>
            <h3 className="font-bold mb-3">UTM campaign performance</h3>
            {stats.byCampaign.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                Send traffic with utm_campaign parameters to see campaigns here.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-widest text-on-surface-variant border-b border-outline-variant">
                  <tr>
                    <th className="text-left py-2 pr-4">Campaign</th>
                    <th className="text-left py-2 pr-4">Events</th>
                    <th className="text-left py-2 pr-4">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.byCampaign.map((c) => (
                    <tr key={c.campaign} className="border-b border-outline-variant/50">
                      <td className="py-2 pr-4 font-mono">{c.campaign}</td>
                      <td className="py-2 pr-4">{c.count}</td>
                      <td className="py-2 pr-4 font-bold">
                        {formatCurrency(c.revenue, 'USD')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </>
      )}

      {/* LEADS */}
      {tab === 'leads' && (
        <Card hover={false}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="font-bold">Leads</h3>
            <FormSelect
              value={leadFilter}
              onChange={(v: string) => setLeadFilter(v)}
              options={[
                { value: '', label: 'All' },
                { value: 'new', label: 'New' },
                { value: 'contacted', label: 'Contacted' },
                { value: 'qualified', label: 'Qualified' },
                { value: 'converted', label: 'Converted' },
                { value: 'lost', label: 'Lost' },
              ]}
            />
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-widest text-on-surface-variant border-b border-outline-variant">
                <tr>
                  <th className="text-left py-2 pr-4">Lead</th>
                  <th className="text-left py-2 pr-4">Source / campaign</th>
                  <th className="text-left py-2 pr-4">Package</th>
                  <th className="text-left py-2 pr-4">Status</th>
                  <th className="text-left py-2 pr-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-on-surface-variant">
                      No leads captured yet.
                    </td>
                  </tr>
                )}
                {leads.map((l) => (
                  <tr key={l.id} className="border-b border-outline-variant/50">
                    <td className="py-3 pr-4">
                      <p className="font-semibold">{l.fullName}</p>
                      <p className="text-xs text-on-surface-variant">
                        {l.phone} {l.email ? `· ${l.email}` : ''}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge>{l.source}</Badge>
                      {l.campaign && <p className="text-xs mt-1 font-mono text-on-surface-variant">{l.campaign}</p>}
                    </td>
                    <td className="py-3 pr-4">
                      {l.packageSlug ? (
                        <span className="text-xs">{l.packageSlug} {l.travelers ? `· ${l.travelers} pax` : ''}</span>
                      ) : '—'}
                    </td>
                    <td className="py-3 pr-4">
                      <FormSelect
                        value={l.status}
                        onChange={(v: string) => updateLeadStatus(l.id, v)}
                        options={[
                          { value: 'new', label: 'New' },
                          { value: 'contacted', label: 'Contacted' },
                          { value: 'qualified', label: 'Qualified' },
                          { value: 'converted', label: 'Converted' },
                          { value: 'lost', label: 'Lost' },
                        ]}
                      />
                    </td>
                    <td className="py-3 pr-4 text-on-surface-variant text-xs">
                      {new Date(l.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* LANDING PAGES */}
      {tab === 'landing-pages' && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="font-bold">Campaign landing pages</h3>
            <Button onClick={() => openPageModal(null)}>
              <Plus className="w-4 h-4 mr-2" /> New landing page
            </Button>
          </div>
          <Card hover={false}>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-widest text-on-surface-variant border-b border-outline-variant">
                  <tr>
                    <th className="text-left py-2 pr-4">Slug / title</th>
                    <th className="text-left py-2 pr-4">Campaign</th>
                    <th className="text-left py-2 pr-4">Visits / Leads</th>
                    <th className="text-left py-2 pr-4">Active</th>
                    <th className="text-right py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-on-surface-variant">
                        No landing pages yet. Create one for each ad campaign.
                      </td>
                    </tr>
                  )}
                  {pages.map((p) => (
                    <tr key={p.id} className="border-b border-outline-variant/50">
                      <td className="py-3 pr-4">
                        <p className="font-semibold">{p.title}</p>
                        <p className="text-xs font-mono text-on-surface-variant">/lp/{p.slug}</p>
                      </td>
                      <td className="py-3 pr-4">{p.campaign || '—'}</td>
                      <td className="py-3 pr-4">
                        {p.visits} visits · {p.leads} leads
                      </td>
                      <td className="py-3 pr-4">
                        {p.isActive ? <Badge>Active</Badge> : <Badge className="bg-zinc-500/10 text-zinc-500">Inactive</Badge>}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => copyPublicUrl(p.slug)}>
                            {copied ? <Eye className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                            {copied ? 'Copied' : 'Copy URL'}
                          </Button>
                          <a href={`/lp/${p.slug}`} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline">
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </a>
                          <Button size="sm" variant="outline" onClick={() => openPageModal(p)}>
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: p.id })}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* SETTINGS */}
      {tab === 'settings' && settingsForm && (
        <Card hover={false}>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                <Shield className="w-4 h-4" /> Meta (Facebook) Pixel + CAPI
              </h4>
              <FormField label="Meta Pixel ID">
                <FormInput value={settingsForm.metaPixelId} onChange={(v: string) => setSettingsForm({ ...settingsForm, metaPixelId: v })} placeholder="1234567890" />
              </FormField>
              <FormField label="Meta CAPI Access Token">
                <FormInput
                  type="password"
                  value={settingsForm.metaCapiToken}
                  onChange={(v: string) => setSettingsForm({ ...settingsForm, metaCapiToken: v })}
                  placeholder={settings?.metaCapiToken ?? 'Leave blank to keep current'}
                />
              </FormField>
              <FormField label="CAPI Test Code (optional)">
                <FormInput value={settingsForm.metaCapiTestCode} onChange={(v: string) => setSettingsForm({ ...settingsForm, metaCapiTestCode: v })} placeholder="TEST12345" />
              </FormField>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded accent-accent"
                  checked={settingsForm.metaCapiEnabled}
                  onChange={(e) => setSettingsForm({ ...settingsForm, metaCapiEnabled: e.target.checked })}
                />
                <span className="text-sm">Forward server events to Meta CAPI</span>
              </label>

              <h4 className="font-bold text-sm uppercase tracking-widest text-on-surface-variant pt-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Google Analytics 4 + GTM
              </h4>
              <FormField label="GA4 Measurement ID">
                <FormInput value={settingsForm.ga4MeasurementId} onChange={(v: string) => setSettingsForm({ ...settingsForm, ga4MeasurementId: v })} placeholder="G-XXXXXXX" />
              </FormField>
              <FormField label="GA4 API Secret (Measurement Protocol)">
                <FormInput
                  type="password"
                  value={settingsForm.ga4ApiSecret}
                  onChange={(v: string) => setSettingsForm({ ...settingsForm, ga4ApiSecret: v })}
                  placeholder={settings?.ga4ApiSecret ?? 'Leave blank to keep current'}
                />
              </FormField>
              <FormField label="Google Tag Manager Container ID">
                <FormInput value={settingsForm.gtmContainerId} onChange={(v: string) => setSettingsForm({ ...settingsForm, gtmContainerId: v })} placeholder="GTM-XXXXXXX" />
              </FormField>
              <FormField label="Google Ads Conversion ID">
                <FormInput value={settingsForm.googleAdsConversionId} onChange={(v: string) => setSettingsForm({ ...settingsForm, googleAdsConversionId: v })} placeholder="AW-123456789" />
              </FormField>
              <FormField label="Google Ads Conversion Label">
                <FormInput value={settingsForm.googleAdsConversionLabel} onChange={(v: string) => setSettingsForm({ ...settingsForm, googleAdsConversionLabel: v })} />
              </FormField>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-on-surface-variant">Other pixels</h4>
              <FormField label="TikTok Pixel ID">
                <FormInput value={settingsForm.tiktokPixelId} onChange={(v: string) => setSettingsForm({ ...settingsForm, tiktokPixelId: v })} />
              </FormField>
              <FormField label="Snapchat Pixel ID">
                <FormInput value={settingsForm.snapchatPixelId} onChange={(v: string) => setSettingsForm({ ...settingsForm, snapchatPixelId: v })} />
              </FormField>
              <FormField label="X (Twitter) Pixel ID">
                <FormInput value={settingsForm.xPixelId} onChange={(v: string) => setSettingsForm({ ...settingsForm, xPixelId: v })} />
              </FormField>

              <h4 className="font-bold text-sm uppercase tracking-widest text-on-surface-variant pt-4 flex items-center gap-2">
                <Mail className="w-4 h-4" /> WhatsApp Business
              </h4>
              <FormField label="WhatsApp Number (with country code)">
                <FormInput value={settingsForm.whatsappNumber} onChange={(v: string) => setSettingsForm({ ...settingsForm, whatsappNumber: v })} placeholder="+8801700000000" />
              </FormField>
              <FormField label="Default greeting message">
                <FormTextarea value={settingsForm.whatsappGreeting} onChange={(v: string) => setSettingsForm({ ...settingsForm, whatsappGreeting: v })} rows={3} />
              </FormField>

              <h4 className="font-bold text-sm uppercase tracking-widest text-on-surface-variant pt-4">Trust badges</h4>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Customers served">
                  <FormInput type="number" value={String(settingsForm.customerCount)} onChange={(v: string) => setSettingsForm({ ...settingsForm, customerCount: Number(v) || 0 })} />
                </FormField>
                <FormField label="Years in business">
                  <FormInput type="number" value={String(settingsForm.yearsInBusiness)} onChange={(v: string) => setSettingsForm({ ...settingsForm, yearsInBusiness: Number(v) || 0 })} />
                </FormField>
              </div>
              <FormField label="Trust badges JSON (label, icon, url)">
                <FormTextarea
                  value={settingsForm.trustBadges}
                  onChange={(v: string) => setSettingsForm({ ...settingsForm, trustBadges: v })}
                  rows={5}
                  placeholder='[{"label":"IATA Accredited","icon":"badge"},{"label":"ATOL Protected","icon":"shield"}]'
                />
              </FormField>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-outline-variant">
            {savedAt && (
              <span className="text-xs text-emerald-600 flex items-center gap-1">
                <Eye className="w-3 h-3" /> Saved
              </span>
            )}
            <Button onClick={saveSettings} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save settings
            </Button>
          </div>
        </Card>
      )}

      {/* LANDING PAGE MODAL */}
      <Modal
        open={pageModal.open}
        onClose={() => setPageModal({ open: false, page: null })}
        title={pageModal.page ? 'Edit landing page' : 'New landing page'}
      >
        {pageForm && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Slug (URL: /lp/<slug>)" required>
                <FormInput value={pageForm.slug} onChange={(v: string) => setPageForm({ ...pageForm, slug: v })} placeholder="hajj-2026-bd" />
              </FormField>
              <FormField label="Campaign tag">
                <FormInput value={pageForm.campaign} onChange={(v: string) => setPageForm({ ...pageForm, campaign: v })} placeholder="hajj-2026-fb" />
              </FormField>
            </div>
            <FormField label="Title" required>
              <FormInput value={pageForm.title} onChange={(v: string) => setPageForm({ ...pageForm, title: v })} />
            </FormField>
            <FormField label="Subtitle">
              <FormTextarea value={pageForm.subtitle} onChange={(v: string) => setPageForm({ ...pageForm, subtitle: v })} rows={2} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Hero image URL">
                <FormInput value={pageForm.heroImage} onChange={(v: string) => setPageForm({ ...pageForm, heroImage: v })} />
              </FormField>
              <FormField label="Form slug (lead capture)">
                <FormInput value={pageForm.formSlug} onChange={(v: string) => setPageForm({ ...pageForm, formSlug: v })} placeholder="hajj-2026-bd" />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="CTA label">
                <FormInput value={pageForm.ctaLabel} onChange={(v: string) => setPageForm({ ...pageForm, ctaLabel: v })} />
              </FormField>
              <FormField label="CTA href (optional)">
                <FormInput value={pageForm.ctaHref} onChange={(v: string) => setPageForm({ ...pageForm, ctaHref: v })} placeholder="/hajj" />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Meta title">
                <FormInput value={pageForm.metaTitle} onChange={(v: string) => setPageForm({ ...pageForm, metaTitle: v })} />
              </FormField>
              <FormField label="Meta image URL">
                <FormInput value={pageForm.metaImage} onChange={(v: string) => setPageForm({ ...pageForm, metaImage: v })} />
              </FormField>
            </div>
            <FormField label="Meta description">
              <FormTextarea value={pageForm.metaDescription} onChange={(v: string) => setPageForm({ ...pageForm, metaDescription: v })} rows={2} />
            </FormField>
            <FormField label="Body JSON (e.g. {bullets: [...], formTitle: '...'})">
              <FormTextarea
                value={pageForm.body}
                onChange={(v: string) => setPageForm({ ...pageForm, body: v })}
                rows={4}
                placeholder='{"bullets":["Visa included","5★ hotels"],"formTitle":"Get a free quote"}'
              />
            </FormField>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="rounded accent-accent"
                checked={pageForm.isActive}
                onChange={(e) => setPageForm({ ...pageForm, isActive: e.target.checked })}
              />
              <span className="text-sm">Active</span>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setPageModal({ open: false, page: null })}>Cancel</Button>
              <Button onClick={submitLandingPage} disabled={pageSubmitting || !pageForm.slug || !pageForm.title}>
                {pageSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {pageModal.page ? 'Save changes' : 'Create page'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={handleDeletePage}
        title="Delete landing page?"
        message="This removes the page from public access. Past visits and leads are preserved."
      />
    </div>
  );
}
