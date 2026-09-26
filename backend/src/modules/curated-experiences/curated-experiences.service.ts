import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface CuratedExperienceItem {
  id: string;
  badgeEn: string;
  badgeBn?: string;
  badgeTone: 'cyan' | 'amber' | 'rose' | 'emerald';
  titleEn: string;
  titleBn?: string;
  descriptionEn: string;
  descriptionBn?: string;
  locationEn: string;
  locationBn?: string;
  metaEn: string;
  metaBn?: string;
  image: string;
  ctaEn: string;
  ctaBn?: string;
  href: string;
  size: 'lg' | 'sm';
  hasPlay?: boolean;
  order?: number;
  isActive?: boolean;
}

export interface CuratedExperiencesConfigInput {
  eyebrowEn?: string;
  eyebrowBn?: string;
  titlePrefixEn?: string;
  titleHighlightEn?: string;
  titlePrefixBn?: string;
  titleHighlightBn?: string;
  subtitleEn?: string;
  subtitleBn?: string;
  actionLabelEn?: string;
  actionLabelBn?: string;
  actionHref?: string;
  statusTextEn?: string;
  statusTextBn?: string;
  items?: CuratedExperienceItem[];
  isActive?: boolean;
}

export const DEFAULT_CURATED_EXPERIENCES: CuratedExperiencesConfigInput = {
  eyebrowEn: 'Curated Experiences',
  eyebrowBn: 'বাছাইকৃত অভিজ্ঞতা',
  titlePrefixEn: 'Beyond booking.',
  titleHighlightEn: 'Beyond ordinary.',
  titlePrefixBn: 'বুকিংয়ের চেয়েও বেশি।',
  titleHighlightBn: 'সাধারণের চেয়েও অনন্য।',
  subtitleEn:
    'Bespoke itineraries designed for those who value time, texture, and the quiet luxury of detail in their global travels.',
  subtitleBn:
    'যারা বিশ্বভ্রমণে সময়, গুণমান ও আভিজাত্যকে মূল্যায়ন করেন—তাদের জন্যই আমাদের বিশেষ পরিকল্পনা।',
  actionLabelEn: 'View all experiences',
  actionLabelBn: 'সব অভিজ্ঞতা দেখুন',
  actionHref: '/destinations',
  statusTextEn: 'live · updated daily',
  statusTextBn: 'লাইভ · প্রতিদিন আপডেট',
  isActive: true,
  items: [
    {
      id: 'santorini',
      badgeEn: 'Seasonal Feature',
      badgeBn: 'মৌসুমি ফিচার',
      badgeTone: 'cyan',
      titleEn: 'The Santorini Sky Loft',
      titleBn: 'দ্য সান্তোরিনি স্কাই লফট',
      descriptionEn:
        'Private jet transfers and cliffside glass villas. Redefining the Mediterranean escape with white-glove butler service and sunset yacht access.',
      descriptionBn:
        'প্রাইভেট জেট স্থানান্তর ও ক্লিফসাইড গ্লাস ভিলা। বাটলার সেবা ও সূর্যাস্তের ইয়ট ভ্রমণসহ ভূমধ্যসাগরীয় এক অনন্য অভিজ্ঞতা।',
      locationEn: 'Santorini, Greece',
      locationBn: 'সান্তোরিনি, গ্রিস',
      metaEn: '7 nights · from $12,400',
      metaBn: '৭ রাত · $১২,৪০০ থেকে',
      image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=1600&q=80',
      ctaEn: 'Explore Destination',
      ctaBn: 'গন্তব্য দেখুন',
      href: '/destinations',
      size: 'lg',
      hasPlay: false,
      order: 1,
      isActive: true,
    },
    {
      id: 'velocity',
      badgeEn: 'Velocity Club',
      badgeBn: 'ভেলোসিটি ক্লাব',
      badgeTone: 'amber',
      titleEn: 'Priority Skies',
      titleBn: 'প্রায়োরিটি স্কাইস',
      descriptionEn: 'Access to our exclusive fleet of light jets for short-haul precision.',
      descriptionBn: 'শর্ট-হোল ভ্রমণের জন্য আমাদের বিশেষ লাইট জেট বহরে অগ্রাধিকারভিত্তিক প্রবেশাধিকার।',
      locationEn: 'Worldwide',
      locationBn: 'বিশ্বব্যাপী',
      metaEn: 'Members only',
      metaBn: 'শুধুমাত্র সদস্যদের জন্য',
      image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1200&q=80',
      ctaEn: 'Become a Member',
      ctaBn: 'মেম্বারশিপ নিন',
      href: '/booking',
      size: 'sm',
      hasPlay: true,
      order: 2,
      isActive: true,
    },
    {
      id: 'maldives',
      badgeEn: 'New Listing',
      badgeBn: 'নতুন সংযোজন',
      badgeTone: 'rose',
      titleEn: 'Overwater Private Villa',
      titleBn: 'ওভারওয়াটার প্রাইভেট ভিলা',
      descriptionEn: 'Glass-floor suites, personal dive instructor, and a chef-on-call.',
      descriptionBn: 'গ্লাস-ফ্লোর স্যুট, ব্যক্তিগত ডাইভ প্রশিক্ষক এবং সার্বক্ষণিক শেফ সেবা।',
      locationEn: 'Maldives',
      locationBn: 'মালদ্বীপ',
      metaEn: '5 nights · from $8,900',
      metaBn: '৫ রাত · $৮,৯০০ থেকে',
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=80',
      ctaEn: 'Reserve Now',
      ctaBn: 'এখনই বুক করুন',
      href: '/destinations',
      size: 'sm',
      hasPlay: false,
      order: 3,
      isActive: true,
    },
  ],
};

@Injectable()
export class CuratedExperiencesService {
  constructor(private readonly prisma: PrismaService) {}

  async getForTenant(tenantId: string) {
    let config = await this.prisma.curatedExperiencesConfig.findUnique({
      where: { tenantId },
    });

    if (!config) {
      config = await this.prisma.curatedExperiencesConfig.create({
        data: {
          tenantId,
          ...DEFAULT_CURATED_EXPERIENCES,
          items: DEFAULT_CURATED_EXPERIENCES.items as any,
        },
      });
    }

    // Ensure fallback items if empty
    let items = (config.items as unknown as CuratedExperienceItem[]) || [];
    if (!Array.isArray(items) || items.length === 0) {
      items = DEFAULT_CURATED_EXPERIENCES.items || [];
    }

    // Filter only active items for public view and sort by order
    const activeItems = items
      .filter((i) => i.isActive !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return {
      ...config,
      items: activeItems.length > 0 ? activeItems : (DEFAULT_CURATED_EXPERIENCES.items as CuratedExperienceItem[]),
    };
  }

  async getAdminForTenant(tenantId: string) {
    let config = await this.prisma.curatedExperiencesConfig.findUnique({
      where: { tenantId },
    });

    if (!config) {
      config = await this.prisma.curatedExperiencesConfig.create({
        data: {
          tenantId,
          ...DEFAULT_CURATED_EXPERIENCES,
          items: DEFAULT_CURATED_EXPERIENCES.items as any,
        },
      });
    }

    let items = (config.items as unknown as CuratedExperienceItem[]) || [];
    if (!Array.isArray(items) || items.length === 0) {
      items = DEFAULT_CURATED_EXPERIENCES.items || [];
    }

    return {
      ...config,
      items: items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    };
  }

  async getDefaults(): Promise<CuratedExperiencesConfigInput> {
    return DEFAULT_CURATED_EXPERIENCES;
  }

  async upsert(tenantId: string, data: CuratedExperiencesConfigInput) {
    const items = (data.items ?? DEFAULT_CURATED_EXPERIENCES.items) as any;

    return this.prisma.curatedExperiencesConfig.upsert({
      where: { tenantId },
      create: {
        tenantId,
        ...DEFAULT_CURATED_EXPERIENCES,
        ...data,
        items,
      },
      update: {
        ...data,
        items: data.items !== undefined ? items : undefined,
      },
    });
  }
}
