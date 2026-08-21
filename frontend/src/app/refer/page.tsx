'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import {
  Gift, Users, Wallet, TrendingUp, CheckCircle2, ArrowRight,
  MessageCircle, Send, Mail, Loader2, Sparkles, Plane, Heart,
} from 'lucide-react';
import { api } from '@/lib/api';
import { captureReferralFromUrl } from '@/lib/referral';

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
}

export default function ReferLandingPage() {
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    captureReferralFromUrl();
    (async () => {
      try {
        const data = (await api.get('/referrals/program')) as Program;
        setProgram(data);
      } catch {
        setProgram(null);
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

  if (!program || !program.isEnabled) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <Gift className="w-10 h-10 mx-auto mb-4 text-accent" />
          <h1 className="font-display text-2xl font-bold mb-2">Refer & Earn — coming soon</h1>
          <p className="text-sm text-on-surface-variant mb-4">
            We're polishing our rewards program. Check back shortly to start earning on every friend you refer.
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
              <p className="text-sm text-on-surface-variant">Earned by you on every booking they make</p>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/register">
              <Button size="lg">
                Create your account <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">
                I already have an account
              </Button>
            </Link>
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
            <h3 className="font-bold mb-2">1. Sign up</h3>
            <p className="text-sm text-on-surface-variant">
              Create a free FlynGo account — your personal referral code is generated automatically.
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
              Earn on every future booking your friend makes — not just their first.
              Top referrers regularly earn full-trip value back.
            </p>
          </Card>
        </div>
      </section>

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
        <h2 className="font-display text-3xl font-bold mb-4">Ready to start earning?</h2>
        <p className="text-on-surface-variant mb-6">
          Sign up in 30 seconds. Your referral code is generated instantly.
        </p>
        <Link href="/auth/register">
          <Button size="lg">
            Get my referral code <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
