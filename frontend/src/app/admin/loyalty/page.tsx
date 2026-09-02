'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/use-api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TierBadge from '@/components/ui/tier-badge';
import {
  Modal, FormField, FormInput, FormSelect, ConfirmDialog,
} from '@/components/admin/ui';
import {
  Trophy, Wallet, Users, TrendingUp, Loader2, Plus, Pencil, Trash2,
  Save, Sparkles, Crown, Settings, Activity, Gift,
} from 'lucide-react';

interface Tier {
  id: string; name: string; slug: string; color: string;
  starCount: number; minPoints: number; redemptionMultiplier: number;
  benefits?: any; sortOrder: number; isActive: boolean;
}
interface Stats {
  totalAccounts: number;
  totalLifetimePoints: number;
  totalRedeemedPoints: number;
  totalRedeemedBdt: number;
  totalTransactions: number;
  tiers: Tier[];
}
interface Member {
  id: string; userId: string;
  lifetimePoints: number; availablePoints: number; redeemedPoints: number;
  currentTierId: string | null; tierAchievedAt: string | null;
  user: { id: string; fullName: string; email: string | null; phone: string | null; referralCode: string | null };
  currentTier: Tier | null;
}
interface Transaction {
  id: string; type: string; points: number;
  bdtValue: number | null; description: string | null; createdAt: string;
  account: { user: { id: string; fullName: string; email: string | null; phone: string | null } };
}

type Tab = 'overview' | 'tiers' | 'rules' | 'members' | 'transactions' | 'refer';

const TYPE_LABEL: Record<string, { label: string; cls: string }> = {
  referral_signup:        { label: 'Referral',        cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  booking_confirmation:   { label: 'Confirmed',       cls: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  booking_completion:     { label: 'Completed',       cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  redemption:             { label: 'Redemption',      cls: 'bg-rose-500/10 text-rose-600 border-rose-500/30' },
  admin_adjustment:       { label: 'Adjustment',      cls: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  refund:                 { label: 'Refund',          cls: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/30' },
};

const TABS: { key: Tab; label: string; Icon: any }[] = [
  { key: 'overview',     label: 'Overview',         Icon: Activity },
  { key: 'tiers',        label: 'Tiers',            Icon: Crown },
  { key: 'rules',        label: 'Product rules',    Icon: Settings },
  { key: 'members',      label: 'Members',          Icon: Users },
  { key: 'transactions', label: 'Transactions',     Icon: TrendingUp },
  { key: 'refer',        label: 'Refer & Earn',     Icon: Gift },
];

export default function AdminLoyaltyPage() {
  const router = useRouter();
  const {
    getLoyaltyStats, getLoyaltyTiers, upsertLoyaltyTier, updateLoyaltyTier, deleteLoyaltyTier,
    getLoyaltyProductRules, upsertLoyaltyProductRule, deleteLoyaltyProductRule,
    getLoyaltyMembers, getLoyaltyTransactions, adjustLoyaltyPoints,
  } = useApi();

  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<Stats | null>(null);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberPage, setMemberPage] = useState(1);
  const [memberTotalPages, setMemberTotalPages] = useState(1);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txFilter, setTxFilter] = useState('');
  const [txPage, setTxPage] = useState(1);
  const [txTotalPages, setTxTotalPages] = useState(1);

  // Tier modal
  const [tierModal, setTierModal] = useState<{ open: boolean; tier: Tier | null }>({ open: false, tier: null });
  const [tierForm, setTierForm] = useState({ name: '', slug: '', color: '#C0C0C0', starCount: 1, minPoints: 0, redemptionMultiplier: 1.0, benefitsJson: '{\n  "description": "",\n  "perks": []\n}', sortOrder: 0, isActive: true });
  const [confirmDeleteTier, setConfirmDeleteTier] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  // Product rule modal
  const [ruleModal, setRuleModal] = useState<{ open: boolean; rule: any | null }>({ open: false, rule: null });
  const [ruleForm, setRuleForm] = useState({ productType: 'tour', productId: '', productName: '', pointsValue: 100, maxPoints: '', minSpend: '', isActive: true });
  const [confirmDeleteRule, setConfirmDeleteRule] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  // Adjust points modal
  const [adjustModal, setAdjustModal] = useState<{ open: boolean; member: Member | null }>({ open: false, member: null });
  const [adjustForm, setAdjustForm] = useState({ points: '', reason: '' });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, tiersData, rulesData] = await Promise.all([
        getLoyaltyStats() as Promise<Stats>,
        getLoyaltyTiers() as Promise<Tier[]>,
        getLoyaltyProductRules() as Promise<any[]>,
      ]);
      setStats(statsData);
      setTiers(Array.isArray(tiersData) ? tiersData : []);
      setRules(Array.isArray(rulesData) ? rulesData : []);
    } catch (err: any) {
      console.error('Loyalty load failed', err);
    } finally {
      setLoading(false);
    }
  }, [getLoyaltyStats, getLoyaltyTiers, getLoyaltyProductRules]);

  const fetchMembers = useCallback(async (p = 1, search = '') => {
    try {
      const params: Record<string, string> = { page: String(p), limit: '20' };
      if (search) params.search = search;
      const res = (await getLoyaltyMembers(params)) as any;
      const items = Array.isArray(res) ? res : res?.items ?? [];
      setMembers(items);
      setMemberTotalPages(res?.meta?.totalPages ?? 1);
    } catch {}
  }, [getLoyaltyMembers]);

  const fetchTransactions = useCallback(async (p = 1, type = '') => {
    try {
      const params: Record<string, string> = { page: String(p), limit: '30' };
      if (type) params.type = type;
      const res = (await getLoyaltyTransactions(params)) as any;
      const items = Array.isArray(res) ? res : res?.items ?? [];
      setTransactions(items);
      setTxTotalPages(res?.meta?.totalPages ?? 1);
    } catch {}
  }, [getLoyaltyTransactions]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { fetchMembers(memberPage, memberSearch); }, [memberPage, memberSearch, fetchMembers]);
  useEffect(() => { fetchTransactions(txPage, txFilter); }, [txPage, txFilter, fetchTransactions]);

  // ---- Tier CRUD ----
  const openCreateTier = () => {
    setTierForm({ name: '', slug: '', color: '#C0C0C0', starCount: 1, minPoints: 0, redemptionMultiplier: 1.0, benefitsJson: '{\n  "description": "",\n  "perks": []\n}', sortOrder: tiers.length + 1, isActive: true });
    setTierModal({ open: true, tier: null });
  };
  const openEditTier = (t: Tier) => {
    setTierForm({
      name: t.name, slug: t.slug, color: t.color,
      starCount: t.starCount, minPoints: t.minPoints,
      redemptionMultiplier: Number(t.redemptionMultiplier),
      benefitsJson: JSON.stringify(t.benefits ?? { description: '', perks: [] }, null, 2),
      sortOrder: t.sortOrder, isActive: t.isActive,
    });
    setTierModal({ open: true, tier: t });
  };
  const submitTier = async () => {
    try {
      const benefits = JSON.parse(tierForm.benefitsJson);
      if (!benefits || typeof benefits !== 'object' || Array.isArray(benefits)) {
        throw new Error('Benefits must be a JSON object');
      }
      const body = {
        ...tierForm,
        benefits,
        redemptionMultiplier: Number(tierForm.redemptionMultiplier),
        starCount: Number(tierForm.starCount),
        minPoints: Number(tierForm.minPoints),
        sortOrder: Number(tierForm.sortOrder),
      };
      delete (body as { benefitsJson?: string }).benefitsJson;
      if (tierModal.tier) {
        await updateLoyaltyTier(tierModal.tier.id, body);
      } else {
        await upsertLoyaltyTier(body);
      }
      setTierModal({ open: false, tier: null });
      await fetchAll();
    } catch (err: any) {
      alert(err.message || 'Save failed');
    }
  };
  const handleDeleteTier = async () => {
    if (!confirmDeleteTier.id) return;
    try {
      await deleteLoyaltyTier(confirmDeleteTier.id);
      setConfirmDeleteTier({ open: false, id: null });
      await fetchAll();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  // ---- Product rule CRUD ----
  const openCreateRule = () => {
    setRuleForm({ productType: 'tour', productId: '', productName: '', pointsValue: 100, maxPoints: '', minSpend: '', isActive: true });
    setRuleModal({ open: true, rule: null });
  };
  const openEditRule = (r: any) => {
    setRuleForm({
      productType: r.productType,
      productId: r.productId ?? '',
      productName: r.productName ?? '',
      pointsValue: r.pointsValue,
      maxPoints: r.maxPoints ?? '',
      minSpend: r.minSpend ?? '',
      isActive: r.isActive,
    });
    setRuleModal({ open: true, rule: r });
  };
  const submitRule = async () => {
    try {
      const body: any = {
        productType: ruleForm.productType,
        productId: ruleForm.productId || undefined,
        productName: ruleForm.productName || undefined,
        pointsValue: Number(ruleForm.pointsValue),
        isActive: ruleForm.isActive,
      };
      if (ruleForm.maxPoints !== '') body.maxPoints = Number(ruleForm.maxPoints);
      if (ruleForm.minSpend !== '') body.minSpend = Number(ruleForm.minSpend);
      if (ruleModal.rule) {
        await deleteLoyaltyProductRule(ruleModal.rule.id); // fallback - use upsert with id workaround
        await upsertLoyaltyProductRule(body);
      } else {
        await upsertLoyaltyProductRule(body);
      }
      setRuleModal({ open: false, rule: null });
      await fetchAll();
    } catch (err: any) {
      alert(err.message || 'Save failed');
    }
  };

  // ---- Adjust points ----
  const submitAdjust = async () => {
    if (!adjustModal.member || !adjustForm.points || !adjustForm.reason) return;
    try {
      await adjustLoyaltyPoints(adjustModal.member.userId, {
        points: Number(adjustForm.points),
        reason: adjustForm.reason,
      });
      setAdjustModal({ open: false, member: null });
      setAdjustForm({ points: '', reason: '' });
      await Promise.all([fetchMembers(memberPage, memberSearch), fetchTransactions(1, txFilter), fetchAll()]);
    } catch (err: any) {
      alert(err.message || 'Adjust failed');
    }
  };

  if (loading && !stats) {
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
          <Trophy className="w-6 h-6 text-accent" /> Loyalty &amp; Rewards
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Configure tiers, set points-per-product, manage members, and review the transaction ledger.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-outline-variant overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => (t.key === 'refer' ? router.push('/admin/affiliates') : setTab(t.key))}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              tab === t.key ? 'border-accent text-accent' : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <t.Icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card hover={false} className="!p-5">
              <Users className="w-5 h-5 text-accent mb-2" />
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Members</p>
              <p className="text-2xl font-bold">{stats.totalAccounts.toLocaleString()}</p>
            </Card>
            <Card hover={false} className="!p-5">
              <Sparkles className="w-5 h-5 text-emerald-500 mb-2" />
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Lifetime pts issued</p>
              <p className="text-2xl font-bold">{stats.totalLifetimePoints.toLocaleString()}</p>
            </Card>
            <Card hover={false} className="!p-5">
              <Wallet className="w-5 h-5 text-rose-500 mb-2" />
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Pts redeemed</p>
              <p className="text-2xl font-bold">{stats.totalRedeemedPoints.toLocaleString()}</p>
              <p className="text-xs text-on-surface-variant">৳{stats.totalRedeemedBdt.toLocaleString()} value</p>
            </Card>
            <Card hover={false} className="!p-5">
              <TrendingUp className="w-5 h-5 text-blue-500 mb-2" />
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Transactions</p>
              <p className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</p>
            </Card>
          </div>

          {/* Tier distribution */}
          <Card hover={false}>
            <h3 className="font-bold mb-3">Tiers</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {stats.tiers.map((t) => (
                <Card key={t.id} className="!p-4 text-center" hover={false}>
                  <TierBadge name={t.name} color={t.color} starCount={t.starCount} showLabel={false} />
                  <p className="text-sm font-bold mt-2">{t.name}</p>
                  <p className="text-xs text-on-surface-variant">
                    {t.minPoints.toLocaleString()}+ pts · {Number(t.redemptionMultiplier)}x
                  </p>
                </Card>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* TIERS */}
      {tab === 'tiers' && (
        <>
          <div className="flex justify-end">
            <Button onClick={openCreateTier}>
              <Plus className="w-4 h-4 mr-2" /> New tier
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tiers.map((t) => (
              <Card key={t.id} hover={false} className="!p-5">
                <div className="flex items-center justify-between mb-3">
                  <TierBadge name={t.name} color={t.color} starCount={t.starCount} />
                  {!t.isActive && <Badge>Disabled</Badge>}
                </div>
                <p className="text-sm">
                  <span className="text-on-surface-variant">Threshold:</span>{' '}
                  <strong>{t.minPoints.toLocaleString()}</strong> pts
                </p>
                <p className="text-sm">
                  <span className="text-on-surface-variant">Redemption:</span>{' '}
                  <strong>{Number(t.redemptionMultiplier)}x</strong> ({Math.floor(t.minPoints * Number(t.redemptionMultiplier)).toLocaleString()} ৳ max)
                </p>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => openEditTier(t)}>
                    <Pencil className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setConfirmDeleteTier({ open: true, id: t.id })}>
                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* PRODUCT RULES */}
      {tab === 'rules' && (
        <>
          <div className="flex justify-end">
            <Button onClick={openCreateRule}>
              <Plus className="w-4 h-4 mr-2" /> New rule
            </Button>
          </div>
          <Card hover={false}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-on-surface-variant text-xs uppercase tracking-wider border-b border-outline-variant">
                  <th className="py-2">Product</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Points</th>
                  <th className="py-2">Max</th>
                  <th className="py-2">Status</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr key={r.id} className="border-b border-outline-variant/50">
                    <td className="py-2 font-semibold">{r.productName || (r.productId ? 'Product override' : 'Category default')}</td>
                    <td className="py-2">{r.productType}</td>
                    <td className="py-2">+{r.pointsValue} pts</td>
                    <td className="py-2">{r.maxPoints ?? '—'}</td>
                    <td className="py-2">{r.isActive ? <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">Active</Badge> : <Badge>Off</Badge>}</td>
                    <td className="py-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditRule(r)}><Pencil className="w-3 h-3" /></Button>
                      <Button size="sm" variant="outline" onClick={() => setConfirmDeleteRule({ open: true, id: r.id })}><Trash2 className="w-3 h-3" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rules.length === 0 && (
              <p className="text-center py-8 text-on-surface-variant text-sm">
                No rules yet. Each product uses its own <code className="px-1 bg-surface-container rounded">pointsAwarded</code> field instead.
              </p>
            )}
          </Card>
        </>
      )}

      {/* MEMBERS */}
      {tab === 'members' && (
        <>
          <Card hover={false}>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                placeholder="Search by name / email / phone"
                value={memberSearch}
                onChange={(e) => { setMemberSearch(e.target.value); setMemberPage(1); }}
                className="flex-1 px-3 py-2 rounded-lg bg-surface-container border border-outline-variant text-sm"
              />
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-on-surface-variant text-xs uppercase tracking-wider border-b border-outline-variant">
                  <th className="py-2">User</th>
                  <th className="py-2">Tier</th>
                  <th className="py-2">Lifetime</th>
                  <th className="py-2">Available</th>
                  <th className="py-2">Code</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-b border-outline-variant/50">
                    <td className="py-2 font-semibold">{m.user.fullName}</td>
                    <td className="py-2">
                      {m.currentTier ? (
                        <TierBadge name={m.currentTier.name} color={m.currentTier.color} starCount={m.currentTier.starCount} showLabel={false} />
                      ) : <span className="text-xs text-on-surface-variant">—</span>}
                    </td>
                    <td className="py-2 font-bold">{m.lifetimePoints.toLocaleString()}</td>
                    <td className="py-2 text-emerald-500 font-bold">{m.availablePoints.toLocaleString()}</td>
                    <td className="py-2 font-mono text-xs">{m.user.referralCode ?? '—'}</td>
                    <td className="py-2">
                      <Button size="sm" variant="outline" onClick={() => { setAdjustModal({ open: true, member: m }); setAdjustForm({ points: '', reason: '' }); }}>
                        Adjust
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {memberTotalPages > 1 && (
              <div className="flex gap-2 mt-4 justify-end">
                <Button size="sm" variant="outline" disabled={memberPage <= 1} onClick={() => setMemberPage((p) => Math.max(1, p - 1))}>Prev</Button>
                <span className="text-sm self-center">Page {memberPage} / {memberTotalPages}</span>
                <Button size="sm" variant="outline" disabled={memberPage >= memberTotalPages} onClick={() => setMemberPage((p) => p + 1)}>Next</Button>
              </div>
            )}
          </Card>
        </>
      )}

      {/* TRANSACTIONS */}
      {tab === 'transactions' && (
        <Card hover={false}>
          <div className="flex gap-3 mb-4">
            <FormSelect
              value={txFilter}
              onChange={(v) => { setTxFilter(v); setTxPage(1); }}
              options={[
                { label: 'All types', value: '' },
                { label: 'Referral signup', value: 'referral_signup' },
                { label: 'Booking confirmed', value: 'booking_confirmation' },
                { label: 'Booking completed', value: 'booking_completion' },
                { label: 'Redemption', value: 'redemption' },
                { label: 'Admin adjustment', value: 'admin_adjustment' },
                { label: 'Refund', value: 'refund' },
              ]}
            />
          </div>
          <div className="space-y-2">
            {transactions.map((tx) => {
              const meta = TYPE_LABEL[tx.type] ?? TYPE_LABEL.admin_adjustment;
              return (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-container/60 border border-outline-variant">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className={meta.cls}>{meta.label}</Badge>
                      <span className="text-sm font-semibold">{tx.account.user.fullName}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">{tx.description || '—'}</p>
                    <p className="text-xs text-on-surface-variant">{new Date(tx.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.points >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {tx.points >= 0 ? '+' : ''}{tx.points.toLocaleString()} pts
                    </p>
                    {tx.bdtValue != null && <p className="text-xs text-on-surface-variant">৳{tx.bdtValue}</p>}
                  </div>
                </div>
              );
            })}
            {transactions.length === 0 && <p className="text-center py-8 text-on-surface-variant text-sm">No transactions yet.</p>}
          </div>
          {txTotalPages > 1 && (
            <div className="flex gap-2 mt-4 justify-end">
              <Button size="sm" variant="outline" disabled={txPage <= 1} onClick={() => setTxPage((p) => Math.max(1, p - 1))}>Prev</Button>
              <span className="text-sm self-center">Page {txPage} / {txTotalPages}</span>
              <Button size="sm" variant="outline" disabled={txPage >= txTotalPages} onClick={() => setTxPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </Card>
      )}

      {/* Tier modal */}
      <Modal open={tierModal.open} onClose={() => setTierModal({ open: false, tier: null })} title={tierModal.tier ? 'Edit tier' : 'New tier'}>
        <div className="space-y-3">
          <FormField label="Name"><FormInput value={tierForm.name} onChange={(v) => setTierForm({ ...tierForm, name: v })} /></FormField>
          <FormField label="Slug (lowercase, unique)"><FormInput value={tierForm.slug} onChange={(v) => setTierForm({ ...tierForm, slug: v })} /></FormField>
          <FormField label="Color (hex)"><FormInput value={tierForm.color} onChange={(v) => setTierForm({ ...tierForm, color: v })} /></FormField>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Stars"><FormInput type="number" value={String(tierForm.starCount)} onChange={(v) => setTierForm({ ...tierForm, starCount: Number(v) || 0 })} /></FormField>
            <FormField label="Min points"><FormInput type="number" value={String(tierForm.minPoints)} onChange={(v) => setTierForm({ ...tierForm, minPoints: Number(v) || 0 })} /></FormField>
            <FormField label="Redemption ×"><FormInput type="number" value={String(tierForm.redemptionMultiplier)} onChange={(v) => setTierForm({ ...tierForm, redemptionMultiplier: Number(v) || 1 })} /></FormField>
          </div>
          <FormField label="Advantages (JSON)">
            <textarea
              value={tierForm.benefitsJson}
              onChange={(e) => setTierForm({ ...tierForm, benefitsJson: e.target.value })}
              rows={5}
              className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm font-mono"
              placeholder={'{"description":"Priority service","perks":["Priority support"]}'}
            />
            <p className="text-[11px] text-on-surface-variant mt-1">
              Use an object with a description and a perks array. These advantages are displayed to customers.
            </p>
          </FormField>
          <FormField label="Sort order"><FormInput type="number" value={String(tierForm.sortOrder)} onChange={(v) => setTierForm({ ...tierForm, sortOrder: Number(v) || 0 })} /></FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setTierModal({ open: false, tier: null })}>Cancel</Button>
            <Button onClick={submitTier}><Save className="w-4 h-4 mr-1" /> Save</Button>
          </div>
        </div>
      </Modal>

      {/* Product rule modal */}
      <Modal open={ruleModal.open} onClose={() => setRuleModal({ open: false, rule: null })} title={ruleModal.rule ? 'Edit rule' : 'New rule'}>
        <div className="space-y-3">
          <FormField label="Product type">
            <FormSelect value={ruleForm.productType} onChange={(v) => setRuleForm({ ...ruleForm, productType: v })}
              options={['tour','hotel','flight','visa','hajj','umrah','transport'].map((t) => ({ label: t, value: t }))} />
          </FormField>
          <FormField label="Specific product ID (optional)"><FormInput value={ruleForm.productId} onChange={(v) => setRuleForm({ ...ruleForm, productId: v })} /></FormField>
          <FormField label="Product name (optional)"><FormInput value={ruleForm.productName} onChange={(v) => setRuleForm({ ...ruleForm, productName: v })} /></FormField>
          <FormField label="Points per booking"><FormInput type="number" value={String(ruleForm.pointsValue)} onChange={(v) => setRuleForm({ ...ruleForm, pointsValue: Number(v) || 0 })} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Max points"><FormInput type="number" value={ruleForm.maxPoints} onChange={(v) => setRuleForm({ ...ruleForm, maxPoints: v })} /></FormField>
            <FormField label="Min spend (৳)"><FormInput type="number" value={ruleForm.minSpend} onChange={(v) => setRuleForm({ ...ruleForm, minSpend: v })} /></FormField>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setRuleModal({ open: false, rule: null })}>Cancel</Button>
            <Button onClick={submitRule}><Save className="w-4 h-4 mr-1" /> Save</Button>
          </div>
        </div>
      </Modal>

      {/* Adjust points modal */}
      <Modal open={adjustModal.open} onClose={() => setAdjustModal({ open: false, member: null })} title={`Adjust points — ${adjustModal.member?.user.fullName}`}>
        <div className="space-y-3">
          <FormField label="Points (negative to debit)"><FormInput type="number" value={adjustForm.points} onChange={(v) => setAdjustForm({ ...adjustForm, points: v })} /></FormField>
          <FormField label="Reason (visible in audit trail)"><FormInput value={adjustForm.reason} onChange={(v) => setAdjustForm({ ...adjustForm, reason: v })} /></FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setAdjustModal({ open: false, member: null })}>Cancel</Button>
            <Button onClick={submitAdjust}><Save className="w-4 h-4 mr-1" /> Apply</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmDeleteTier.open} onClose={() => setConfirmDeleteTier({ open: false, id: null })} onConfirm={handleDeleteTier} title="Delete tier?" message="Users on this tier will keep their points but lose the tier benefits." />
      <ConfirmDialog open={confirmDeleteRule.open} onClose={() => setConfirmDeleteRule({ open: false, id: null })} onConfirm={async () => { if (confirmDeleteRule.id) { await deleteLoyaltyProductRule(confirmDeleteRule.id); setConfirmDeleteRule({ open: false, id: null }); fetchAll(); } }} title="Delete rule?" message="This rule will be removed immediately." />
    </div>
  );
}
