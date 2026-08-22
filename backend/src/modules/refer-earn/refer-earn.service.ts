import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface ReferEarnPopoverInput {
  badgeTextEn?: string;
  badgeTextBn?: string;
  titleEn?: string;
  titleBn?: string;
  bodyEn?: string;
  bodyBn?: string;
  rewardAmountEn?: string;
  rewardAmountBn?: string;
  rewardLabelEn?: string;
  rewardLabelBn?: string;
  currencyCode?: string;
  ctaTextEn?: string;
  ctaTextBn?: string;
  ctaHref?: string;
  imageUrl?: string;
  iconName?: string;
  isActive?: boolean;
  delaySeconds?: number;
  dismissDays?: number;
  showOnPaths?: string;
}

const DEFAULT_POPOVER: ReferEarnPopoverInput = {
  badgeTextEn: 'Refer & Earn',
  badgeTextBn: 'রেফার ও আয়',
  titleEn: 'Give ৳500, Get ৳500',
  titleBn: 'দিন ৳৫০০, নিন ৳৫০০',
  bodyEn:
    'Share your unique referral link with friends. When they complete their first booking, you both earn travel credit.',
  bodyBn:
    'আপনার রেফারেল লিঙ্ক বন্ধুদের সাথে শেয়ার করুন। তারা প্রথম বুকিং সম্পন্ন করলে আপনারা দুজনেই ট্রাভেল ক্রেডিট পাবেন।',
  rewardAmountEn: '৳500',
  rewardAmountBn: '৳৫০০',
  rewardLabelEn: 'per friend',
  rewardLabelBn: 'প্রতি বন্ধু',
  currencyCode: 'BDT',
  ctaTextEn: 'Get my referral link',
  ctaTextBn: 'আমার রেফারেল লিঙ্ক নিন',
  ctaHref: '/dashboard',
  iconName: 'Gift',
  isActive: true,
  delaySeconds: 8,
  dismissDays: 7,
  showOnPaths: '/',
};

@Injectable()
export class ReferEarnService {
  constructor(private readonly prisma: PrismaService) {}

  async getForTenant(tenantId: string) {
    let popover = await this.prisma.referEarnPopover.findUnique({ where: { tenantId } });
    if (!popover) {
      popover = await this.prisma.referEarnPopover.create({
        data: { tenantId, ...DEFAULT_POPOVER },
      });
    }
    return popover;
  }

  async getDefaults(): Promise<ReferEarnPopoverInput> {
    return DEFAULT_POPOVER;
  }

  async upsert(tenantId: string, data: ReferEarnPopoverInput) {
    return this.prisma.referEarnPopover.upsert({
      where: { tenantId },
      create: { tenantId, ...DEFAULT_POPOVER, ...data },
      update: { ...data },
    });
  }

  async remove(tenantId: string) {
    const existing = await this.prisma.referEarnPopover.findUnique({ where: { tenantId } });
    if (existing) {
      await this.prisma.referEarnPopover.delete({ where: { tenantId } });
    }
    return { deleted: true };
  }
}
