'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/use-api';
import { useAuthStore } from '@/stores/auth.store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TierBadge from '@/components/ui/tier-badge';
import {
  Copy, Gift, Loader2, Check, Sparkles, Trophy, Wallet, Clock, TrendingUp,
} from 'lucide-react';

interface Tier {
  id: string;
  name: string;
  slug: string;
  color: string;
  starCount: number;
  minPoints: number;
  redemptionMultiplier: number | string;
}

interface Overview {
  lifetimePoints: number;
  availablePoints: number;
  pendingPoints: number;
  currentTier: Tier | null;
  nextTier: Tier | null;
  progress: number;
  pointsToNext: number;
  tiers: Tier[];
}

interface PointTransaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  referenceId: string;
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  REFERRAL_SIGNUP: 'Referral signup',
  BOOKING_CONFIRMED: 'Booking confirmed',
  BOOKING_COMPLETED: 'Booking completed',
  REDEMPTION: 'Redemption',
  ADMIN_ADJUSTMENT: 'Admin adjustment',
  REVERSAL: 'Reversal',
};

export default function LoyaltyDashboardPage() {
  const router = useRouter();
  const { user, hasHydrated } = useAuthStore();
  const {
    getLoyaltyOverview,
    getLoyaltyReferralLink,
    getLoyaltyReferrals,
    getLoyaltyHistory,
  } = useApi();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [link, setLink] = useState<{ code: string; url: string } | null>(null);
  const [referralStats, setReferralStats] = useState({ total: 0, registered: 0, converted: 0, pointsEarned: 0 });
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [filter, setFilter] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (transactionType = filter) => {
    setLoading(true);
    setError(null);
    try {
      const [nextOverview, nextLink, referrals, history] = await Promise.all([
        getLoyaltyOverview(),
        getLoyaltyReferralLink(),
        getLoyaltyReferrals(),
        getLoyaltyHistory(transactionType ? { type: transactionType } : undefined),
      ]);
      setOverview(nextOverview as Overview);
      setLink(nextLink as { code: string; url: string });
      setReferralStats((referrals as any)?.stats ?? { total: 0, registered: 0, converted: 0, pointsEarned: 0 });
      setTransactions(((history as any)?.items ?? []) as PointTransaction[]);
    } catch (err: any) {
      setError(err?.message || 'Unable to load rewards data');
    } finally {
      setLoading(false);
    }
  }, [filter, getLoyaltyHistory, getLoyaltyOverview, getLoyaltyReferralLink, getLoyaltyReferrals]);

  useEffect(() => {
    // Wait for the persisted auth cookie to hydrate before deciding anything —
    // a page reload renders the store pre-hydration for one frame, which would
    // otherwise bounce an already-logged-in user to /auth/login.
    if (!hasHydrated) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }
    void load();
  }, [load, router, user, hasHydrated]);

  if (!user) return null;
  if (loading && !overview) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;
  }
  if (error || !overview) {
    return <div className="min-h-[60vh] flex items-center justify-center px-4"><Card className="max-w-md"><p className="text-rose-500 text-sm">{error || 'Unable to load rewards data.'}</p><Button onClick={() => void load()} className="mt-4" size="sm">Retry</Button></Card></div>;
  }

  const tier = overview.currentTier;
  const copyLink = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link.url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <section className="relative overflow-hidden rounded-3xl border border-outline-variant bg-gradient-to-br from-accent/15 via-tertiary/10 to-primary/10 p-6 sm:p-10">
          <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-[0.2em]"><Sparkles className="w-5 h-5" /> FlyNGo Rewards</div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl sm:text-4xl font-bold">Your loyalty journey</h1>
              {tier && <TierBadge name={tier.name} color={tier.color} starCount={tier.starCount} size="lg" />}
            </div>
            <p className="mt-2 text-on-surface-variant">Earn points on bookings and referrals. Pending points become available when the booking is completed.</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric icon={Trophy} label="Lifetime" value={overview.lifetimePoints} />
              <Metric icon={Wallet} label="Available" value={overview.availablePoints} />
              <Metric icon={Clock} label="Pending" value={overview.pendingPoints} />
              <Metric icon={Sparkles} label="Tier multiplier" value={`${Number(tier?.redemptionMultiplier ?? 1)}x`} />
            </div>
            <div className="mt-3 grid gap-2 text-xs text-on-surface-variant sm:grid-cols-2">
              <p><span className="font-semibold text-on-surface">Available:</span> points you can use for rewards now.</p>
              <p><span className="font-semibold text-on-surface">Pending:</span> points held until the qualifying booking is completed.</p>
            </div>
            {overview.nextTier && (
              <div className="mt-4 rounded-2xl border border-outline-variant bg-surface-container-high/70 p-4">
                <div className="mb-2 flex items-center justify-between gap-3 text-sm"><span className="font-semibold">Progress to {overview.nextTier.name}</span><span className="text-on-surface-variant">{overview.pointsToNext.toLocaleString()} pts to go</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-container"><div className="h-full rounded-full bg-accent transition-all" style={{ width: `${overview.progress}%` }} /></div>
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <Card hover={false}>
            <div className="flex items-center gap-2"><Gift className="w-5 h-5 text-accent" /><h2 className="font-bold">Invite a friend</h2></div>
            <p className="mt-2 text-sm text-on-surface-variant">Share your link. You earn 500 points after your friend verifies their account.</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input readOnly value={link?.url ?? ''} className="min-w-0 flex-1 rounded-xl border border-outline-variant bg-surface-container px-3 py-2 text-sm" />
              <Button onClick={() => void copyLink()} size="sm" className="shrink-0">{copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}{copied ? 'Copied' : 'Copy link'}</Button>
            </div>
          </Card>
          <Card hover={false}>
            <h2 className="font-bold">Referral snapshot</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
              <Stat label="Total" value={referralStats.total} />
              <Stat label="Registered" value={referralStats.registered} />
              <Stat label="Converted" value={referralStats.converted} />
              <Stat label="Referral points" value={referralStats.pointsEarned} />
            </div>
          </Card>
        </section>

        <Card hover={false}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-bold"><TrendingUp className="w-5 h-5 text-accent" /> Points history</h2>
            <select value={filter} onChange={(event) => { setFilter(event.target.value); void load(event.target.value); }} className="rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm" aria-label="Filter points history">
              <option value="">All activity</option>
              {Object.entries(TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          {transactions.length === 0 ? <p className="py-12 text-center text-sm text-on-surface-variant">No points activity yet.</p> : (
            <div className="mt-4 divide-y divide-outline-variant">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between gap-4 py-4">
                  <div><p className="font-semibold text-sm">{TYPE_LABELS[transaction.type] ?? transaction.type}</p><p className="text-xs text-on-surface-variant">{new Date(transaction.createdAt).toLocaleString()} · {transaction.status.toLowerCase()}</p></div>
                  <p className={`shrink-0 font-bold ${transaction.amount >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{transaction.amount >= 0 ? '+' : ''}{transaction.amount.toLocaleString()} pts</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card hover={false}>
          <h2 className="font-bold">Tier ladder</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {overview.tiers.map((item) => <div key={item.id} className={`rounded-xl border p-3 ${item.id === tier?.id ? 'border-accent bg-accent/5' : 'border-outline-variant'}`}><TierBadge name={item.name} color={item.color} starCount={item.starCount} showLabel={false} /><p className="mt-2 text-sm font-bold">{item.name}</p><p className="text-xs text-on-surface-variant">{item.minPoints.toLocaleString()} pts</p>{item.id === tier?.id && <Badge className="mt-2">Current</Badge>}</div>)}
          </div>
        </Card>
      </div>
    </main>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: number | string }) {
  return <Card className="!p-4 bg-surface-container-high/80" hover={false}><p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">{label}</p><p className="mt-1 flex items-center gap-1 text-xl font-bold"><Icon className="h-4 w-4 text-accent" />{typeof value === 'number' ? value.toLocaleString() : value}</p></Card>;
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div><p className="text-2xl font-bold">{value.toLocaleString()}</p><p className="text-xs text-on-surface-variant">{label}</p></div>;
}
