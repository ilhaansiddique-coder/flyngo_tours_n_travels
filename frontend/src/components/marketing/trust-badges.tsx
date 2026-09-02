'use client';

import { useEffect, useState } from 'react';
import { Shield, Award, BadgeCheck, Star, Users, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

interface TrustSettings {
  trustBadges: Array<{ label: string; icon?: string; url?: string }>;
  customerCount: number;
  yearsInBusiness: number;
}

const ICON_MAP: Record<string, any> = {
  shield: Shield,
  award: Award,
  badge: BadgeCheck,
  star: Star,
  users: Users,
  sparkles: Sparkles,
};

export function TrustBadges() {
  const [s, setS] = useState<TrustSettings | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = (await api.get('/tracking/settings/public')) as any;
        setS({
          trustBadges: res.trustBadges ?? [],
          customerCount: res.customerCount ?? 0,
          yearsInBusiness: res.yearsInBusiness ?? 0,
        });
      } catch { /* silent */ }
    })();
  }, []);

  if (!s) return null;
  if (!s.trustBadges?.length && !s.customerCount && !s.yearsInBusiness) return null;

  const badges = (s.trustBadges ?? []).filter((b) => b.label);

  return (
    <section className="py-8 border-y border-outline-variant bg-surface-container/40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 items-center">
          {s.customerCount > 0 && (
            <Stat icon={Users} label="Happy travelers" value={s.customerCount.toLocaleString() + '+'} />
          )}
          {s.yearsInBusiness > 0 && (
            <Stat icon={Award} label="Years in business" value={s.yearsInBusiness + '+'} />
          )}
          {badges.map((b, i) => {
            const Icon = ICON_MAP[b.icon ?? 'badge'] ?? BadgeCheck;
            const inner = (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-container border border-outline-variant">
                <Icon className="w-5 h-5 text-accent shrink-0" />
                <span className="text-xs font-semibold">{b.label}</span>
              </div>
            );
            return b.url ? (
              <a key={i} href={b.url} target="_blank" rel="noopener noreferrer">{inner}</a>
            ) : (
              <div key={i}>{inner}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container border border-outline-variant">
      <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <div>
        <p className="text-lg font-bold leading-tight">{value}</p>
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">{label}</p>
      </div>
    </div>
  );
}
