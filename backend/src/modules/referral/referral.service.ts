import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { Prisma } from '@prisma/client';

export interface ShareMessageTemplates {
  whatsapp: string;
  facebook: string;
  twitter: string;
  telegram: string;
  email_subject: string;
  email_body: string;
  signup_banner: string;
}

export const DEFAULT_SHARE_TEMPLATES: ShareMessageTemplates = {
  whatsapp:
    'Join me on {brand} and get {refereeReward} on your first booking! Use my code: {referralCode} {shareLink}',
  facebook: 'I just joined {brand} — they offer {refereeReward} off your first booking. Use my code {referralCode}',
  twitter: 'Save {refereeReward} on your first {brand} booking with my code {referralCode}',
  telegram: 'Try {brand} — {refereeReward} off with code {referralCode}',
  email_subject: 'Travel with me on {brand}',
  email_body:
    'Use my code {referralCode} and get {refereeReward} on your first booking: {shareLink}',
  signup_banner: 'You were invited with code {referralCode} — you will get a welcome discount.',
};

export const SHARE_TEMPLATE_VARS = [
  'brand',
  'refereeReward',
  'referrerReward',
  'referralCode',
  'shareLink',
  'refereeName',
] as const;

export type ShareTemplateVar = (typeof SHARE_TEMPLATE_VARS)[number];

export interface ShareTemplateContext {
  brand: string;
  refereeReward: string;
  referrerReward: string;
  referralCode: string;
  shareLink: string;
  refereeName?: string;
}

export function resolveShareTemplate(
  template: string | undefined,
  ctx: ShareTemplateContext,
): string {
  if (!template) return '';
    return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    if (key === 'refereeName' && !ctx.refereeName) return '';
    const value = (ctx as unknown as Record<string, string | undefined>)[key];
    return value ?? '';
  });
}

function mergeShareTemplates(
  stored: Prisma.JsonValue | null | undefined,
): ShareMessageTemplates {
  const fallback = { ...DEFAULT_SHARE_TEMPLATES };
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return fallback;
  const obj = stored as Record<string, unknown>;
  const out: ShareMessageTemplates = { ...fallback };
  for (const key of Object.keys(fallback) as (keyof ShareMessageTemplates)[]) {
    const v = obj[key];
    if (typeof v === 'string' && v.trim().length > 0) {
      out[key] = v;
    }
  }
  return out;
}

export interface ReferralRewardBreakdown {
  referrerRewardType: string;
  referrerRewardValue: number;
  referrerMaxReward: number | null;
  refereeRewardType: string;
  refereeRewardValue: number;
  refereeMaxReward: number | null;
}

@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly loyaltyService: LoyaltyService,
  ) {}

  // ---------------------------------------------------------------------------
  // Settings
  // ---------------------------------------------------------------------------

  async getSettings(tenantId: string) {
    let settings = await this.prisma.referralSetting.findUnique({ where: { tenantId } });
    if (!settings) {
      settings = await this.prisma.referralSetting.create({ data: { tenantId } });
    }
    return settings;
  }

  async updateSettings(tenantId: string, body: any) {
    const data: Prisma.ReferralSettingUpdateInput = {
      isEnabled: body.isEnabled,
      referrerRewardType: body.referrerRewardType,
      referrerRewardValue: body.referrerRewardValue,
      referrerMaxReward: body.referrerMaxReward,
      defaultAffiliateType: body.defaultAffiliateType,
      fixedCommissionType: body.fixedCommissionType,
      fixedCommissionValue: body.fixedCommissionValue,
      commissionlessSignupPoints: body.commissionlessSignupPoints,
      refereeRewardType: body.refereeRewardType,
      refereeRewardValue: body.refereeRewardValue,
      refereeMaxReward: body.refereeMaxReward,
      cookieWindowDays: body.cookieWindowDays,
      minPayoutAmount: body.minPayoutAmount,
      payoutCurrency: body.payoutCurrency,
      conversionStatuses: body.conversionStatuses,
      heroTitle: body.heroTitle,
      heroSubtitle: body.heroSubtitle,
      termsText: body.termsText,
    };
    if (body.shareMessageTemplates !== undefined) {
      const merged = mergeShareTemplates(body.shareMessageTemplates);
      (data as any).shareMessageTemplates = merged as any;
    }
    Object.keys(data).forEach((k) => (data as any)[k] === undefined && delete (data as any)[k]);
    if (
      data.defaultAffiliateType !== undefined &&
      !['fixed_commission', 'commission_less'].includes(data.defaultAffiliateType as string)
    ) {
      throw new BadRequestException('defaultAffiliateType must be fixed_commission or commission_less');
    }
    if (
      data.fixedCommissionType !== undefined &&
      !['percentage', 'fixed'].includes(data.fixedCommissionType as string)
    ) {
      throw new BadRequestException('fixedCommissionType must be percentage or fixed');
    }

    return this.prisma.referralSetting.upsert({
      where: { tenantId },
      update: data,
      create: { tenantId, ...(data as any) },
    });
  }

  // ---------------------------------------------------------------------------
  // Code generation
  // ---------------------------------------------------------------------------

  private generateCode(): string {
    // 8-char alphanumeric, uppercase, no ambiguous chars (0/O, 1/I/L)
    const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < 8; i++) {
      out += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return out;
  }

  async generateUniqueCode(): Promise<string> {
    for (let attempt = 0; attempt < 8; attempt++) {
      const code = this.generateCode();
      const exists = await this.prisma.user.findFirst({ where: { referralCode: code } });
      if (!exists) return code;
    }
    // Fallback with timestamp suffix if we somehow kept colliding
    return `${this.generateCode()}${Date.now().toString(36).slice(-3).toUpperCase()}`;
  }

  // ---------------------------------------------------------------------------
  // Public endpoints
  // ---------------------------------------------------------------------------

  /** Look up a referral code — used by the signup form to preview the referrer. */
  async lookupCode(code: string) {
    if (!code || typeof code !== 'string') return { valid: false };
    const normalized = code.trim().toUpperCase();
    const user = await this.prisma.user.findFirst({
      where: { referralCode: normalized, deletedAt: null, isActive: true },
      select: { fullName: true },
    });
    return user
      ? { valid: true, code: normalized, referrerName: user.fullName.split(' ')[0] }
      : { valid: false };
  }

  /** Public landing page — branding copy + program summary + tier ladder. */
  async getPublicProgram(tenantId: string) {
    const settings = await this.getSettings(tenantId);
    const tiers = await this.loyaltyService.listTiers(tenantId);
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true },
    });
    return {
      isEnabled: settings.isEnabled,
      brand: tenant?.name || 'FlynGo',
      referrerRewardType: settings.referrerRewardType,
      referrerRewardValue: Number(settings.referrerRewardValue),
      refereeRewardType: settings.refereeRewardType,
      refereeRewardValue: Number(settings.refereeRewardValue),
      refereeRewardText: this.formatRewardText(
        settings.refereeRewardType,
        Number(settings.refereeRewardValue),
        settings.payoutCurrency,
      ),
      payoutCurrency: settings.payoutCurrency,
      heroTitle: settings.heroTitle || 'Refer friends, earn rewards',
      heroSubtitle:
        settings.heroSubtitle ||
        'Share your link. Friends get a discount. You earn cash or credit on eligible bookings they complete.',
      termsText: settings.termsText,
      shareMessageTemplates: mergeShareTemplates((settings as any).shareMessageTemplates),
      tiers: tiers.map((t) => ({
        name: t.name,
        slug: t.slug,
        color: t.color,
        starCount: t.starCount,
        minPoints: Number(t.minPoints),
        redemptionMultiplier: Number(t.redemptionMultiplier),
        benefits: t.benefits,
      })),
    };
  }

  /**
   * Resolve a per-channel share message template with variables substituted.
   * Public — no auth required — so the signup form can preview the message
   * the user's referrer would have shared.
   */
  async resolveShareMessage(tenantId: string, channel: string, code?: string) {
    const settings = await this.getSettings(tenantId);
    const templates = mergeShareTemplates((settings as any).shareMessageTemplates);
    const templateKey = (channel || '').toLowerCase();
    const template = (templates as unknown as Record<string, string>)[templateKey];
    if (template === undefined) {
      throw new BadRequestException(
        `Unknown channel '${channel}'. Valid: ${Object.keys(templates).join(', ')}`,
      );
    }
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true },
    });
    const brand = tenant?.name || 'FlynGo';
    const refereeReward = this.formatRewardText(
      settings.refereeRewardType,
      Number(settings.refereeRewardValue),
      settings.payoutCurrency,
    );
    const referrerReward = this.formatRewardText(
      settings.referrerRewardType,
      Number(settings.referrerRewardValue),
      settings.payoutCurrency,
    );
    const referralCode = (code || '').toUpperCase();
    const origin = process.env.FRONTEND_URL || process.env.ADMIN_URL || 'https://flyngo.world';
    const shareLink = referralCode
      ? `${origin.replace(/\/$/, '')}/?ref=${encodeURIComponent(referralCode)}`
      : '';
    const text = resolveShareTemplate(template, {
      brand,
      refereeReward,
      referrerReward,
      referralCode,
      shareLink,
    });
    return {
      channel: templateKey,
      text,
      template,
      variables: { brand, refereeReward, referrerReward, referralCode, shareLink },
    };
  }

  private formatRewardText(type: string, value: number, currency: string): string {
    if (type === 'percentage') return `${value}% off`;
    return `${value} ${currency} off`;
  }

  // ---------------------------------------------------------------------------
  // Auth integration — called by AuthService.register
  // ---------------------------------------------------------------------------

  async onUserVerified(tenantId: string, userId: string) {
    return this.loyaltyService.onUserVerified(tenantId, userId);
  }

  /** Signup bonus — award a new user their signup points (default 100). */
  async awardSignupBonus(tenantId: string, userId: string) {
    return this.loyaltyService.awardSignupBonus(tenantId, userId);
  }

  /**
   * Returns:
   *  - referralCode to assign to the new user
   *  - referrerAffiliateId to attribute the signup to (may be null)
   *  - referrerReward snapshot
   */
  async prepareRegistration(tenantId: string, refCodeFromCookie: string | null) {
    const settings = await this.getSettings(tenantId);
    if (!settings.isEnabled) {
      return { referralCode: await this.generateUniqueCode(), referrerAffiliateId: null };
    }

    let referrerAffiliateId: string | null = null;
    if (refCodeFromCookie) {
      const code = refCodeFromCookie.trim().toUpperCase();
      const referrer = await this.prisma.user.findFirst({
        where: { referralCode: code, deletedAt: null, isActive: true },
        select: { id: true, affiliate: { select: { id: true, isActive: true } } },
      });
      if (referrer?.affiliate?.isActive) {
        referrerAffiliateId = referrer.affiliate.id;
      }
    }

    return {
      referralCode: await this.generateUniqueCode(),
      referrerAffiliateId,
    };
  }

  /**
   * Called right after a user is created. Sets `referralCode` + `referredByCode`
   * on the user, ensures an Affiliate row exists, and registers the pending
   * referral (if any) so we can track conversion later.
   */
  async finalizeRegistration(
    tenantId: string,
    newUser: { id: string; fullName: string; referralCode: string; phone?: string | null },
    refCodeFromCookie: string | null,
  ) {
    const settings = await this.getSettings(tenantId);

    // 1) Persist referralCode + referredByCode on the user
    const referredByCode = refCodeFromCookie ? refCodeFromCookie.trim().toUpperCase() : null;
    await this.prisma.user.update({
      where: { id: newUser.id },
      data: { referralCode: newUser.referralCode, referredByCode },
    });

    // 2) Ensure an Affiliate row exists for the new user
    //    Type comes from program defaults:
    //    - fixed_commission → rate = settings.fixedCommissionValue
    //    - commission_less  → points-only, no cash commissions
    const affiliateType =
      settings.defaultAffiliateType === 'commission_less' ? 'commission_less' : 'fixed_commission';
    const affiliate = await this.prisma.affiliate.upsert({
      where: { userId: newUser.id },
      update: {},
      create: {
        tenantId,
        userId: newUser.id,
        referralCode: newUser.referralCode,
        affiliateType,
        commissionRate: affiliateType === 'fixed_commission'
          ? Number(settings.fixedCommissionValue)
          : 0,
      },
    });

    // 3) Track the referral relationship if a referrer code was supplied
    if (referredByCode && settings.isEnabled) {
      const referrer = await this.prisma.user.findFirst({
        where: { referralCode: referredByCode, deletedAt: null },
        select: { id: true, phone: true, affiliate: { select: { id: true, affiliateType: true } } },
      });
      const samePhone = referrer?.phone && newUser.phone
        ? referrer.phone.replace(/\D/g, '') === newUser.phone.replace(/\D/g, '')
        : false;
      if (referrer?.affiliate && referrer.id !== newUser.id && !samePhone) {
        try {
          await this.prisma.affiliateReferral.upsert({
            where: { tenantId_referredUserId: { tenantId, referredUserId: newUser.id } },
            update: { status: 'registered', registeredAt: new Date(), affiliateId: referrer.affiliate.id },
            create: {
              tenantId,
              affiliateId: referrer.affiliate.id,
              referredUserId: newUser.id,
              status: 'registered',
              registeredAt: new Date(),
            },
          });
          await this.notifications.sendEmail(
            // We don't have email here reliably — log instead
            '',
            'You just referred a new member!',
            'referral_signup',
            { referrerName: referrer.id, referredName: newUser.fullName },
          );
          this.logger.log(
            `Referral signup: referrer=${referrer.id} (aff=${referrer.affiliate.id}) -> referred=${newUser.id}`,
          );
        } catch (err: any) {
          this.logger.warn(`Could not record referral relationship: ${err.message}`);
        }
      }
    }

    return { affiliateId: affiliate.id, referralCode: newUser.referralCode };
  }

  // ---------------------------------------------------------------------------
  // User self-service
  // ---------------------------------------------------------------------------

  async getMyReferralSummary(tenantId: string, userId: string) {
    const [user, affiliate, settings] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, fullName: true, referralCode: true, referredByCode: true },
      }),
      this.prisma.affiliate.findUnique({
        where: { userId },
        include: {
          referrals: {
            orderBy: { createdAt: 'desc' },
            take: 25,
            include: {
              // We have to look up the referred user's name through a join
            },
          },
          commissions: { orderBy: { createdAt: 'desc' }, take: 25 },
          payouts: { orderBy: { createdAt: 'desc' }, take: 10 },
          ledger: { orderBy: { createdAt: 'desc' }, take: 25 },
        },
      }),
      this.getSettings(tenantId),
    ]);

    if (!user) throw new NotFoundException('User not found');

    // If user has no affiliate yet (legacy users) — bootstrap one
    let aff = affiliate;
    if (!aff) {
      const code = user.referralCode || (await this.generateUniqueCode());
      aff = await this.prisma.affiliate.upsert({
        where: { userId },
        update: {},
        create: {
          tenantId,
          userId,
          referralCode: code,
          commissionRate: Number(settings.referrerRewardValue),
        },
        include: {
          referrals: { orderBy: { createdAt: 'desc' }, take: 25 },
          commissions: { orderBy: { createdAt: 'desc' }, take: 25 },
          payouts: { orderBy: { createdAt: 'desc' }, take: 10 },
          ledger: { orderBy: { createdAt: 'desc' }, take: 25 },
        },
      });
      if (!user.referralCode) {
        await this.prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
      }
    }

    // Hydrate referred user names
    const referredUserIds = (aff.referrals || []).map((r) => r.referredUserId);
    const referredUsers = referredUserIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: referredUserIds } },
          select: { id: true, fullName: true, createdAt: true },
        })
      : [];
    const userMap = new Map(referredUsers.map((u) => [u.id, u]));

    const referralsHydrated = (aff.referrals || []).map((r) => ({
      ...r,
      referredUser: userMap.get(r.referredUserId) || null,
    }));

    const summary = {
      user: {
        id: user.id,
        fullName: user.fullName,
        referralCode: aff.referralCode,
        referredByCode: user.referredByCode,
      },
      // Affiliation type + effective earning conditions for this user
      affiliate: {
        id: aff.id,
        affiliateType: (aff as any).affiliateType ?? 'fixed_commission',
        commissionRate: Number((aff as any).commissionRate),
        rewardBasis: settings.referrerRewardType,
        isActive: (aff as any).isActive,
      },
      conditions:
        ((aff as any).affiliateType ?? 'fixed_commission') === 'commission_less'
          ? {
              type: 'commission_less' as const,
              label: `Earn ${Number(settings.commissionlessSignupPoints)} points per friend who signs up`,
              payoutEligible: false,
            }
          : {
              type: 'fixed_commission' as const,
              label:
                settings.referrerRewardType === 'percentage'
                  ? `Earn ${Number((aff as any).commissionRate)}% commission on eligible bookings your friends complete`
                  : `Earn ${settings.payoutCurrency} ${Number((aff as any).commissionRate)} on eligible bookings your friends complete`,
              payoutEligible: true,
            },
      settings: {
        referrerRewardType: settings.referrerRewardType,
        referrerRewardValue: Number(settings.referrerRewardValue),
        refereeRewardType: settings.refereeRewardType,
        refereeRewardValue: Number(settings.refereeRewardValue),
        payoutCurrency: settings.payoutCurrency,
        minPayoutAmount: Number(settings.minPayoutAmount),
        cookieWindowDays: settings.cookieWindowDays,
        isEnabled: settings.isEnabled,
      },
      shareMessageTemplates: mergeShareTemplates((settings as any).shareMessageTemplates),
      totals: {
        referrals: await this.prisma.affiliateReferral.count({
          where: { tenantId, affiliateId: aff.id },
        }),
        converted: await this.prisma.affiliateReferral.count({
          where: { tenantId, affiliateId: aff.id, status: 'converted' },
        }),
        pendingCommission: (
          await this.prisma.affiliateCommission.aggregate({
            where: { tenantId, affiliateId: aff.id, status: 'pending' },
            _sum: { amount: true },
          })
        )._sum.amount
          ? Number((await this.prisma.affiliateCommission.aggregate({
              where: { tenantId, affiliateId: aff.id, status: 'pending' },
              _sum: { amount: true },
            }))._sum.amount)
          : 0,
        paidCommission: (
          await this.prisma.affiliateCommission.aggregate({
            where: { tenantId, affiliateId: aff.id, status: 'paid' },
            _sum: { amount: true },
          })
        )._sum.amount
          ? Number((await this.prisma.affiliateCommission.aggregate({
              where: { tenantId, affiliateId: aff.id, status: 'paid' },
              _sum: { amount: true },
            }))._sum.amount)
          : 0,
        totalEarnings: Number(aff.totalEarnings),
        availableBalance:
          Number(aff.totalEarnings) -
          ((await this.prisma.referralPayout.aggregate({
            where: { tenantId, affiliateId: aff.id, status: { in: ['pending', 'processing', 'paid'] } },
            _sum: { amount: true },
          }))._sum.amount
            ? Number((await this.prisma.referralPayout.aggregate({
                where: { tenantId, affiliateId: aff.id, status: { in: ['pending', 'processing', 'paid'] } },
                _sum: { amount: true },
              }))._sum.amount)
            : 0),
      },
      referrals: referralsHydrated,
      commissions: aff.commissions,
      payouts: aff.payouts,
      ledger: aff.ledger,
      loyalty: await this.loyaltyService.getTierSummary(tenantId, userId),
    };

    return summary;
  }

  /** Resolve an active referral discount for a user at booking time. */
  async resolveDiscountForUser(tenantId: string, userId: string, bookingSubtotal: number) {
    const settings = await this.getSettings(tenantId);
    if (!settings.isEnabled) return { discount: 0, code: null };

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { referredByCode: true, createdAt: true },
    });
    if (!user?.referredByCode) return { discount: 0, code: null };

    // The referral row is created during registration. A registered referral
    // can claim one introductory discount; converted/cancelled referrals may
    // still earn the referrer commission but cannot reuse the friend discount.
    const referral = await this.prisma.affiliateReferral.findUnique({
      where: { tenantId_referredUserId: { tenantId, referredUserId: userId } },
      select: { id: true, status: true, discountUsedAt: true },
    });
    if (
      !referral ||
      !['pending', 'registered'].includes(referral.status) ||
      referral.discountUsedAt
    ) {
      return { discount: 0, code: null };
    }

    // Cookie window — only count referrals that converted within N days of signup
    const ageDays = (Date.now() - new Date(user.createdAt).getTime()) / 86_400_000;
    if (ageDays > settings.cookieWindowDays) {
      // Stale referral — auto-clear so we don't keep applying it forever
      await this.prisma.user.update({
        where: { id: userId },
        data: { referredByCode: null },
      });
      return { discount: 0, code: null };
    }

    const reward = this.computeReward(
      bookingSubtotal,
      settings.refereeRewardType,
      Number(settings.refereeRewardValue),
      settings.refereeMaxReward ? Number(settings.refereeMaxReward) : null,
    );

    if (reward <= 0) return { discount: 0, code: null };

    // Claim atomically so two simultaneous checkout requests cannot both use
    // the one-time referee discount.
    const claimed = await this.prisma.affiliateReferral.updateMany({
      where: {
        id: referral.id,
        status: { in: ['pending', 'registered'] },
        discountUsedAt: null,
      },
      data: { discountUsedAt: new Date() },
    });
    if (claimed.count !== 1) return { discount: 0, code: null };

    return { discount: reward, code: user.referredByCode };
  }

  /**
   * Apply referral attribution to a booking. Called from BookingService.
   *  - marks the AffiliateReferral as converted
   *  - for fixed_commission referrers: creates an AffiliateCommission at the
   *    affiliate's own rate, writes a ledger entry and bumps totalEarnings
   *  - for commission_less referrers: conversion is recorded but NO cash
   *    commission is generated (they earn loyalty points on signup instead)
   */
  async recordBookingConversion(
    tenantId: string,
    args: {
      bookingId: string;
      userId: string;
      bookingTotal: number;
      bookingCurrency: string;
      status: string;
    },
  ) {
    const settings = await this.getSettings(tenantId);
    if (!settings.isEnabled) return null;
    if (!settings.conversionStatuses.includes(args.status)) return null;

    const user = await this.prisma.user.findUnique({
      where: { id: args.userId },
      select: { referredByCode: true, createdAt: true },
    });
    if (!user?.referredByCode) return null;

    // Cookie-window guard
    const ageDays = (Date.now() - new Date(user.createdAt).getTime()) / 86_400_000;
    if (ageDays > settings.cookieWindowDays) return null;

    const referrer = await this.prisma.user.findFirst({
      where: { referralCode: user.referredByCode, deletedAt: null },
      select: {
        id: true,
        affiliate: { select: { id: true, isActive: true, affiliateType: true, commissionRate: true } },
      },
    });
    const affiliate = referrer?.affiliate;
    if (!referrer || !affiliate?.isActive) return null;

    const isCommissionLess = affiliate.affiliateType === 'commission_less';

    // Referee reward (friend's discount) always follows program settings.
    const refereeReward = this.computeReward(
      args.bookingTotal,
      settings.refereeRewardType,
      Number(settings.refereeRewardValue),
      settings.refereeMaxReward ? Number(settings.refereeMaxReward) : null,
    );

    // Referrer cash reward:
    //  - fixed_commission → the affiliate's own rate (admin-managed per user)
    //  - commission_less  → 0
    const referrerReward = isCommissionLess
      ? 0
      : this.computeReward(
          args.bookingTotal,
          settings.referrerRewardType,
          Number(affiliate.commissionRate),
          settings.referrerMaxReward ? Number(settings.referrerMaxReward) : null,
        );

    const result = await this.prisma.$transaction(async (db) => {
      // Claim the booking once. This makes repeated status updates safe and
      // keeps the referral row, commission, ledger, and balance in sync.
      const claimedBooking = await db.booking.updateMany({
        where: { id: args.bookingId, tenantId, referralProcessedAt: null },
        data: { referralProcessedAt: new Date() },
      });
      if (claimedBooking.count !== 1) return null;

      const referral = await db.affiliateReferral.upsert({
        where: { tenantId_referredUserId: { tenantId, referredUserId: args.userId } },
        update: {
          status: 'converted',
          convertedAt: new Date(),
          affiliateId: affiliate.id,
          referrerReward,
          refereeReward,
        },
        create: {
          tenantId,
          affiliateId: affiliate.id,
          referredUserId: args.userId,
          status: 'converted',
          convertedAt: new Date(),
          registeredAt: new Date(),
          referrerReward,
          refereeReward,
        },
      });

      let commission: Prisma.AffiliateCommissionGetPayload<object> | null = null;

      if (!isCommissionLess) {
        commission = await db.affiliateCommission.create({
          data: {
            tenantId,
            affiliateId: affiliate.id,
            bookingId: args.bookingId,
            amount: referrerReward,
            currency: args.bookingCurrency,
            rate: Number(affiliate.commissionRate),
            status: 'pending',
          },
        });

        await db.referralLedger.createMany({
          data: [
            {
              tenantId,
              affiliateId: affiliate.id,
              type: 'conversion',
              amount: referrerReward,
              currency: args.bookingCurrency,
              bookingId: args.bookingId,
              referredUserId: args.userId,
              description: `Conversion from booking ${args.bookingId} (${referrerReward} ${args.bookingCurrency})`,
            },
          ],
        });

        await db.affiliate.update({
          where: { id: affiliate.id },
          data: { totalEarnings: { increment: referrerReward } },
        });
      }

      return { referral, commission, referrerReward, refereeReward };
    });

    if (!result) return null;

    this.logger.log(
      `Referral conversion: referrer=${referrer.id} (${affiliate.affiliateType}) ` +
        `earned ${referrerReward} ${args.bookingCurrency} from booking ${args.bookingId}`,
    );

    return result;
  }

  // ---------------------------------------------------------------------------
  // Payouts
  // ---------------------------------------------------------------------------

  async requestPayout(tenantId: string, userId: string, body: { amount: number; method: string; details?: any }) {
    const affiliate = await this.prisma.affiliate.findUnique({ where: { userId } });
    if (!affiliate) throw new NotFoundException('No affiliate account for this user');
    if (!affiliate.isActive) throw new BadRequestException('Affiliate account is inactive');
    if (affiliate.affiliateType === 'commission_less') {
      throw new BadRequestException(
        'Your affiliation is points-only — cash payouts are not available. Redeem points at checkout instead.',
      );
    }

    const settings = await this.getSettings(tenantId);
    if (body.amount < Number(settings.minPayoutAmount)) {
      throw new BadRequestException(
        `Minimum payout is ${settings.minPayoutAmount} ${settings.payoutCurrency}`,
      );
    }

    // Available balance = totalEarnings - sum(paid|processing|pending payouts)
    const reserved = (
      await this.prisma.referralPayout.aggregate({
        where: { tenantId, affiliateId: affiliate.id, status: { in: ['pending', 'processing', 'paid'] } },
        _sum: { amount: true },
      })
    )._sum.amount ?? 0;
    const available = Number(affiliate.totalEarnings) - Number(reserved);
    if (body.amount > available) {
      throw new BadRequestException(
        `Requested ${body.amount} exceeds available balance ${available.toFixed(2)}`,
      );
    }

    const payout = await this.prisma.referralPayout.create({
      data: {
        tenantId,
        affiliateId: affiliate.id,
        amount: body.amount,
        currency: settings.payoutCurrency,
        method: body.method,
        details: body.details ?? {},
        status: 'pending',
      },
    });

    await this.prisma.referralLedger.create({
      data: {
        tenantId,
        affiliateId: affiliate.id,
        type: 'payout_debit',
        amount: -body.amount,
        currency: settings.payoutCurrency,
        payoutId: payout.id,
        description: `Payout request #${payout.id}`,
      },
    });

    return payout;
  }

  // ---------------------------------------------------------------------------
  // Admin
  // ---------------------------------------------------------------------------

  async listPayoutsAdmin(tenantId: string, status?: string) {
    return this.prisma.referralPayout.findMany({
      where: { tenantId, ...(status ? { status } : {}) },
      include: { affiliate: { include: { user: { select: { id: true, fullName: true, email: true, phone: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updatePayoutAdmin(tenantId: string, id: string, body: { status: string; notes?: string; processedBy?: string }) {
    const payout = await this.prisma.referralPayout.findFirst({ where: { id, tenantId } });
    if (!payout) throw new NotFoundException('Payout not found');

    const data: Prisma.ReferralPayoutUpdateInput = {
      status: body.status,
      notes: body.notes,
      processedBy: body.processedBy,
    };
    if (['paid', 'cancelled', 'rejected'].includes(body.status)) {
      data.processedAt = new Date();
    }

    const updated = await this.prisma.referralPayout.update({ where: { id }, data });

    // If a payout was rejected/cancelled, refund the ledger entry by deleting it
    if (['rejected', 'cancelled'].includes(body.status)) {
      await this.prisma.referralLedger.deleteMany({ where: { tenantId, payoutId: id } });
    }

    return updated;
  }

  async getAdminOverview(tenantId: string) {
    const [settings, totals] = await Promise.all([
      this.getSettings(tenantId),
      Promise.all([
        this.prisma.affiliate.count({ where: { tenantId } }),
        this.prisma.affiliateReferral.count({ where: { tenantId } }),
        this.prisma.affiliateReferral.count({ where: { tenantId, status: 'converted' } }),
        this.prisma.affiliateCommission.aggregate({
          where: { tenantId },
          _sum: { amount: true },
        }),
        this.prisma.referralPayout.count({ where: { tenantId, status: 'pending' } }),
        this.prisma.referralPayout.aggregate({
          where: { tenantId, status: 'paid' },
          _sum: { amount: true },
        }),
      ]),
    ]);

    const [
      affiliates,
      referrals,
      converted,
      commissionSum,
      pendingPayouts,
      paidPayouts,
    ] = totals;

    return {
      settings,
      stats: {
        affiliates,
        referrals,
        converted,
        conversionRate: referrals ? (converted / referrals) * 100 : 0,
        totalCommissions: commissionSum._sum.amount ? Number(commissionSum._sum.amount) : 0,
        pendingPayouts,
        totalPaidOut: paidPayouts._sum.amount ? Number(paidPayouts._sum.amount) : 0,
      },
    };
  }

  async adminListReferrals(tenantId: string, page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.prisma.affiliateReferral.findMany({
        where: { tenantId },
        include: { affiliate: { include: { user: { select: { fullName: true, email: true } } } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.affiliateReferral.count({ where: { tenantId } }),
    ]);

    const referredIds = items.map((i) => i.referredUserId);
    const users = referredIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: referredIds } },
          select: { id: true, fullName: true, email: true, phone: true, createdAt: true },
        })
      : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    return {
      items: items.map((r) => ({
        ...r,
        referredUser: userMap.get(r.referredUserId) || null,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ---------------------------------------------------------------------------
  // Admin — affiliate (referrer) management
  // ---------------------------------------------------------------------------

  /**
   * List referrers with their affiliation type and live performance stats.
   * Admin can then PATCH each row's type / rate / active flag.
   */
  async adminListAffiliates(
    tenantId: string,
    page = 1,
    limit = 20,
    search?: string,
    affiliateType?: string,
  ) {
    const where: Prisma.AffiliateWhereInput = { tenantId };
    if (search) {
      where.OR = [
        { referralCode: { contains: search, mode: 'insensitive' } },
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (affiliateType && ['fixed_commission', 'commission_less'].includes(affiliateType)) {
      where.affiliateType = affiliateType;
    }

    const [items, total] = await Promise.all([
      this.prisma.affiliate.findMany({
        where,
        include: {
          user: { select: { id: true, fullName: true, email: true, phone: true, isActive: true } },
        },
        orderBy: [{ totalEarnings: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.affiliate.count({ where }),
    ]);

    const affIds = items.map((a) => a.id);
    const [signupCounts, convertedCounts] = affIds.length
      ? await Promise.all([
          this.prisma.affiliateReferral.groupBy({
            by: ['affiliateId'],
            where: { tenantId, affiliateId: { in: affIds } },
            _count: { _all: true },
          }),
          this.prisma.affiliateReferral.groupBy({
            by: ['affiliateId'],
            where: { tenantId, affiliateId: { in: affIds }, status: 'converted' },
            _count: { _all: true },
          }),
        ])
      : [[], []];

    const signupMap = new Map(signupCounts.map((g) => [g.affiliateId, g._count._all]));
    const convertedMap = new Map(convertedCounts.map((g) => [g.affiliateId, g._count._all]));

    return {
      items: items.map((a) => ({
        id: a.id,
        userId: a.userId,
        referralCode: a.referralCode,
        affiliateType: a.affiliateType,
        commissionRate: Number(a.commissionRate),
        totalEarnings: Number(a.totalEarnings),
        isActive: a.isActive,
        createdAt: a.createdAt,
        signups: signupMap.get(a.id) ?? 0,
        converted: convertedMap.get(a.id) ?? 0,
        user: a.user,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Set an individual referrer's affiliation type + conditions. */
  async adminUpdateAffiliate(
    tenantId: string,
    affiliateId: string,
    body: { affiliateType?: string; commissionRate?: number; isActive?: boolean },
  ) {
    const affiliate = await this.prisma.affiliate.findFirst({
      where: { id: affiliateId, tenantId },
    });
    if (!affiliate) throw new NotFoundException('Affiliate not found');

    if (
      body.affiliateType !== undefined &&
      !['fixed_commission', 'commission_less'].includes(body.affiliateType)
    ) {
      throw new BadRequestException('affiliateType must be fixed_commission or commission_less');
    }

    const data: Prisma.AffiliateUpdateInput = {};
    if (body.affiliateType !== undefined) data.affiliateType = body.affiliateType;
    if (body.commissionRate !== undefined) {
      data.commissionRate = Math.max(0, Number(body.commissionRate));
    }
    if (body.isActive !== undefined) data.isActive = !!body.isActive;

    return this.prisma.affiliate.update({
      where: { id: affiliateId },
      data,
      include: { user: { select: { id: true, fullName: true, email: true, phone: true } } },
    });
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private computeReward(
    baseAmount: number,
    type: string,
    value: number,
    maxReward: number | null,
  ): number {
    let reward = 0;
    if (type === 'percentage') {
      reward = (baseAmount * value) / 100;
    } else if (type === 'fixed') {
      reward = value;
    }
    if (maxReward !== null && reward > maxReward) reward = maxReward;
    // A fixed discount/commission must never exceed the booking amount.
    reward = Math.min(reward, Math.max(0, baseAmount));
    if (reward < 0) reward = 0;
    return Math.round(reward * 100) / 100;
  }
}
