export interface LoyaltyTierConfig {
  name: string;
  slug: string;
  color: string;
  starCount: number;
  threshold: number;
  multiplier: number;
  sortOrder: number;
}

export const LOYALTY_TIER_CONFIG: LoyaltyTierConfig[] = [
  // Base tier every member starts on (0 points). Slug stays "none" so it keeps
  // matching existing rows; only the display name is "Beginner".
  { name: 'Beginner', slug: 'none', color: '#94A3B8', starCount: 0, threshold: 0, multiplier: 1, sortOrder: 0 },
  { name: 'Silver', slug: 'silver', color: '#C0C0C0', starCount: 1, threshold: 10000, multiplier: 1, sortOrder: 1 },
  { name: 'Gold', slug: 'gold', color: '#FFD700', starCount: 2, threshold: 50000, multiplier: 1.1, sortOrder: 2 },
  { name: 'Platinum', slug: 'platinum', color: '#E5E4E2', starCount: 4, threshold: 150000, multiplier: 1.25, sortOrder: 3 },
  { name: 'Diamond', slug: 'diamond', color: '#60A5FA', starCount: 4, threshold: 300000, multiplier: 1.5, sortOrder: 4 },
  { name: 'Ambassador', slug: 'ambassador', color: '#7B61FF', starCount: 5, threshold: 500000, multiplier: 2, sortOrder: 5 },
];

export function tierBenefits(slug: string) {
  const benefits: Record<string, { description: string; perks: string[] }> = {
    none: { description: 'Start earning FlyNGo Rewards points', perks: [] },
    silver: { description: 'Welcome to FlyNGo Rewards', perks: ['1.0x redemption rate', 'Standard support'] },
    gold: { description: 'Loyalty recognized', perks: ['1.1x redemption rate', 'Priority email support'] },
    platinum: { description: 'High-tier perks unlocked', perks: ['1.25x redemption rate', 'Priority chat support'] },
    diamond: { description: 'Diamond-class service', perks: ['1.5x redemption rate', 'Dedicated account manager'] },
    ambassador: { description: 'Our highest tier', perks: ['2.0x redemption rate', 'Concierge service', 'Exclusive deals'] },
  };
  return benefits[slug] ?? { description: slug, perks: [] };
}
