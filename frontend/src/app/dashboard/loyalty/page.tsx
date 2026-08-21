'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/use-api';
import { useAuthStore } from '@/stores/auth.store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TierBadge from '@/components/ui/tier-badge';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import {
  Gift, Sparkles, TrendingUp, Wallet, Trophy, Loader2,
  ArrowUpRight, Star, Copy, CheckCircle2,
} from 'lucide-react';

interface Tier {
  id: string; name: string; slug: string; color: string;
  starCount: number; minPoints: number; redemptionMultiplier: number;
  benefits?: { description?: string; perks?: string[] };
  sortOrder: number;
}

interface LoyaltyAccount {
  id: string;
  lifetimePoints: number;
  availablePoints: number;
  redeemedPoints: number;
  currentTierId: string | null;
  currentTier: Tier | null;
  recentTransactions: Transaction[];
  tierProgress: number;
  nextTier: Tier | null;
  redemptionMultiplier: number;
  maxRedeemableBdt: number;
}

interface Transaction {
  id: string;
  type: string;
  points: number;
  currency: string;
  bdtValue: number | null;
  bookingId: string | null;
  referralId: string | null;
  description: string | null;
  createdAt: string;
}

const TYPE_LABEL: Record<string, { label: string; cls: string }> = {
  referral_signup:        { label: 'Referral signup',  cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  booking_confirmation:   { label: 'Booking confirmed', cls: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  booking_completion:     { label: 'Service completed', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  redemption:             { label: 'Redeemed',         cls: 'bg-rose-500/10 text-rose-600 border-rose-500/30' },
  admin_adjustment:       { label: 'Admin adjustment', cls: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  refund:                 { label: 'Refunded',         cls: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/30' },
};

export default function LoyaltyDashboardPage() {
  const router = useRouter();
  const { getMyLoyalty } = useApi();
  const { user } = useAuthStore();

  const [account, setAccount] = useState<LoyaltyAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccount = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await getMyLoyalty()) as LoyaltyAccount;
      setAccount(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load loyalty data');
    } finally {
      setLoading(false);
    }
  }, [getMyLoyalty]);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchAccount();
  }, [user, router, fetchAccount]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="max-w-md">
          <p className="text-rose-500 text-sm">{error || 'Unable to load loyalty data.'}</p>
          <Button onClick={fetchAccount} className="mt-4" size="sm">Retry</Button>
        </Card>
      </div>
    );
  }

  const tier = account.currentTier;
  const progress = account.nextTier
    ? Math.min(100, Math.round(((account.lifetimePoints - (tier?.minPoints || 0)) / (account.nextTier.minPoints - (tier?.minPoints || 0))) * 100))
    : 100;
  const pointsToNext = account.nextTier
    ? Math.max(0, account.nextTier.minPoints - account.lifetimePoints)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 mb-8 border border-outline-variant bg-gradient-to-br from-accent/15 via-tertiary/10 to-primary/10">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-tertiary/20 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-6 h-6 text-accent" />
              <span className="text-xs uppercase tracking-widest font-bold text-accent">FlynGo Rewards</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-2 flex items-center gap-3 flex-wrap">
              <span>Your tier:</span>
              {tier ? (
                <TierBadge name={tier.name} color={tier.color} starCount={tier.starCount} size="lg" />
              ) : (
                <span className="text-on-surface-variant">No tier yet</span>
              )}
            </h1>

            <p className="text-on-surface-variant mb-6">
              Earn points on every booking. Redeem for ৳{Math.floor(account.availablePoints * account.redemptionMultiplier)} off your next trip.
            </p>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="!p-4 bg-surface-container-high/80 backdrop-blur" hover={false}>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Lifetime</p>
                <p className="text-2xl font-bold flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-amber-500" /> {account.lifetimePoints.toLocaleString()}
                </p>
              </Card>
              <Card className="!p-4 bg-surface-container-high/80 backdrop-blur" hover={false}>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Available</p>
                <p className="text-2xl font-bold flex items-center gap-1">
                  <Wallet className="w-4 h-4 text-accent" /> {account.availablePoints.toLocaleString()}
                </p>
              </Card>
              <Card className="!p-4 bg-surface-container-high/80 backdrop-blur" hover={false}>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Worth</p>
                <p className="text-2xl font-bold">৳{account.maxRedeemableBdt.toLocaleString()}</p>
              </Card>
            </div>

            {/* Progress to next tier */}
            {account.nextTier && (
              <Card className="mt-4 !p-4 bg-surface-container-high/80 backdrop-blur" hover={false}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">
                    Progress to {account.nextTier.name}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    {pointsToNext.toLocaleString()} pts to go
                  </span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, ${tier?.color || '#999'}, ${account.nextTier.color})`,
                    }}
                  />
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* How to earn */}
        <Card className="mb-8" hover={false}>
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-accent" /> How to earn points
          </h3>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold text-on-surface">Refer a friend</p>
              <p className="text-on-surface-variant">+500 pts when someone signs up using your link</p>
            </div>
            <div>
              <p className="font-semibold text-on-surface">Book a trip</p>
              <p className="text-on-surface-variant">50% on confirmation + 50% on completion</p>
            </div>
            <div>
              <p className="font-semibold text-on-surface">Climb tiers</p>
              <p className="text-on-surface-variant">Unlock up to 2× redemption rate at Ambassador</p>
            </div>
          </div>
        </Card>

        {/* Tier ladder */}
        <Card className="mb-8" hover={false}>
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" /> Tier ladder
          </h3>
          <div className="space-y-2">
            {[
              { name: 'Silver',     color: '#C0C0C0', starCount: 1, minPoints: 10000, multiplier: 1.0 },
              { name: 'Gold',       color: '#FFD700', starCount: 2, minPoints: 50000, multiplier: 1.1 },
              { name: 'Platinum',   color: '#E5E4E2', starCount: 4, minPoints: 150000, multiplier: 1.25 },
              { name: 'Diamond',    color: '#60A5FA', starCount: 4, minPoints: 300000, multiplier: 1.5 },
              { name: 'Ambassador', color: '#7B61FF', starCount: 5, minPoints: 500000, multiplier: 2.0 },
            ].map((t) => {
              const isCurrent = tier?.name === t.name;
              const isReached = account.lifetimePoints >= t.minPoints;
              return (
                <div
                  key={t.name}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                    isCurrent ? 'border-accent bg-accent/5' : isReached ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-outline-variant'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <TierBadge name={t.name} color={t.color} starCount={t.starCount} showLabel={false} />
                    <div>
                      <p className="font-bold">{t.name}</p>
                      <p className="text-xs text-on-surface-variant">
                        {t.minPoints.toLocaleString()} pts · {t.multiplier}x redemption
                      </p>
                    </div>
                  </div>
                  {isCurrent && <Badge className="bg-accent/20 text-accent border-accent/30">Current</Badge>}
                  {!isCurrent && isReached && <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">Achieved</Badge>}
                  {!isCurrent && !isReached && (
                    <span className="text-xs text-on-surface-variant">
                      {(t.minPoints - account.lifetimePoints).toLocaleString()} pts to go
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent transactions */}
        <Card hover={false}>
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" /> Recent activity
          </h3>
          {account.recentTransactions.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant text-sm">
              <Sparkles className="w-10 h-10 mx-auto mb-2 opacity-40" />
              No activity yet — start booking to earn points.
            </div>
          ) : (
            <div className="space-y-2">
              {account.recentTransactions.map((tx) => {
                const meta = TYPE_LABEL[tx.type] || TYPE_LABEL.admin_adjustment;
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-container/60 border border-outline-variant"
                  >
                    <div>
                      <p className="font-semibold text-sm">{tx.description || meta.label}</p>
                      <p className="text-xs text-on-surface-variant">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tx.points >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {tx.points >= 0 ? '+' : ''}{tx.points.toLocaleString()} pts
                      </p>
                      {tx.bdtValue != null && (
                        <p className="text-xs text-on-surface-variant">৳{tx.bdtValue}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
