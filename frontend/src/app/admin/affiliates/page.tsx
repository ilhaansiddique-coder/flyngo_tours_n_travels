'use client';

import { useEffect, useState, useCallback } from 'react';
import { useApi } from '@/hooks/use-api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import {
  Modal, FormField, FormInput, FormSelect, FormTextarea, ConfirmDialog,
} from '@/components/admin/ui';
import {
  Gift, Users, Wallet, TrendingUp, Loader2, CheckCircle2, XCircle,
  Search, Plus, Pencil, Trash2, UserPlus, Settings, ArrowUpRight, Save,
  DollarSign, Activity, Globe,
} from 'lucide-react';

// ===========================================================================
// Types
// ===========================================================================

interface Affiliate {
  id: string;
  userId: string;
  referralCode: string;
  commissionRate: number;
  totalEarnings: number;
  isActive: boolean;
  createdAt: string;
  user?: { id: string; fullName: string; email: string | null; phone: string | null };
  referrals?: Referral[];
}

interface Referral {
  id: string;
  status: string;
  referredUserId: string;
  referrerReward: number | null;
  refereeReward: number | null;
  createdAt: string;
  registeredAt: string | null;
  convertedAt: string | null;
  referredUser: { id: string; fullName: string; email: string | null; createdAt: string } | null;
  affiliate?: { user: { fullName: string; email: string | null } };
}

interface Commission {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  rate: number | null;
  status: string;
  createdAt: string;
}

interface Payout {
  id: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  notes: string | null;
  details: any;
  createdAt: string;
  processedAt: string | null;
  affiliate: {
    id: string;
    referralCode: string;
    user: { id: string; fullName: string; email: string | null; phone: string | null };
  };
}

interface Overview {
  settings: Settings;
  stats: {
    affiliates: number;
    referrals: number;
    converted: number;
    conversionRate: number;
    totalCommissions: number;
    pendingPayouts: number;
    totalPaidOut: number;
  };
}

interface Settings {
  id: string;
  isEnabled: boolean;
  referrerRewardType: string;
  referrerRewardValue: number;
  referrerMaxReward: number | null;
  refereeRewardType: string;
  refereeRewardValue: number;
  refereeMaxReward: number | null;
  cookieWindowDays: number;
  minPayoutAmount: number;
  payoutCurrency: string;
  conversionStatuses: string[];
  heroTitle: string | null;
  heroSubtitle: string | null;
  termsText: string | null;
}

type Tab = 'overview' | 'affiliates' | 'payouts' | 'referrals' | 'settings';

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pending:    { label: 'Pending',    cls: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  registered: { label: 'Signed up',  cls: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  converted:  { label: 'Converted',  cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  cancelled:  { label: 'Cancelled',  cls: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/30' },
  paid:       { label: 'Paid',       cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  rejected:   { label: 'Rejected',   cls: 'bg-rose-500/10 text-rose-600 border-rose-500/30' },
  processing: { label: 'Processing', cls: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
};

const TABS: { key: Tab; label: string; Icon: typeof Users }[] = [
  { key: 'overview',   label: 'Overview',          Icon: Activity },
  { key: 'affiliates', label: 'Affiliates',        Icon: UserPlus },
  { key: 'referrals',  label: 'Referral activity', Icon: Globe },
  { key: 'payouts',    label: 'Payouts',           Icon: Wallet },
  { key: 'settings',   label: 'Program settings',  Icon: Settings },
];

// ===========================================================================
// Main
// ===========================================================================

export default function AdminAffiliatesPage() {
  const {
    getAffiliates,
    createAffiliate,
    updateAffiliate,
    deleteAffiliate,
    getReferralOverview,
    getReferralSettings,
    updateReferralSettings,
    getReferralAdminReferrals,
    getReferralPayouts,
    updateReferralPayout,
    getUsers,
  } = useApi();

  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Overview / settings
  const [overview, setOverview] = useState<Overview | null>(null);
  const [settingsForm, setSettingsForm] = useState<any | null>(null);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSavedAt, setSettingsSavedAt] = useState<number | null>(null);

  // Affiliates
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [search, setSearch] = useState('');
  const [affPage, setAffPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [affModalOpen, setAffModalOpen] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null);
  const [affForm, setAffForm] = useState({ userId: '', referralCode: '', commissionRate: '5', isActive: true });
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [userOptions, setUserOptions] = useState<{ label: string; value: string }[]>([]);

  // Referrals
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [refTotal, setRefTotal] = useState(0);
  const [refPage, setRefPage] = useState(1);
  const [refTotalPages, setRefTotalPages] = useState(1);

  // Payouts
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [payoutFilter, setPayoutFilter] = useState('');
  const [payoutModal, setPayoutModal] = useState<{ open: boolean; payout: Payout | null; nextStatus: string }>(
    { open: false, payout: null, nextStatus: 'paid' },
  );
  const [payoutNote, setPayoutNote] = useState('');
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);

  // ---------------------------------------------------------------------------
  // Fetchers
  // ---------------------------------------------------------------------------

  const fetchAffiliates = useCallback(async (p = 1) => {
    setError(null);
    try {
      const params: Record<string, string> = { page: String(p), limit: '20' };
      if (search) params.search = search;
      const res = (await getAffiliates(params)) as any;
      if (Array.isArray(res)) {
        setAffiliates(res);
        setTotalPages(1);
      } else {
        setAffiliates(res?.items ?? []);
        setTotalPages(res?.meta?.totalPages ?? 1);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load affiliates');
    }
  }, [getAffiliates, search]);

  const fetchOverview = useCallback(async () => {
    try {
      const ov = (await getReferralOverview()) as Overview;
      setOverview(ov);
      const settings = ov.settings;
      setSettingsForm({
        isEnabled: settings.isEnabled,
        referrerRewardType: settings.referrerRewardType,
        referrerRewardValue: settings.referrerRewardValue,
        referrerMaxReward: settings.referrerMaxReward ?? '',
        refereeRewardType: settings.refereeRewardType,
        refereeRewardValue: settings.refereeRewardValue,
        refereeMaxReward: settings.refereeMaxReward ?? '',
        cookieWindowDays: settings.cookieWindowDays,
        minPayoutAmount: settings.minPayoutAmount,
        payoutCurrency: settings.payoutCurrency,
        conversionStatuses: (settings.conversionStatuses || []).join(','),
        heroTitle: settings.heroTitle ?? '',
        heroSubtitle: settings.heroSubtitle ?? '',
        termsText: settings.termsText ?? '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load overview');
    }
  }, [getReferralOverview]);

  const fetchReferrals = useCallback(async (p = 1) => {
    try {
      const res = (await getReferralAdminReferrals({ page: String(p), limit: '30' })) as any;
      const items = Array.isArray(res) ? res : res?.items ?? [];
      setReferrals(items);
      setRefTotal(res?.meta?.total ?? items.length);
      setRefTotalPages(res?.meta?.totalPages ?? 1);
    } catch (err: any) {
      setError(err.message || 'Failed to load referrals');
    }
  }, [getReferralAdminReferrals]);

  const fetchPayouts = useCallback(async () => {
    try {
      const res = (await getReferralPayouts(payoutFilter ? { status: payoutFilter } : undefined)) as any;
      setPayouts(Array.isArray(res) ? res : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load payouts');
    }
  }, [getReferralPayouts, payoutFilter]);

  const fetchUserOptions = useCallback(async () => {
    try {
      const res = (await getUsers({ limit: '200' })) as any;
      const users = Array.isArray(res) ? res : res?.items ?? res?.data ?? [];
      setUserOptions(users.map((u: any) => ({ label: `${u.fullName} (${u.email ?? u.phone ?? ''})`, value: u.id })));
    } catch {
      // silent
    }
  }, [getUsers]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchOverview(),
      fetchAffiliates(1),
      fetchReferrals(1),
      fetchPayouts(),
    ]);
    await fetchUserOptions();
    setLoading(false);
  }, [fetchOverview, fetchAffiliates, fetchReferrals, fetchPayouts, fetchUserOptions]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ---------------------------------------------------------------------------
  // Affiliate CRUD
  // ---------------------------------------------------------------------------

  const generateCode = () => {
    const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < 8; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
    return out;
  };

  const openCreateModal = () => {
    setEditingAffiliate(null);
    setAffForm({ userId: '', referralCode: generateCode(), commissionRate: '5', isActive: true });
    setAffModalOpen(true);
  };

  const openEditModal = (a: Affiliate) => {
    setEditingAffiliate(a);
    setAffForm({
      userId: a.userId,
      referralCode: a.referralCode,
      commissionRate: String(a.commissionRate ?? 5),
      isActive: a.isActive,
    });
    setAffModalOpen(true);
  };

  const submitAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        userId: affForm.userId,
        referralCode: affForm.referralCode.toUpperCase(),
        commissionRate: Number(affForm.commissionRate),
        isActive: affForm.isActive,
      };
      if (editingAffiliate) {
        await updateAffiliate(editingAffiliate.id, body);
      } else {
        await createAffiliate(body);
      }
      setAffModalOpen(false);
      await fetchAffiliates(affPage);
      await fetchOverview();
    } catch (err: any) {
      alert(err.message || 'Failed to save affiliate');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    try {
      await deleteAffiliate(confirmDelete.id);
      setConfirmDelete({ open: false, id: null });
      await fetchAffiliates(affPage);
      await fetchOverview();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  // ---------------------------------------------------------------------------
  // Settings + Payouts
  // ---------------------------------------------------------------------------

  const saveSettings = async () => {
    if (!settingsForm) return;
    setSettingsSaving(true);
    try {
      const body: any = {
        isEnabled: !!settingsForm.isEnabled,
        referrerRewardType: settingsForm.referrerRewardType,
        referrerRewardValue: Number(settingsForm.referrerRewardValue),
        refereeRewardType: settingsForm.refereeRewardType,
        refereeRewardValue: Number(settingsForm.refereeRewardValue),
        cookieWindowDays: Number(settingsForm.cookieWindowDays),
        minPayoutAmount: Number(settingsForm.minPayoutAmount),
        payoutCurrency: settingsForm.payoutCurrency,
        conversionStatuses: String(settingsForm.conversionStatuses || '').split(',').map((s: string) => s.trim()).filter(Boolean),
        heroTitle: settingsForm.heroTitle || null,
        heroSubtitle: settingsForm.heroSubtitle || null,
        termsText: settingsForm.termsText || null,
      };
      if (settingsForm.referrerMaxReward !== '') body.referrerMaxReward = Number(settingsForm.referrerMaxReward);
      if (settingsForm.refereeMaxReward !== '') body.refereeMaxReward = Number(settingsForm.refereeMaxReward);
      await updateReferralSettings(body);
      setSettingsSavedAt(Date.now());
      await fetchOverview();
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setSettingsSaving(false);
    }
  };

  const submitPayoutAction = async () => {
    if (!payoutModal.payout) return;
    setPayoutSubmitting(true);
    try {
      await updateReferralPayout(payoutModal.payout.id, {
        status: payoutModal.nextStatus,
        notes: payoutNote || undefined,
      });
      setPayoutModal({ open: false, payout: null, nextStatus: 'paid' });
      setPayoutNote('');
      await Promise.all([fetchPayouts(), fetchOverview()]);
    } catch (err: any) {
      alert(err.message || 'Update failed');
    } finally {
      setPayoutSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (loading && !overview) {
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
          <Gift className="w-6 h-6 text-accent" /> Refer &amp; Earn
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Manage affiliates, track referral activity, process payouts, and configure the program.
        </p>
      </div>

      {/* Tabs */}
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

      {error && (
        <Card hover={false} className="border-rose-500/30 bg-rose-500/5 text-sm text-rose-600">
          {error}
        </Card>
      )}

      {/* ============================================================ */}
      {/* OVERVIEW */}
      {/* ============================================================ */}
      {tab === 'overview' && overview && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard icon={UserPlus} label="Affiliates" value={overview.stats.affiliates} />
            <KpiCard icon={Users} label="Referrals" value={overview.stats.referrals} />
            <KpiCard
              icon={TrendingUp}
              label="Converted"
              value={overview.stats.converted}
              hint={`${overview.stats.conversionRate.toFixed(1)}% rate`}
            />
            <KpiCard
              icon={DollarSign}
              label="Total commissions"
              value={formatCurrency(overview.stats.totalCommissions, overview.settings.payoutCurrency)}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card hover={false}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold">Pending payouts</h3>
                <Button variant="outline" size="sm" onClick={() => setTab('payouts')}>
                  Review <ArrowUpRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
              <p className="text-3xl font-bold">{overview.stats.pendingPayouts}</p>
              <p className="text-xs text-on-surface-variant mt-1">
                Paid out to date: {formatCurrency(overview.stats.totalPaidOut, overview.settings.payoutCurrency)}
              </p>
            </Card>
            <Card hover={false}>
              <h3 className="font-bold mb-3">Top referrers</h3>
              <TopReferrers payouts={payouts} affiliates={affiliates} settings={overview.settings} />
            </Card>
          </div>

          <Card hover={false}>
            <h3 className="font-bold mb-3">Quick actions</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <Button variant="outline" onClick={() => setTab('affiliates')}>
                <UserPlus className="w-4 h-4 mr-2" /> Add affiliate
              </Button>
              <Button variant="outline" onClick={() => setTab('payouts')}>
                <Wallet className="w-4 h-4 mr-2" /> Process payouts ({overview.stats.pendingPayouts})
              </Button>
              <Button variant="outline" onClick={() => setTab('settings')}>
                <Settings className="w-4 h-4 mr-2" /> Program settings
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* ============================================================ */}
      {/* AFFILIATES */}
      {/* ============================================================ */}
      {tab === 'affiliates' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <Input
                placeholder="Search affiliates..."
                className="pl-9 w-72"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') fetchAffiliates(1); }}
              />
            </div>
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" /> Add affiliate
            </Button>
          </div>

          <Card hover={false}>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-widest text-on-surface-variant border-b border-outline-variant">
                  <tr>
                    <th className="text-left py-3 pr-4">User</th>
                    <th className="text-left py-3 pr-4">Code</th>
                    <th className="text-left py-3 pr-4">Rate</th>
                    <th className="text-left py-3 pr-4">Earnings</th>
                    <th className="text-left py-3 pr-4">Status</th>
                    <th className="text-right py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliates.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-on-surface-variant">
                        No affiliates yet — click "Add affiliate" to create one.
                      </td>
                    </tr>
                  )}
                  {affiliates.map((a) => {
                    const badge = a.isActive ? STATUS_BADGE.converted : STATUS_BADGE.cancelled;
                    return (
                      <tr key={a.id} className="border-b border-outline-variant/50">
                        <td className="py-3 pr-4">
                          <p className="font-semibold">{a.user?.fullName ?? a.userId.slice(0, 8)}</p>
                          <p className="text-xs text-on-surface-variant">{a.user?.email ?? a.user?.phone}</p>
                        </td>
                        <td className="py-3 pr-4 font-mono font-bold tracking-wider">{a.referralCode}</td>
                        <td className="py-3 pr-4">{Number(a.commissionRate).toFixed(1)}%</td>
                        <td className="py-3 pr-4 font-bold">
                          {formatCurrency(a.totalEarnings, overview?.settings.payoutCurrency ?? 'USD')}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge className={badge.cls}>{a.isActive ? 'Active' : 'Inactive'}</Badge>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEditModal(a)}>
                              <Pencil className="w-3 h-3 mr-1" /> Edit
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => setConfirmDelete({ open: true, id: a.id })}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-end gap-2 mt-4">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    size="sm"
                    variant={p === affPage ? 'primary' : 'outline'}
                    onClick={() => { setAffPage(p); fetchAffiliates(p); }}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {/* ============================================================ */}
      {/* REFERRALS */}
      {/* ============================================================ */}
      {tab === 'referrals' && (
        <Card hover={false}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">All referral activity</h3>
            <Badge>{refTotal} total</Badge>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-widest text-on-surface-variant border-b border-outline-variant">
                <tr>
                  <th className="text-left py-2 pr-4">Referrer</th>
                  <th className="text-left py-2 pr-4">Referred user</th>
                  <th className="text-left py-2 pr-4">Status</th>
                  <th className="text-left py-2 pr-4">Reward</th>
                  <th className="text-left py-2 pr-4">When</th>
                </tr>
              </thead>
              <tbody>
                {referrals.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-on-surface-variant">
                      No referrals yet.
                    </td>
                  </tr>
                )}
                {referrals.map((r) => {
                  const badge = STATUS_BADGE[r.status] || STATUS_BADGE.pending;
                  return (
                    <tr key={r.id} className="border-b border-outline-variant/50">
                      <td className="py-3 pr-4">
                        <p className="font-semibold">{r.affiliate?.user?.fullName ?? '—'}</p>
                        <p className="text-xs text-on-surface-variant">{r.affiliate?.user?.email ?? ''}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="font-semibold">{r.referredUser?.fullName ?? r.referredUserId.slice(0, 8)}</p>
                        <p className="text-xs text-on-surface-variant">{r.referredUser?.email ?? ''}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge className={badge.cls}>{badge.label}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-xs">
                        {r.referrerReward != null && (
                          <p>+{formatCurrency(r.referrerReward, overview?.settings.payoutCurrency ?? 'USD')} referrer</p>
                        )}
                        {r.refereeReward != null && (
                          <p className="text-on-surface-variant">−{formatCurrency(r.refereeReward, overview?.settings.payoutCurrency ?? 'USD')} referee</p>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-xs text-on-surface-variant">
                        {new Date(r.createdAt).toLocaleDateString()}
                        {r.convertedAt && (
                          <p className="text-emerald-600">Converted {new Date(r.convertedAt).toLocaleDateString()}</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {refTotalPages > 1 && (
            <div className="flex justify-end gap-2 mt-4">
              {Array.from({ length: refTotalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={p === refPage ? 'primary' : 'outline'}
                  onClick={() => { setRefPage(p); fetchReferrals(p); }}
                >
                  {p}
                </Button>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ============================================================ */}
      {/* PAYOUTS */}
      {/* ============================================================ */}
      {tab === 'payouts' && (
        <Card hover={false}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="font-bold">Payout requests</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-on-surface-variant">Filter:</span>
              <FormSelect
                value={payoutFilter}
                onChange={(v: string) => { setPayoutFilter(v); fetchPayouts(); }}
                options={[
                  { value: '', label: 'All' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'processing', label: 'Processing' },
                  { value: 'paid', label: 'Paid' },
                  { value: 'rejected', label: 'Rejected' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
              />
            </div>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-widest text-on-surface-variant border-b border-outline-variant">
                <tr>
                  <th className="text-left py-2 pr-4">Affiliate</th>
                  <th className="text-left py-2 pr-4">Amount</th>
                  <th className="text-left py-2 pr-4">Method</th>
                  <th className="text-left py-2 pr-4">Requested</th>
                  <th className="text-left py-2 pr-4">Status</th>
                  <th className="text-right py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {payouts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-on-surface-variant">
                      No payouts match this filter.
                    </td>
                  </tr>
                )}
                {payouts.map((p) => {
                  const badge = STATUS_BADGE[p.status] || STATUS_BADGE.pending;
                  return (
                    <tr key={p.id} className="border-b border-outline-variant/50">
                      <td className="py-3 pr-4">
                        <p className="font-semibold">{p.affiliate.user.fullName}</p>
                        <p className="text-xs text-on-surface-variant">
                          {p.affiliate.user.email ?? p.affiliate.user.phone} · code {p.affiliate.referralCode}
                        </p>
                      </td>
                      <td className="py-3 pr-4 font-bold">
                        {formatCurrency(p.amount, p.currency)}
                      </td>
                      <td className="py-3 pr-4 capitalize">{p.method.replace('_', ' ')}</td>
                      <td className="py-3 pr-4 text-on-surface-variant">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge className={badge.cls}>{badge.label}</Badge>
                      </td>
                      <td className="py-3 text-right">
                        {['pending', 'processing'].includes(p.status) ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => setPayoutModal({ open: true, payout: p, nextStatus: 'paid' })}
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Mark paid
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setPayoutModal({ open: true, payout: p, nextStatus: 'rejected' })}
                            >
                              <XCircle className="w-3 h-3 mr-1" /> Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-on-surface-variant">
                            {p.processedAt ? new Date(p.processedAt).toLocaleDateString() : '—'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ============================================================ */}
      {/* SETTINGS */}
      {/* ============================================================ */}
      {tab === 'settings' && settingsForm && (
        <Card hover={false}>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container/60 border border-outline-variant">
                <div>
                  <p className="font-semibold">Program enabled</p>
                  <p className="text-xs text-on-surface-variant">Turn the entire Refer &amp; Earn program on or off</p>
                </div>
                <input
                  type="checkbox"
                  className="rounded accent-accent w-5 h-5"
                  checked={settingsForm.isEnabled}
                  onChange={(e) => setSettingsForm({ ...settingsForm, isEnabled: e.target.checked })}
                />
              </label>

              <FormField label="Payout currency">
                <FormSelect
                  value={settingsForm.payoutCurrency}
                  onChange={(v: string) => setSettingsForm({ ...settingsForm, payoutCurrency: v })}
                  options={[
                    { value: 'USD', label: 'USD' },
                    { value: 'BDT', label: 'BDT' },
                    { value: 'EUR', label: 'EUR' },
                    { value: 'GBP', label: 'GBP' },
                    { value: 'SAR', label: 'SAR' },
                    { value: 'AED', label: 'AED' },
                  ]}
                />
              </FormField>

              <FormField label="Minimum payout amount">
                <FormInput
                  type="number"
                  value={String(settingsForm.minPayoutAmount)}
                  onChange={(v: string) => setSettingsForm({ ...settingsForm, minPayoutAmount: v })}
                />
              </FormField>

              <FormField label="Cookie window (days)">
                <FormInput
                  type="number"
                  value={String(settingsForm.cookieWindowDays)}
                  onChange={(v: string) => setSettingsForm({ ...settingsForm, cookieWindowDays: v })}
                />
                <p className="text-xs text-on-surface-variant mt-1">
                  How long after a click the referral attribution stays valid.
                </p>
              </FormField>

              <FormField label="Conversion statuses (comma-separated)">
                <FormInput
                  value={settingsForm.conversionStatuses}
                  onChange={(v: string) => setSettingsForm({ ...settingsForm, conversionStatuses: v })}
                  placeholder="confirmed, in_progress, completed"
                />
              </FormField>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-on-surface-variant">Referrer reward</h4>
              <FormField label="Type">
                <FormSelect
                  value={settingsForm.referrerRewardType}
                  onChange={(v: string) => setSettingsForm({ ...settingsForm, referrerRewardType: v })}
                  options={[
                    { value: 'percentage', label: 'Percentage of booking' },
                    { value: 'fixed', label: 'Fixed amount' },
                  ]}
                />
              </FormField>
              <FormField label="Value">
                <FormInput
                  type="number"
                  value={String(settingsForm.referrerRewardValue)}
                  onChange={(v: string) => setSettingsForm({ ...settingsForm, referrerRewardValue: v })}
                />
              </FormField>
              <FormField label="Max reward cap (optional)">
                <FormInput
                  type="number"
                  value={String(settingsForm.referrerMaxReward)}
                  onChange={(v: string) => setSettingsForm({ ...settingsForm, referrerMaxReward: v })}
                />
              </FormField>

              <h4 className="font-bold text-sm uppercase tracking-widest text-on-surface-variant pt-4">Referee reward</h4>
              <FormField label="Type">
                <FormSelect
                  value={settingsForm.refereeRewardType}
                  onChange={(v: string) => setSettingsForm({ ...settingsForm, refereeRewardType: v })}
                  options={[
                    { value: 'percentage', label: 'Percentage off first booking' },
                    { value: 'fixed', label: 'Fixed discount' },
                  ]}
                />
              </FormField>
              <FormField label="Value">
                <FormInput
                  type="number"
                  value={String(settingsForm.refereeRewardValue)}
                  onChange={(v: string) => setSettingsForm({ ...settingsForm, refereeRewardValue: v })}
                />
              </FormField>
              <FormField label="Max discount cap (optional)">
                <FormInput
                  type="number"
                  value={String(settingsForm.refereeMaxReward)}
                  onChange={(v: string) => setSettingsForm({ ...settingsForm, refereeMaxReward: v })}
                />
              </FormField>
            </div>
          </div>

          <div className="border-t border-outline-variant mt-6 pt-6 space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-widest text-on-surface-variant">Landing-page copy</h4>
            <FormField label="Hero title">
              <FormInput
                value={settingsForm.heroTitle}
                onChange={(v: string) => setSettingsForm({ ...settingsForm, heroTitle: v })}
              />
            </FormField>
            <FormField label="Hero subtitle">
              <FormTextarea
                value={settingsForm.heroSubtitle}
                onChange={(v: string) => setSettingsForm({ ...settingsForm, heroSubtitle: v })}
                rows={3}
              />
            </FormField>
            <FormField label="Terms text">
              <FormTextarea
                value={settingsForm.termsText}
                onChange={(v: string) => setSettingsForm({ ...settingsForm, termsText: v })}
                rows={5}
              />
            </FormField>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-outline-variant">
            {settingsSavedAt && (
              <span className="text-xs text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Saved
              </span>
            )}
            <Button onClick={saveSettings} disabled={settingsSaving}>
              {settingsSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save settings
            </Button>
          </div>
        </Card>
      )}

      {/* ============================================================ */}
      {/* MODALS */}
      {/* ============================================================ */}

      {/* Affiliate create/edit modal */}
      <Modal
        open={affModalOpen}
        onClose={() => setAffModalOpen(false)}
        title={editingAffiliate ? 'Edit affiliate' : 'Add affiliate'}
      >
        <form onSubmit={submitAffiliate} className="space-y-4">
          <FormField label="User" required>
            <FormSelect
              value={affForm.userId}
              onChange={(v: string) => setAffForm({ ...affForm, userId: v })}
              options={[{ value: '', label: 'Select user...' }, ...userOptions]}
            />
          </FormField>
          <FormField label="Referral code">
            <FormInput
              value={affForm.referralCode}
              onChange={(v: string) => setAffForm({ ...affForm, referralCode: v })}
            />
          </FormField>
          <FormField label="Commission rate (%)">
            <FormInput
              type="number"
              value={affForm.commissionRate}
              onChange={(v: string) => setAffForm({ ...affForm, commissionRate: v })}
            />
          </FormField>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="rounded accent-accent"
              checked={affForm.isActive}
              onChange={(e) => setAffForm({ ...affForm, isActive: e.target.checked })}
            />
            <span className="text-sm">Active</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setAffModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting || !affForm.userId}>
              {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editingAffiliate ? 'Save changes' : 'Create affiliate'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete affiliate?"
        message="This will remove the affiliate and all their commission history. Pending payouts will be cancelled. This action cannot be undone."
      />

      {/* Payout action modal */}
      <Modal
        open={payoutModal.open}
        onClose={() => setPayoutModal({ open: false, payout: null, nextStatus: 'paid' })}
        title={payoutModal.nextStatus === 'paid' ? 'Mark payout as paid' : 'Reject payout'}
      >
        <div className="space-y-4">
          {payoutModal.payout && (
            <div className="p-3 rounded-xl bg-surface-container border border-outline-variant text-sm">
              <p className="font-semibold">{payoutModal.payout.affiliate.user.fullName}</p>
              <p className="text-on-surface-variant">
                {formatCurrency(payoutModal.payout.amount, payoutModal.payout.currency)} via{' '}
                {payoutModal.payout.method.replace('_', ' ')}
              </p>
              {payoutModal.payout.details && Object.keys(payoutModal.payout.details).length > 0 && (
                <pre className="mt-2 text-xs bg-surface-container-high p-2 rounded overflow-auto">
                  {JSON.stringify(payoutModal.payout.details, null, 2)}
                </pre>
              )}
            </div>
          )}
          <FormField label="Note (visible in ledger / audit)">
            <FormTextarea
              value={payoutNote}
              onChange={(v: string) => setPayoutNote(v)}
              rows={3}
              placeholder={
                payoutModal.nextStatus === 'paid'
                  ? 'e.g. bKash trx ID 8JK3...'
                  : 'e.g. Affiliate account suspended'
              }
            />
          </FormField>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPayoutModal({ open: false, payout: null, nextStatus: 'paid' })}>
              Cancel
            </Button>
            <Button
              onClick={submitPayoutAction}
              disabled={payoutSubmitting}
              variant={payoutModal.nextStatus === 'rejected' ? 'danger' : 'primary'}
            >
              {payoutSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {payoutModal.nextStatus === 'paid' ? 'Confirm paid' : 'Reject payout'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ===========================================================================
// Sub-components
// ===========================================================================

function KpiCard({ icon: Icon, label, value, hint }: { icon: any; label: string; value: any; hint?: string }) {
  return (
    <Card hover={false}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {hint && <p className="text-xs text-on-surface-variant mt-1">{hint}</p>}
        </div>
        <Icon className="w-5 h-5 text-accent" />
      </div>
    </Card>
  );
}

function TopReferrers({ payouts, affiliates, settings }: { payouts: Payout[]; affiliates: Affiliate[]; settings: Settings }) {
  const top = [...affiliates]
    .sort((a, b) => Number(b.totalEarnings) - Number(a.totalEarnings))
    .slice(0, 5);

  if (top.length === 0) {
    return <p className="text-sm text-on-surface-variant">No affiliates yet.</p>;
  }

  return (
    <ol className="space-y-2">
      {top.map((a, i) => (
        <li key={a.id} className="flex items-center justify-between p-2 rounded-xl bg-surface-container/60 border border-outline-variant">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-accent/15 text-accent text-xs font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-semibold">{a.user?.fullName ?? a.userId.slice(0, 8)}</p>
              <p className="text-xs text-on-surface-variant font-mono">{a.referralCode}</p>
            </div>
          </div>
          <p className="text-sm font-bold">{formatCurrency(Number(a.totalEarnings), settings.payoutCurrency)}</p>
        </li>
      ))}
    </ol>
  );
}
