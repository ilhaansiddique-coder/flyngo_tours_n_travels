'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TierBadge from '@/components/ui/tier-badge';
import { formatCurrency } from '@/lib/utils';
import {
  Gift, Users, Wallet, TrendingUp, CheckCircle2, ArrowRight,
  MessageCircle, Send, Mail, Loader2, Sparkles, Plane, Heart,
  Star, Lock, Crown,
} from 'lucide-react';
import { api } from '@/lib/api';
import { captureReferralFromUrl } from '@/lib/referral';
import { useAuthStore } from '@/stores/auth.store';

interface Tier {
  name: string;
  slug: string;
  color: string;
  starCount: number;
  minPoints: number;
  redemptionMultiplier: number;
  benefits?: { description?: string; perks?: string[] };
}

const TIER_LADDER = [
  { name: 'Silver',     color: '#C0C0C0', starCount: 1, minPoints:   10000, multiplier: 1.0, perks: 'Standard rewards' },
  { name: 'Gold',       color: '#FFD700', starCount: 2, minPoints:   50000, multiplier: 1.1, perks: 'Bonus redemption rate' },
  { name: 'Platinum',   color: '#E5E4E2', starCount: 4, minPoints:  150000, multiplier: 1.25, perks: 'Priority support' },
  { name: 'Diamond',    color: '#60A5FA', starCount: 4, minPoints:  300000, multiplier: 1.5, perks: 'Elite fares' },
  { name: 'Ambassador', color: '#7B61FF', starCount: 5, minPoints:  500000, multiplier: 2.0, perks: 'Top reward rate' },
];

interface Program {
  isEnabled: boolean;
  referrerRewardType: string;
  referrerRewardValue: number;
  refereeRewardType: string;
  refereeRewardValue: number;
  payoutCurrency: string;
  heroTitle: string;
  heroSubtitle: string;
  termsText: string | null;
  tiers: Tier[];
}

export default function ReferLandingPage() {
  const isLoggedIn = useAuthStore((state) => Boolean(state.user));
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    captureReferralFromUrl();
    (async () => {
      try {
        const data = (await api.get('/referrals/program')) as Program;
        setProgram(data);
      } catch {
        setProgram(null);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <Gift className="w-10 h-10 mx-auto mb-4 text-rose-400" />
          <h1 className="font-display text-2xl font-bold mb-2">Refer & Earn is temporarily unavailable</h1>
          <p className="text-sm text-on-surface-variant mb-4">
            We could not load the rewards program. Please try again shortly.
          </p>
          <Button onClick={() => window.location.reload()}>Try again</Button>
        </Card>
      </div>
    );
  }

  if (!program || !program.isEnabled) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <Gift className="w-10 h-10 mx-auto mb-4 text-accent" />
          <h1 className="font-display text-2xl font-bold mb-2">Refer & Earn — coming soon</h1>
          <p className="text-sm text-on-surface-variant mb-4">
            We&apos;re polishing our rewards program. Check back shortly to start earning on every friend you refer.
          </p>
          <Link href="/">
            <Button>Back to home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const referrerRewardText =
    program.referrerRewardType === 'percentage'
      ? `${program.referrerRewardValue}%`
      : `${formatCurrency(program.referrerRewardValue, program.payoutCurrency)}`;
  const refereeRewardText =
    program.refereeRewardType === 'percentage'
      ? `${program.refereeRewardValue}%`
      : `${formatCurrency(program.refereeRewardValue, program.payoutCurrency)}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-tertiary/10 to-primary/15" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-tertiary/20 blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 py-16 sm:py-24 text-center">
          <Badge className="bg-accent/10 text-accent border-accent/30 mb-6">
            <Sparkles className="w-3 h-3 mr-1" /> Refer & Earn Program
          </Badge>
          <h1 className="font-display text-4xl sm:text-6xl font-bold text-on-surface mb-6 leading-tight">
            {program.heroTitle || 'Refer friends. Earn travel rewards.'}
          </h1>
          <p className="text-lg sm:text-xl text-on-surface-variant max-w-2xl mx-auto mb-10">
            {program.heroSubtitle}
          </p>

          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-10">
            <Card className="!p-6 bg-surface-container-high/80 backdrop-blur" hover={false}>
              <Heart className="w-8 h-8 text-accent mb-3 mx-auto" />
              <p className="text-3xl font-bold mb-1">{refereeRewardText}</p>
              <p className="text-sm text-on-surface-variant">Off for your friend on their first booking</p>
            </Card>
            <Card className="!p-6 bg-surface-container-high/80 backdrop-blur" hover={false}>
              <Gift className="w-8 h-8 text-accent mb-3 mx-auto" />
              <p className="text-3xl font-bold mb-1">{referrerRewardText}</p>
              <p className="text-sm text-on-surface-variant">Earned by you when they complete eligible bookings</p>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard/refer">
                  <Button size="lg">
                    Get my referral link <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline">
                    Go to my dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/register">
                  <Button size="lg">
                    Sign up & get {refereeRewardText} off <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline">
                    I already have an account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge className="bg-surface-container text-on-surface-variant mb-4">How it works</Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-bold">Three simple steps</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          <Card hover={false} className="text-center !p-6">
            <div className="w-12 h-12 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-bold mb-2">1. {isLoggedIn ? 'Your link is ready' : 'Sign up'}</h3>
            <p className="text-sm text-on-surface-variant">
              {isLoggedIn
                ? 'Open your referral dashboard to copy your personal referral link and see your rewards.'
                : 'Create a free FlynGo account — your personal referral link is generated automatically. New users who sign up through your link get a discount on their first booking.'}
            </p>
          </Card>
          <Card hover={false} className="text-center !p-6">
            <div className="w-12 h-12 rounded-2xl bg-tertiary/15 flex items-center justify-center mx-auto mb-4">
              <Send className="w-6 h-6 text-tertiary" />
            </div>
            <h3 className="font-bold mb-2">2. Share your link</h3>
            <p className="text-sm text-on-surface-variant">
              Send it to friends via WhatsApp, Facebook, email, or anywhere you talk to people.
            </p>
          </Card>
          <Card hover={false} className="text-center !p-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold mb-2">3. Earn on every trip</h3>
            <p className="text-sm text-on-surface-variant">
              When friends book — Hajj, Umrah, tours, hotels — you earn real cash or travel credit.
            </p>
          </Card>
        </div>
      </section>

      {/* Tier journey */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge className="bg-surface-container text-on-surface-variant mb-4">Rewards journey</Badge>
          <h2 className="font-display text-3xl sm:text-4xl font-bold">Level up as you refer &amp; travel</h2>
          <p className="text-on-surface-variant mt-3 max-w-xl mx-auto">
            Every point you earn moves you up the ladder — unlocking better redemption rates and exclusive perks.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {TIER_LADDER.map((t, i) => {
            const isFirst = i === 0;
            const isLast = i === TIER_LADDER.length - 1;
            return (
              <div
                key={t.name}
                className={`relative flex flex-col items-center p-5 rounded-2xl border text-center bg-surface-container/60 ${
                  isLast ? 'border-accent/40' : 'border-outline-variant'
                }`}
              >
                {isLast && (
                  <div
                    className="absolute -top-2.5 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow"
                    style={{ background: t.color }}
                  >
                    Elite
                  </div>
                )}
                {isFirst ? (
                  <div className="w-12 h-12 rounded-2xl bg-accent/15 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-accent" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center">
                    <Lock className="w-5 h-5 text-on-surface-variant" />
                  </div>
                )}
                <p className="mt-3 font-bold text-on-surface">{t.name}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{t.minPoints.toLocaleString()} pts</p>
                <div className="flex flex-col items-center gap-0.5 mt-2">
                  <span className="inline-flex items-center gap-0.5">
                    {Array.from({ length: t.starCount }).map((_, si) => (
                      <Star key={si} className="w-3 h-3" style={{ color: t.color, fill: t.color }} />
                    ))}
                  </span>
                  <span className="text-[10px] text-on-surface-variant">
                    {t.multiplier}× redemption · {t.perks}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          <Card hover={false} className="!p-6">
            <Plane className="w-6 h-6 text-accent mb-3" />
            <h3 className="font-bold mb-2">Real money, not just points</h3>
            <p className="text-sm text-on-surface-variant">
              Earnings are real {program.payoutCurrency} you can cash out via bKash, Nagad, bank
              transfer, PayPal, or convert to travel credit for your next booking.
            </p>
          </Card>
          <Card hover={false} className="!p-6">
            <TrendingUp className="w-6 h-6 text-accent mb-3" />
            <h3 className="font-bold mb-2">Lifetime attribution</h3>
            <p className="text-sm text-on-surface-variant">
              Earn on eligible bookings your friend completes during the attribution window.
              Top referrers can build meaningful travel rewards over time.
            </p>
          </Card>
        </div>
      </section>

      {/* Membership badges */}
      {program.tiers?.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <Badge className="bg-surface-container text-on-surface-variant mb-4">Membership badges</Badge>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">Climb the tiers as you earn</h2>
            <p className="text-on-surface-variant mt-3 max-w-2xl mx-auto">
              Every point you earn — from referrals and bookings — moves you up the ladder,
              unlocking better redemption rates and perks.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {program.tiers.map((t) => {
              const perks = t.benefits?.perks ?? [];
              return (
                <Card key={t.slug} hover={false} className="!p-6">
                  <div className="flex items-center justify-between mb-3">
                    <TierBadge name={t.name} color={t.color} starCount={t.starCount} size="md" />
                    <span className="text-xs font-bold text-on-surface-variant">
                      {t.redemptionMultiplier}x
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mb-4">
                    Earn {t.minPoints.toLocaleString()} lifetime points to unlock
                  </p>
                  <ul className="space-y-2">
                    {perks.length > 0 ? (
                      perks.map((perk, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-on-surface">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          {perk}
                        </li>
                      ))
                    ) : (
                      <li className="flex items-start gap-2 text-sm text-on-surface">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        {t.redemptionMultiplier}x redemption rate
                      </li>
                    )}
                  </ul>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Terms */}
      {program.termsText && (
        <section className="max-w-3xl mx-auto px-4 py-12">
          <Card hover={false} className="!p-6 text-xs text-on-surface-variant whitespace-pre-line">
            {program.termsText}
          </Card>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="font-display text-3xl font-bold mb-4">
          {isLoggedIn ? 'Ready to share and earn?' : 'Ready to get your discount?'}
        </h2>
        <p className="text-on-surface-variant mb-6">
          {isLoggedIn
            ? 'Share your referral link and track your rewards from your dashboard.'
            : `Sign up in 30 seconds and get ${refereeRewardText} off your first booking. Use a friend's referral link to unlock this exclusive discount.`}
        </p>
        <Link href={isLoggedIn ? '/dashboard/refer' : '/auth/register'}>
          <Button size="lg">
            {isLoggedIn ? 'Get my referral link' : 'Sign up now'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
