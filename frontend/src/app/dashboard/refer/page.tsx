'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/use-api';
import { useAuthStore } from '@/stores/auth.store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import TierBadge from '@/components/ui/tier-badge';
import Confetti from '@/components/ui/confetti';
import { formatCurrency } from '@/lib/utils';
import { Modal, FormField, FormInput, FormSelect } from '@/components/admin/ui';
import {
  Gift, Copy, Share2, Users, Wallet, TrendingUp, CheckCircle2,
  Facebook, MessageCircle, Send, Mail, Loader2, ArrowUpRight, Trophy,
  Star,
} from 'lucide-react';
import {
  buildReferralShareLink,
  formatRewardText,
  resolveShareTemplate,
  mergeShareTemplates,
  buildShareUrl,
  type ShareChannel,
  type ShareTemplates,
} from '@/lib/referral';

interface ReferralSettings {
  referrerRewardType: string;
  referrerRewardValue: number;
  commissionlessSignupPoints?: number;
  refereeRewardType: string;
  refereeRewardValue: number;
  payoutCurrency: string;
  minPayoutAmount: number;
  cookieWindowDays: number;
  isEnabled: boolean;
}

interface ReferralTotals {
  referrals: number;
  converted: number;
  pendingCommission: number;
  paidCommission: number;
  totalEarnings: number;
  availableBalance: number;
}

interface ReferredUser {
  id: string;
  fullName: string;
  createdAt: string;
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
  referredUser: ReferredUser | null;
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
  createdAt: string;
}

interface LedgerEntry {
  id: string;
  type: string;
  amount: number;
  currency: string;
  description: string | null;
  createdAt: string;
}

interface AffiliateInfo {
  id: string;
  affiliateType: string; // fixed_commission | commission_less
  commissionRate: number;
  rewardBasis: string;
  isActive: boolean;
}

interface Conditions {
  type: 'fixed_commission' | 'commission_less';
  label: string;
  payoutEligible: boolean;
}

interface LoyaltyTier {
  id: string;
  name: string;
  slug: string;
  color: string;
  starCount: number;
  minPoints: number;
  redemptionMultiplier: number;
  benefits?: { description?: string; perks?: string[] };
  sortOrder: number;
}

interface LoyaltySummary {
  lifetimePoints: number;
  availablePoints: number;
  redeemedPoints: number;
  currentTier: LoyaltyTier | null;
  nextTier: LoyaltyTier | null;
  pointsToNext: number;
  progress: number;
  tiers: LoyaltyTier[];
}

interface Summary {
  user: { id: string; fullName: string; referralCode: string; referredByCode: string | null };
  affiliate?: AffiliateInfo;
  conditions?: Conditions;
  settings: ReferralSettings;
  totals: ReferralTotals;
  referrals: Referral[];
  commissions: Commission[];
  payouts: Payout[];
  ledger: LedgerEntry[];
  loyalty?: LoyaltySummary;
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pending:    { label: 'Pending',    cls: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  registered: { label: 'Signed up',  cls: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  converted:  { label: 'Converted',  cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  cancelled:  { label: 'Cancelled',  cls: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/30' },
  paid:       { label: 'Paid',       cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  rejected:   { label: 'Rejected',   cls: 'bg-rose-500/10 text-rose-600 border-rose-500/30' },
  processing: { label: 'Processing', cls: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
};

// Tier ranking used to detect an upgrade for the celebration. Slugs mirror the
// seeded LoyaltyTier slugs: silver → gold → platinum → diamond → ambassador.
const TIER_ORDER: Record<string, number> = {
  silver: 0,
  gold: 1,
  platinum: 2,
  diamond: 3,
  ambassador: 4,
};

const CELEBRATION_KEY = 'flyngo_refer_celebration';

interface CelebrationState {
  tierSlug: string | null;
  lifetimePoints: number;
}

function readCelebrationState(): CelebrationState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CELEBRATION_KEY);
    return raw ? (JSON.parse(raw) as CelebrationState) : null;
  } catch {
    return null;
  }
}

function writeCelebrationState(state: CelebrationState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CELEBRATION_KEY, JSON.stringify(state));
  } catch {
    // storage may be unavailable; celebration is best-effort
  }
}

export default function ReferDashboardPage() {
  const router = useRouter();
  const { getMyReferralSummary, requestReferralPayout } = useApi();
  const { user, hasHydrated } = useAuthStore();

  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [celebration, setCelebration] = useState<{ active: boolean; message?: string }>({ active: false });

  const [payoutOpen, setPayoutOpen] = useState(false);
  const [payoutForm, setPayoutForm] = useState({ amount: '', method: 'bkash', details: '' });
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await getMyReferralSummary()) as Summary;
      setSummary(data);

      // Phase 3 — celebrate a tier upgrade since the user's last visit, driven
      // by the loyalty snapshot embedded in the referral summary.
      const tierSlug = data.loyalty?.currentTier?.slug ?? null;
      const tierName = data.loyalty?.currentTier?.name ?? null;
      const prev = readCelebrationState();
      if (prev) {
        const leveledUp =
          prev.tierSlug &&
          tierSlug &&
          (TIER_ORDER[tierSlug] ?? -1) > (TIER_ORDER[prev.tierSlug] ?? -1);
        if (leveledUp && tierName) {
          setCelebration({ active: true, message: `You've reached ${tierName}! New rewards unlocked.` });
        }
      }
      writeCelebrationState({ tierSlug, lifetimePoints: data.loyalty?.lifetimePoints ?? 0 });
    } catch (err: any) {
      setError(err.message || 'Failed to load referral dashboard');
    } finally {
      setLoading(false);
    }
  }, [getMyReferralSummary]);

  // Wait for the persisted auth store to rehydrate from the cookie before
  // deciding whether to redirect. On a full page load Zustand persist hydrates
  // in a microtask, so `user` is briefly null — redirecting there would bounce
  // an already-logged-in user to /auth/login.
  useEffect(() => {
    if (!hasHydrated) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSummary();
  }, [user, hasHydrated, router, fetchSummary]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md">
          <p className="text-rose-500 text-sm">{error || 'Unable to load referral data.'}</p>
          <Button onClick={fetchSummary} className="mt-4" size="sm">Retry</Button>
        </Card>
      </div>
    );
  }

  const shareUrl = typeof window !== 'undefined'
    ? buildReferralShareLink(window.location.origin, summary.user.referralCode)
    : `https://example.com/?ref=${summary.user.referralCode}`;

  // Fixed-commission affiliates earn at their own rate; commission-less earn points
  const referrerText = summary.conditions?.type === 'commission_less'
    ? `${summary.settings.commissionlessSignupPoints ?? 500} pts per signup`
    : formatRewardText(
        summary.settings.referrerRewardType,
        summary.affiliate?.commissionRate ?? summary.settings.referrerRewardValue,
        summary.settings.payoutCurrency,
      );
  const refereeText = formatRewardText(
    summary.settings.refereeRewardType,
    summary.settings.refereeRewardValue,
    summary.settings.payoutCurrency,
  );

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOn = (channel: ShareChannel) => {
    const templates: ShareTemplates = mergeShareTemplates(
      (summary as any).shareMessageTemplates,
    );
    const brand = (summary as any).brand || 'FlynGo';
    const resolved = resolveShareTemplate(templates[channel], {
      brand,
      refereeReward: refereeText,
      referrerReward: referrerText,
      referralCode: summary.user.referralCode,
      shareLink: shareUrl,
    });
    const href = buildShareUrl(channel, resolved, shareUrl);
    if (channel === 'email_subject' || channel === 'email_body') {
      const subjectTpl = templates.email_subject;
      const bodyTpl = templates.email_body;
      const subject = resolveShareTemplate(subjectTpl, {
        brand,
        refereeReward: refereeText,
        referrerReward: referrerText,
        referralCode: summary.user.referralCode,
        shareLink: shareUrl,
      });
      const body = resolveShareTemplate(bodyTpl, {
        brand,
        refereeReward: refereeText,
        referrerReward: referrerText,
        referralCode: summary.user.referralCode,
        shareLink: shareUrl,
      });
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      return;
    }
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const handlePayout = async () => {
    if (!payoutForm.amount || !payoutForm.method) return;
    setPayoutSubmitting(true);
    try {
      let details: any = {};
      if (payoutForm.details) {
        try {
          details = JSON.parse(payoutForm.details);
        } catch {
          details = { note: payoutForm.details };
        }
      }
      await requestReferralPayout({
        amount: Number(payoutForm.amount),
        method: payoutForm.method,
        details,
      });
      setPayoutOpen(false);
      setPayoutForm({ amount: '', method: 'bkash', details: '' });
      await fetchSummary();
    } catch (err: any) {
      alert(err.message || 'Payout request failed');
    } finally {
      setPayoutSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 mb-8 border border-outline-variant bg-gradient-to-br from-accent/15 via-tertiary/10 to-primary/10">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-tertiary/20 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="w-6 h-6 text-accent" />
              <span className="text-xs uppercase tracking-widest font-bold text-accent">Refer & Earn</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-on-surface mb-2">
              Share your link. Earn {referrerText}.
            </h1>
            <p className="text-on-surface-variant mb-6 max-w-xl">
              Invite friends to FlynGo. They get {refereeText} on their first booking, you earn
               real cash or credit when they complete eligible bookings.
            </p>

            {/* Referral link + share */}
            <Card className="!p-4 sm:!p-5 bg-surface-container-high/80 backdrop-blur" hover={false}>
              <div className="flex flex-col gap-3">
                <div className="w-full">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1 block">
                    Your referral link — new users sign up and get {refereeText} off their first booking
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={shareUrl}
                      readOnly
                      className="text-sm font-mono"
                    />
                    <Button onClick={copyLink} variant="outline">
                      {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-2">
                    Share this link — anyone who signs up through it will receive <span className="font-bold text-accent">{refereeText}</span> on their first booking.
                  </p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-1 block">
                    Your referral code
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={summary.user.referralCode}
                      readOnly
                      className="font-mono text-lg font-bold tracking-wider"
                    />
                    <Button onClick={copyLink} variant="outline">
                      {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Social share */}
              <div className="flex flex-wrap gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => shareOn('whatsapp')}>
                  <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                </Button>
                <Button size="sm" variant="outline" onClick={() => shareOn('facebook')}>
                  <Facebook className="w-4 h-4 mr-2" /> Facebook
                </Button>
                <Button size="sm" variant="outline" onClick={() => shareOn('telegram')}>
                  <Send className="w-4 h-4 mr-2" /> Telegram
                </Button>
                <Button size="sm" variant="outline" onClick={() => shareOn('twitter')}>
                  <Share2 className="w-4 h-4 mr-2" /> X / Twitter
                </Button>
                <Button size="sm" variant="outline" onClick={() => shareOn('email_body')}>
                  <Mail className="w-4 h-4 mr-2" /> Email
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* My affiliation type */}
        {summary.conditions && (
          <Card className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" hover={false}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  className={
                    summary.conditions.type === 'fixed_commission'
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                      : 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                  }
                >
                  {summary.conditions.type === 'fixed_commission' ? '01 · Fixed commission' : '02 · Commission-less'}
                </Badge>
                {(summary.affiliate?.isActive === false) && <Badge>Account inactive</Badge>}
              </div>
              <p className="text-sm text-on-surface-variant">{summary.conditions.label}.</p>
              {!summary.conditions.payoutEligible && (
                <p className="text-xs text-on-surface-variant mt-1">
                  Points-only program — track your points on the{' '}
                  <a href="/dashboard/loyalty" className="text-accent font-semibold hover:underline">Loyalty page</a>.
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Membership tier & badges */}
        {summary.loyalty && (
          <Card className="mb-8" hover={false}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-bold mb-1 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" /> Your membership tier
                </h3>
                <p className="text-sm text-on-surface-variant">
                  Earn points from referrals and bookings to climb the ladder and unlock
                  better redemption rates.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <TierBadge
                  name={summary.loyalty.currentTier?.name}
                  color={summary.loyalty.currentTier?.color}
                  starCount={summary.loyalty.currentTier?.starCount}
                  size="lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-3 rounded-xl bg-surface-container/60 border border-outline-variant">
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Lifetime pts</p>
                <p className="text-xl font-bold">{summary.loyalty.lifetimePoints.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-container/60 border border-outline-variant">
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Available pts</p>
                <p className="text-xl font-bold">{summary.loyalty.availablePoints.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-container/60 border border-outline-variant">
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Redemption</p>
                <p className="text-xl font-bold">
                  {summary.loyalty.currentTier ? `${summary.loyalty.currentTier.redemptionMultiplier}x` : '1.0x'}
                </p>
              </div>
            </div>

            {summary.loyalty.nextTier && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">
                    Progress to <TierBadge name={summary.loyalty.nextTier.name} color={summary.loyalty.nextTier.color} starCount={summary.loyalty.nextTier.starCount} size="sm" />
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    {summary.loyalty.pointsToNext.toLocaleString()} pts to go
                  </span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${summary.loyalty.progress}%`,
                      background: `linear-gradient(90deg, ${summary.loyalty.currentTier?.color || '#999'}, ${summary.loyalty.nextTier.color})`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
              {summary.loyalty.tiers.map((t) => {
                const isCurrent = summary.loyalty?.currentTier?.id === t.id;
                const isReached = summary.loyalty!.lifetimePoints >= t.minPoints;
                return (
                  <div
                    key={t.id}
                    className={`p-3 rounded-xl border ${
                      isCurrent ? 'border-accent bg-accent/5' : isReached ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-outline-variant'
                    }`}
                  >
                    <TierBadge name={t.name} color={t.color} starCount={t.starCount} size="sm" showLabel={false} />
                    <p className="font-bold text-sm mt-2">{t.name}</p>
                    <p className="text-[11px] text-on-surface-variant">{t.minPoints.toLocaleString()} pts</p>
                    <p className="text-[11px] text-on-surface-variant">{t.redemptionMultiplier}x</p>
                    {isCurrent && <Badge className="mt-1 bg-accent/20 text-accent border-accent/30">You</Badge>}
                    {!isCurrent && isReached && <Badge className="mt-1 bg-emerald-500/20 text-emerald-600 border-emerald-500/30">Done</Badge>}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card hover={false}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Invited</p>
                <p className="text-2xl font-bold">{summary.totals.referrals}</p>
              </div>
              <Users className="w-5 h-5 text-accent" />
            </div>
          </Card>
          <Card hover={false}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Converted</p>
                <p className="text-2xl font-bold">{summary.totals.converted}</p>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
          </Card>
          <Card hover={false}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Available</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary.totals.availableBalance, summary.settings.payoutCurrency)}
                </p>
              </div>
              <Wallet className="w-5 h-5 text-accent" />
            </div>
          </Card>
          <Card hover={false}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Lifetime</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary.totals.totalEarnings, summary.settings.payoutCurrency)}
                </p>
              </div>
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
          </Card>
        </div>

        {/* Payout CTA — only for fixed-commission affiliates */}
        {(!summary.conditions || summary.conditions.payoutEligible) && (
          <Card className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" hover={false}>
            <div>
              <h3 className="font-bold mb-1">Cash out your earnings</h3>
              <p className="text-sm text-on-surface-variant">
                Minimum payout is {formatCurrency(summary.settings.minPayoutAmount, summary.settings.payoutCurrency)}.
                You currently have <span className="font-bold text-accent">
                  {formatCurrency(summary.totals.availableBalance, summary.settings.payoutCurrency)}
                </span> available.
              </p>
            </div>
            <Button
              onClick={() => setPayoutOpen(true)}
              disabled={summary.totals.availableBalance < summary.settings.minPayoutAmount}
            >
              <ArrowUpRight className="w-4 h-4 mr-2" /> Request payout
            </Button>
          </Card>
        )}

        {/* Tabs: Referrals / Commissions / Ledger / Payouts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">People you referred</h3>
              <Badge>{summary.referrals.length}</Badge>
            </div>
            <div className="space-y-2 max-h-[480px] overflow-auto pr-1">
              {summary.referrals.length === 0 && (
                <div className="text-center py-12 text-on-surface-variant text-sm">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  No referrals yet — share your link to get started.
                </div>
              )}
              {summary.referrals.map((r) => {
                const badge = STATUS_BADGE[r.status] || STATUS_BADGE.pending;
                return (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-container/60 border border-outline-variant">
                    <div>
                      <p className="font-semibold text-sm">{r.referredUser?.fullName || 'Member'}</p>
                      <p className="text-xs text-on-surface-variant">
                        Joined {new Date(r.registeredAt || r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={badge.cls}>{badge.label}</Badge>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Commissions</h3>
              <Badge>{summary.commissions.length}</Badge>
            </div>
            <div className="space-y-2 max-h-[480px] overflow-auto pr-1">
              {summary.commissions.length === 0 && (
                <div className="text-center py-12 text-on-surface-variant text-sm">
                  <Wallet className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  Commissions appear here once a referred friend books.
                </div>
              )}
              {summary.commissions.map((c) => {
                const badge = STATUS_BADGE[c.status] || STATUS_BADGE.pending;
                return (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-container/60 border border-outline-variant">
                    <div>
                      <p className="font-semibold text-sm">{formatCurrency(c.amount, c.currency)}</p>
                      <p className="text-xs text-on-surface-variant">
                        Booking #{c.bookingId.slice(0, 8)} · {new Date(c.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={badge.cls}>{badge.label}</Badge>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card hover={false} className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Activity ledger</h3>
              <Badge>{summary.ledger.length}</Badge>
            </div>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-widest text-on-surface-variant">
                  <tr className="border-b border-outline-variant">
                    <th className="text-left py-2 pr-4">Date</th>
                    <th className="text-left py-2 pr-4">Type</th>
                    <th className="text-left py-2 pr-4">Description</th>
                    <th className="text-right py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.ledger.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-on-surface-variant">
                        No activity yet.
                      </td>
                    </tr>
                  )}
                  {summary.ledger.map((l) => (
                    <tr key={l.id} className="border-b border-outline-variant/50">
                      <td className="py-2 pr-4 text-on-surface-variant">
                        {new Date(l.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs uppercase">{l.type}</td>
                      <td className="py-2 pr-4 text-on-surface-variant">{l.description || '—'}</td>
                      <td className={`py-2 text-right font-bold ${l.amount >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {l.amount >= 0 ? '+' : ''}{formatCurrency(l.amount, l.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Payout history */}
        {summary.payouts.length > 0 && (
          <Card className="mt-6" hover={false}>
            <h3 className="font-bold mb-4">Payout history</h3>
            <div className="space-y-2">
              {summary.payouts.map((p) => {
                const badge = STATUS_BADGE[p.status] || STATUS_BADGE.pending;
                return (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-container/60 border border-outline-variant">
                    <div>
                      <p className="font-semibold text-sm">{formatCurrency(p.amount, p.currency)} via {p.method}</p>
                      <p className="text-xs text-on-surface-variant">
                        Requested {new Date(p.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={badge.cls}>{badge.label}</Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      {/* Payout modal */}
      <Modal open={payoutOpen} onClose={() => setPayoutOpen(false)} title="Request a payout">
        <div className="space-y-4">
          <FormField label="Amount">
            <FormInput
              type="number"
              placeholder={String(summary.settings.minPayoutAmount)}
              value={payoutForm.amount}
              onChange={(v: string) => setPayoutForm({ ...payoutForm, amount: v })}
            />
            <p className="text-xs text-on-surface-variant mt-1">
              Available: {formatCurrency(summary.totals.availableBalance, summary.settings.payoutCurrency)} ·
              Minimum: {formatCurrency(summary.settings.minPayoutAmount, summary.settings.payoutCurrency)}
            </p>
          </FormField>
          <FormField label="Method">
            <FormSelect
              value={payoutForm.method}
              onChange={(v: string) => setPayoutForm({ ...payoutForm, method: v })}
              options={[
                { value: 'bkash', label: 'bKash' },
                { value: 'nagad', label: 'Nagad' },
                { value: 'bank_transfer', label: 'Bank Transfer' },
                { value: 'paypal', label: 'PayPal' },
                { value: 'stripe', label: 'Stripe' },
                { value: 'credit', label: 'Travel Credit (apply to next booking)' },
              ]}
            />
          </FormField>
          <FormField label="Account / reference (optional JSON or note)">
            <FormInput
              placeholder='e.g. {"phone":"+8801700000000"}'
              value={payoutForm.details}
              onChange={(v: string) => setPayoutForm({ ...payoutForm, details: v })}
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setPayoutOpen(false)}>Cancel</Button>
            <Button
              onClick={handlePayout}
              disabled={payoutSubmitting || !payoutForm.amount}
            >
              {payoutSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Submit request
            </Button>
          </div>
        </div>
      </Modal>

      <Confetti
        active={celebration.active}
        message={celebration.message}
        onDone={() => setCelebration({ active: false })}
      />
    </div>
  );
}
