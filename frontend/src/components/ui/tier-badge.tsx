'use client';

import { Star, Crown } from 'lucide-react';

export interface TierBadgeProps {
  name?: string | null;
  color?: string | null;
  starCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const SIZES = {
  sm: { badge: 'px-2 py-0.5 text-[10px]', icon: 'w-3 h-3', gap: 'gap-0.5' },
  md: { badge: 'px-2.5 py-1 text-xs',     icon: 'w-3.5 h-3.5', gap: 'gap-1' },
  lg: { badge: 'px-3 py-1.5 text-sm',     icon: 'w-4 h-4', gap: 'gap-1.5' },
};

export default function TierBadge({ name, color, starCount = 0, size = 'md', showLabel = true, className = '' }: TierBadgeProps) {
  if (!name) return null;
  const sz = SIZES[size];
  const bg = color || '#C0C0C0';

  return (
    <span
      className={`inline-flex items-center rounded-full font-bold border border-white/20 shadow-sm ${sz.badge} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${bg}33, ${bg}66)`,
        color: '#fff',
        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
      }}
      title={`${name} — ${starCount}★`}
    >
      <Crown className={`${sz.icon} flex-shrink-0`} style={{ color: bg }} />
      {showLabel && <span className={sz.gap}>{name}</span>}
      {starCount > 0 && (
        <span className={`flex items-center ${sz.gap} ml-1`}>
          {Array.from({ length: Math.min(starCount, 5) }).map((_, i) => (
            <Star key={i} className={sz.icon} style={{ color: bg, fill: bg }} />
          ))}
        </span>
      )}
    </span>
  );
}
