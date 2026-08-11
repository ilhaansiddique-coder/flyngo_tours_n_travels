import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface HeroStat {
  value: string;
  labelEn: string;
  labelBn?: string;
}

export interface HeroSectionInput {
  badgeTextEn?: string;
  badgeTextBn?: string;
  titleLineAEn?: string;
  titleLineABn?: string;
  titleLineBEn?: string;
  titleLineBBn?: string;
  titleLineCEn?: string;
  titleLineCBn?: string;
  subtitleEn?: string;
  subtitleBn?: string;
  ctaExploreEn?: string;
  ctaExploreBn?: string;
  ctaVisaEn?: string;
  ctaVisaBn?: string;
  ctaDestinationsEn?: string;
  ctaDestinationsBn?: string;
  stats?: HeroStat[];
  quickPlaces?: string[];
  isActive?: boolean;
}

const DEFAULT_HERO: HeroSectionInput = {
  badgeTextEn: 'Trusted by 50,000+ travelers',
  badgeTextBn: '৫০,০০০+ যাত্রীর বিশ্বস্ত পছন্দ',
  titleLineAEn: 'Your escape,',
  titleLineABn: 'আপনার ছুটি,',
  titleLineBEn: 'purely refined.',
  titleLineBBn: 'সম্পূর্ণ পরিশীলিত।',
  titleLineCEn: 'Discover the world with FlynGo.',
  titleLineCBn: 'FlynGo এর সাথে বিশ্ব আবিষ্কার করুন।',
  subtitleEn:
    'White-glove travel concierge for flights, hotels, tours, visas, and Hajj & Umrah — managed by people who actually pick up the phone.',
  subtitleBn:
    'ফ্লাইট, হোটেল, ট্যুর, ভিসা এবং হজ্জ ও ওমরাহ — মানুষের হাতে পরিচালিত হোয়াইট-গ্লাভ ট্রাভেল পরিষেবা।',
  ctaExploreEn: 'Explore Tours',
  ctaExploreBn: 'ট্যুর দেখুন',
  ctaVisaEn: 'Visa Services',
  ctaVisaBn: 'ভিসা সেবা',
  ctaDestinationsEn: 'Destinations',
  ctaDestinationsBn: 'গন্তব্য',
  stats: [
    { value: '500+', labelEn: 'Destinations', labelBn: 'গন্তব্য' },
    { value: '50K+', labelEn: 'Happy travelers', labelBn: 'খুশি যাত্রী' },
    { value: '1K+', labelEn: 'Tour packages', labelBn: 'ট্যুর প্যাকেজ' },
    { value: '24/7', labelEn: 'Concierge', labelBn: 'পরিষেবা' },
  ],
  quickPlaces: ['Bali', 'Dubai', 'Maldives', 'Switzerland', 'Thailand'],
  isActive: true,
};

@Injectable()
export class HeroService {
  constructor(private readonly prisma: PrismaService) { }

  async getForTenant(tenantId: string) {
    let section = await this.prisma.heroSection.findUnique({ where: { tenantId } });
    if (!section) {
      section = await this.prisma.heroSection.create({
        data: { tenantId, ...DEFAULT_HERO, stats: DEFAULT_HERO.stats as any },
      });
    }
    return section;
  }

  async upsert(tenantId: string, data: HeroSectionInput) {
    const stats = (data.stats ?? undefined) as any;
    return this.prisma.heroSection.upsert({
      where: { tenantId },
      create: {
        tenantId,
        ...DEFAULT_HERO,
        ...data,
        stats: stats ?? DEFAULT_HERO.stats,
      },
      update: {
        ...data,
        stats: stats ?? undefined,
      },
    });
  }

  async getDefaults(): Promise<HeroSectionInput> {
    return DEFAULT_HERO;
  }
}
