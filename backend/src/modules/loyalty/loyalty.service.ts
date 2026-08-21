import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Prisma } from '@prisma/client';

// =============================================================================
// LoyaltyService — Tier promotion, points award, redemption
// =============================================================================
//
// 5 default tiers (seeded per-tenant on first call):
//   Silver      — 1 star   — 10,000 pts  — 1.00x
//   Gold        — 2 stars  — 50,000 pts  — 1.10x
//   Platinum    — 4 stars  — 150,000 pts — 1.25x
//   Diamond     — 4 stars  — 300,000 pts — 1.50x
//   Ambassador  — 5 stars  — 500,000 pts — 2.00x
//
// Point flows:
//   - Referral signup       → +500 pts to referrer (bookingConfirmation)
//   - Booking confirmation  → +50% of product.pointsAwarded
//   - Service completion    → +remaining 50% of product.pointsAwarded
//   - Redemption at checkout → -N pts, +N*tier.multiplier BDT off booking
//
// Idempotent: every award function uses unique constraints / upserts so
// replaying a webhook or duplicate event never double-credits points.
// =============================================================================

const DEFAULT_TIERS = [
  { name: 'Silver',     slug: 'silver',     color: '#C0C0C0', starCount: 1, minPoints:   10000, redemptionMultiplier: 1.00, sortOrder: 1 },
  { name: 'Gold',       slug: 'gold',       color: '#FFD700', starCount: 2, minPoints:   50000, redemptionMultiplier: 1.10, sortOrder: 2 },
  { name: 'Platinum',   slug: 'platinum',   color: '#E5E4E2', starCount: 4, minPoints:  150000, redemptionMultiplier: 1.25, sortOrder: 3 },
  { name: 'Diamond',    slug: 'diamond',    color: '#60A5FA', starCount: 4, minPoints:  300000, redemptionMultiplier: 1.50, sortOrder: 4 },
  { name: 'Ambassador', slug: 'ambassador', color: '#7B61FF', starCount: 5, minPoints:  500000, redemptionMultiplier: 2.00, sortOrder: 5 },
];

const REFERRAL_SIGNUP_POINTS = 500;

@Injectable()
export class LoyaltyService {
  private readonly logger = new Logger(LoyaltyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  // ===========================================================================
  // Public — current user
  // ===========================================================================

  /** Get the current loyalty state for a user (creates account if missing). */
  async getMyAccount(tenantId: string, userId: string) {
    const account = await this.ensureAccount(tenantId, userId);
    const [tier, transactions] = await Promise.all([
      account.currentTierId
        ? this.prisma.loyaltyTier.findUnique({ where: { id: account.currentTierId } })
        : null,
      this.prisma.loyaltyTransaction.findMany({
        where: { tenantId, accountId: account.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);
    return {
      ...account,
      currentTier: tier,
      recentTransactions: transactions,
      // Convenience fields
      tierProgress: tier ? this.computeTierProgress(account.lifetimePoints, tier.minPoints) : 0,
      nextTier: await this.getNextTier(tenantId, account.lifetimePoints),
      redemptionMultiplier: tier ? Number(tier.redemptionMultiplier) : 1.0,
      maxRedeemableBdt: tier ? Math.floor(account.availablePoints * Number(tier.redemptionMultiplier)) : account.availablePoints,
    };
  }

  /** Redeem N points for a BDT discount at checkout. Returns BDT value of discount. */
  async redeemPoints(tenantId: string, userId: string, points: number, bookingId?: string) {
    if (!Number.isInteger(points) || points <= 0) {
      throw new BadRequestException('points must be a positive integer');
    }
    const account = await this.ensureAccount(tenantId, userId);
    if (account.availablePoints < points) {
      throw new BadRequestException(
        `Insufficient points: have ${account.availablePoints}, requested ${points}`,
      );
    }
    const tier = account.currentTierId
      ? await this.prisma.loyaltyTier.findUnique({ where: { id: account.currentTierId } })
      : null;
    const multiplier = tier ? Number(tier.redemptionMultiplier) : 1.0;
    const bdtValue = Math.floor(points * multiplier);

    const tx = await this.prisma.$transaction(async (db) => {
      // Decrement available
      const updated = await db.loyaltyAccount.update({
        where: { id: account.id },
        data: {
          availablePoints: { decrement: points },
          redeemedPoints: { increment: points },
        },
      });
      // Record transaction
      const transaction = await db.loyaltyTransaction.create({
        data: {
          tenantId,
          accountId: account.id,
          type: 'redemption',
          points: -points,
          currency: 'BDT',
          bdtValue,
          bookingId: bookingId ?? null,
          description: `Redeemed ${points} pts × ${multiplier}x = ৳${bdtValue} discount`,
        },
      });
      // Mirror on User table (denormalized state)
      await db.user.update({
        where: { id: userId },
        data: { availablePoints: updated.availablePoints },
      });
      return transaction;
    });

    return { transaction: tx, bdtValue, multiplier };
  }

  /** Calculate the BDT value of redeeming N points (for UI preview). */
  async previewRedemption(tenantId: string, userId: string, points: number) {
    const account = await this.ensureAccount(tenantId, userId);
    if (points <= 0) return { bdtValue: 0, multiplier: 1.0 };
    const tier = account.currentTierId
      ? await this.prisma.loyaltyTier.findUnique({ where: { id: account.currentTierId } })
      : null;
    const multiplier = tier ? Number(tier.redemptionMultiplier) : 1.0;
    const bdtValue = Math.floor(points * multiplier);
    return { bdtValue, multiplier, capped: points > account.availablePoints };
  }

  // ===========================================================================
  // Public — referral signup hook
  // ===========================================================================

  /** Award points to a referrer when a new user signs up via their code. */
  async awardReferralSignup(tenantId: string, referrerUserId: string, referredUserId: string, pointsOverride?: number) {
    const referrerAccount = await this.ensureAccount(tenantId, referrerUserId);
    const points = Math.max(0, Math.floor(pointsOverride ?? REFERRAL_SIGNUP_POINTS));
    if (points <= 0) return null;
    return this.credit({
      tenantId,
      accountId: referrerAccount.id,
      type: 'referral_signup',
      points,
      referredUserId,
      description: `+${points} pts for referring a new signup`,
    });
  }

  // ===========================================================================
  // Public — booking lifecycle hooks
  // ===========================================================================

  /** Award 50% of product.pointsAwarded when booking transitions to 'confirmed'. */
  async awardBookingConfirmation(tenantId: string, bookingId: string, userId: string, bookingType: string, productPoints: number) {
    if (productPoints <= 0) return null;
    const half = Math.floor(productPoints / 2);
    if (half <= 0) return null;

    // Idempotency: skip if we've already credited for confirmation
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, tenantId },
      select: { pointsAwardedConfirmation: true },
    });
    if (!booking) return null;
    if (booking.pointsAwardedConfirmation >= half) return null;

    const account = await this.ensureAccount(tenantId, userId);
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { pointsAwardedConfirmation: half },
    });
    return this.credit({
      tenantId,
      accountId: account.id,
      type: 'booking_confirmation',
      points: half,
      bookingId,
      description: `+${half} pts — 50% on ${bookingType} booking confirmation`,
    });
  }

  /** Award remaining 50% when booking transitions to 'completed'. */
  async awardBookingCompletion(tenantId: string, bookingId: string, userId: string, bookingType: string, productPoints: number) {
    if (productPoints <= 0) return null;
    const half = Math.floor(productPoints / 2);
    if (half <= 0) return null;

    // Idempotency: skip if we've already credited completion
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, tenantId },
      select: { pointsAwardedCompletion: true, pointsAwardedConfirmation: true },
    });
    if (!booking) return null;
    if (booking.pointsAwardedCompletion >= half) return null;

    const account = await this.ensureAccount(tenantId, userId);
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { pointsAwardedCompletion: half },
    });
    return this.credit({
      tenantId,
      accountId: account.id,
      type: 'booking_completion',
      points: half,
      bookingId,
      description: `+${half} pts — remaining 50% on ${bookingType} service completion`,
    });
  }

  /** Get points value for a product (from its .pointsAwarded field). */
  async getProductPoints(tenantId: string, bookingType: string, itemId: string): Promise<number> {
    let product: { pointsAwarded: number } | null = null;
    switch (bookingType) {
      case 'tour':   product = await this.prisma.tour.findFirst({ where: { id: itemId, tenantId }, select: { pointsAwarded: true } }); break;
      case 'hotel':  product = await this.prisma.hotel.findFirst({ where: { id: itemId, tenantId }, select: { pointsAwarded: true } }); break;
      case 'flight': product = await this.prisma.flight.findFirst({ where: { id: itemId, tenantId }, select: { pointsAwarded: true } }); break;
      case 'visa':   product = await this.prisma.visaService.findFirst({ where: { id: itemId, tenantId }, select: { pointsAwarded: true } }); break;
      case 'hajj':   product = await this.prisma.hajjPackage.findFirst({ where: { id: itemId, tenantId }, select: { pointsAwarded: true } }); break;
      case 'umrah':  product = await this.prisma.umrahPackage.findFirst({ where: { id: itemId, tenantId }, select: { pointsAwarded: true } }); break;
      case 'transport': product = await this.prisma.transport.findFirst({ where: { id: itemId, tenantId }, select: { pointsAwarded: true } }); break;
    }
    return product?.pointsAwarded ?? 0;
  }

  // ===========================================================================
  // Public — admin
  // ===========================================================================

  async adminListTransactions(tenantId: string, opts: { userId?: string; type?: string; page?: number; limit?: number } = {}) {
    const page = Math.max(opts.page ?? 1, 1);
    const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200);
    const where: Prisma.LoyaltyTransactionWhereInput = { tenantId };
    if (opts.userId) where.accountId = undefined; // ignored unless we have a join; use accountId directly
    if (opts.type) where.type = opts.type;
    const [items, total] = await Promise.all([
      this.prisma.loyaltyTransaction.findMany({
        where, skip: (page - 1) * limit, take: limit,
        include: { account: { include: { user: { select: { id: true, fullName: true, email: true, phone: true } } } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.loyaltyTransaction.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async adminListAccounts(tenantId: string, opts: { search?: string; page?: number; limit?: number } = {}) {
    const page = Math.max(opts.page ?? 1, 1);
    const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200);
    const where: Prisma.LoyaltyAccountWhereInput = { tenantId };
    if (opts.search) {
      where.user = {
        OR: [
          { fullName: { contains: opts.search, mode: 'insensitive' } },
          { email:    { contains: opts.search, mode: 'insensitive' } },
          { phone:    { contains: opts.search } },
        ],
      };
    }
    const [items, total] = await Promise.all([
      this.prisma.loyaltyAccount.findMany({
        where, skip: (page - 1) * limit, take: limit,
        include: {
          user: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true, referralCode: true } },
          currentTier: true,
        },
        orderBy: { lifetimePoints: 'desc' },
      }),
      this.prisma.loyaltyAccount.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async adminAdjustPoints(tenantId: string, userId: string, points: number, reason: string, reference?: string) {
    const account = await this.ensureAccount(tenantId, userId);
    const direction = points >= 0 ? 'credit' : 'debit';
    return this.credit({
      tenantId,
      accountId: account.id,
      type: 'admin_adjustment',
      points,
      description: `Admin ${direction}: ${reason}${reference ? ` (ref: ${reference})` : ''}`,
      metadata: { reason, reference },
    });
  }

  async adminGetTiers(tenantId: string) {
    await this.ensureTiers(tenantId);
    return this.prisma.loyaltyTier.findMany({
      where: { tenantId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async adminUpsertTier(tenantId: string, id: string | null, data: {
    name: string; slug: string; color: string; starCount: number; minPoints: number;
    redemptionMultiplier: number; benefits?: any; sortOrder?: number; isActive?: boolean;
  }) {
    if (id) {
      return this.prisma.loyaltyTier.update({ where: { id }, data });
    }
    return this.prisma.loyaltyTier.upsert({
      where: { tenantId_slug: { tenantId, slug: data.slug } },
      update: data,
      create: { tenantId, ...data },
    });
  }

  async adminDeleteTier(id: string, tenantId: string) {
    const tier = await this.prisma.loyaltyTier.findFirst({ where: { id, tenantId } });
    if (!tier) throw new NotFoundException('Tier not found');
    return this.prisma.loyaltyTier.delete({ where: { id } });
  }

  async adminGetProductRules(tenantId: string, productType?: string) {
    return this.prisma.productPointsRule.findMany({
      where: { tenantId, ...(productType ? { productType } : {}) },
      orderBy: { productType: 'asc' },
    });
  }

  async adminUpsertProductRule(tenantId: string, id: string | null, data: {
    productType: string; productId?: string; productName?: string;
    pointsValue: number; maxPoints?: number; minSpend?: number;
    isActive?: boolean; startsAt?: string; endsAt?: string;
  }) {
    if (id) {
      return this.prisma.productPointsRule.update({
        where: { id },
        data: {
          productType: data.productType,
          productId: data.productId ?? null,
          productName: data.productName ?? null,
          pointsValue: data.pointsValue,
          maxPoints: data.maxPoints ?? null,
          minSpend: data.minSpend ?? null,
          isActive: data.isActive ?? true,
          startsAt: data.startsAt ? new Date(data.startsAt) : null,
          endsAt: data.endsAt ? new Date(data.endsAt) : null,
        },
      });
    }
    return this.prisma.productPointsRule.create({
      data: {
        tenantId,
        productType: data.productType,
        productId: data.productId ?? null,
        productName: data.productName ?? null,
        pointsValue: data.pointsValue,
        maxPoints: data.maxPoints ?? null,
        minSpend: data.minSpend ?? null,
        isActive: data.isActive ?? true,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
      },
    });
  }

  async adminDeleteProductRule(id: string, tenantId: string) {
    const rule = await this.prisma.productPointsRule.findFirst({ where: { id, tenantId } });
    if (!rule) throw new NotFoundException('Rule not found');
    return this.prisma.productPointsRule.delete({ where: { id } });
  }

  async adminStats(tenantId: string) {
    const [totalAccounts, totalLifetime, totalRedeemed, totalTransactions, tiers] = await Promise.all([
      this.prisma.loyaltyAccount.count({ where: { tenantId } }),
      this.prisma.loyaltyAccount.aggregate({ where: { tenantId }, _sum: { lifetimePoints: true } }),
      this.prisma.loyaltyTransaction.aggregate({
        where: { tenantId, type: 'redemption' },
        _sum: { points: true, bdtValue: true },
      }),
      this.prisma.loyaltyTransaction.count({ where: { tenantId } }),
      this.adminGetTiers(tenantId),
    ]);
    return {
      totalAccounts,
      totalLifetimePoints: totalLifetime._sum.lifetimePoints ?? 0,
      totalRedeemedPoints: Math.abs(totalRedeemed._sum.points ?? 0),
      totalRedeemedBdt: Number(totalRedeemed._sum.bdtValue ?? 0),
      totalTransactions,
      tiers,
    };
  }

  // ===========================================================================
  // Internal helpers
  // ===========================================================================

  /** Atomically credit/debit a loyalty account and check for tier promotion. */
  private async credit(args: {
    tenantId: string;
    accountId: string;
    type: string;
    points: number;
    bookingId?: string;
    referredUserId?: string;
    description?: string;
    metadata?: any;
  }) {
    const result = await this.prisma.$transaction(async (db) => {
      // Atomic increment on lifetime + available (or just lifetime if negative)
      const account = await db.loyaltyAccount.update({
        where: { id: args.accountId },
        data: {
          lifetimePoints: args.points >= 0 ? { increment: args.points } : undefined,
          availablePoints: args.points >= 0 ? { increment: args.points } : { decrement: Math.abs(args.points) },
        },
      });

      const tx = await db.loyaltyTransaction.create({
        data: {
          tenantId: args.tenantId,
          accountId: account.id,
          type: args.type,
          points: args.points,
          currency: 'BDT',
          bookingId: args.bookingId ?? null,
          referralId: args.referredUserId ?? null,
          description: args.description ?? null,
          metadata: args.metadata ? (args.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
        },
      });

      // Tier promotion check
      let promoted: Awaited<ReturnType<typeof this.computeEligibleTier>> = null;
      if (args.points > 0) {
        const newTier = await this.computeEligibleTier(args.tenantId, account.lifetimePoints);
        if (newTier && newTier.id !== account.currentTierId) {
          const updated = await db.loyaltyAccount.update({
            where: { id: account.id },
            data: {
              currentTierId: newTier.id,
              tierAchievedAt: new Date(),
            },
          });
          promoted = newTier;
          Object.assign(account, updated);
        }
      }

      // Mirror denormalized state to User
      await db.user.update({
        where: { id: account.userId },
        data: {
          lifetimePoints: account.lifetimePoints,
          availablePoints: account.availablePoints,
          currentTierId: account.currentTierId,
          tierAchievedAt: account.tierAchievedAt,
        },
      });

      return { account, transaction: tx, promoted };
    });

    if (result.promoted) {
      try {
        await this.notifications.createNotification(args.tenantId, {
          userId: result.account.userId,
          type: 'in_app',
          title: `🎉 You've reached ${result.promoted.name} tier!`,
          body: `You've unlocked new perks at the ${result.promoted.name} tier. Keep earning points to climb even higher!`,
        });
      } catch (err: any) {
        this.logger.warn(`Tier promotion notification failed: ${err.message}`);
      }
    }

    return result;
  }

  /** Get or create the loyalty account for a user. */
  private async ensureAccount(tenantId: string, userId: string) {
    let account = await this.prisma.loyaltyAccount.findUnique({ where: { userId } });
    if (!account) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user || user.tenantId !== tenantId) {
        throw new NotFoundException('User not found');
      }
      account = await this.prisma.loyaltyAccount.create({
        data: { tenantId, userId },
      });
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          lifetimePoints: 0,
          availablePoints: 0,
        },
      });
    }
    // Ensure tiers exist for this tenant
    await this.ensureTiers(tenantId);
    // Recompute current tier if missing
    if (!account.currentTierId) {
      const tier = await this.computeEligibleTier(tenantId, account.lifetimePoints);
      if (tier) {
        account = await this.prisma.loyaltyAccount.update({
          where: { id: account.id },
          data: { currentTierId: tier.id, tierAchievedAt: new Date() },
        });
        await this.prisma.user.update({
          where: { id: userId },
          data: { currentTierId: tier.id, tierAchievedAt: new Date() },
        });
      }
    }
    return account;
  }

  /** Compute the highest tier a user qualifies for given their lifetime points. */
  private async computeEligibleTier(tenantId: string, lifetimePoints: number): Promise<Awaited<ReturnType<PrismaService['loyaltyTier']['findMany']>>[number] | null> {
    const tiers = await this.prisma.loyaltyTier.findMany({
      where: { tenantId, isActive: true },
      orderBy: { minPoints: 'desc' },
    });
    return tiers.find((t) => lifetimePoints >= t.minPoints) ?? null;
  }

  /** Get the next tier above the user's current one (for progress UI). */
  private async getNextTier(tenantId: string, lifetimePoints: number) {
    const tiers = await this.prisma.loyaltyTier.findMany({
      where: { tenantId, isActive: true },
      orderBy: { minPoints: 'asc' },
    });
    return tiers.find((t) => lifetimePoints < t.minPoints) ?? null;
  }

  /** Compute percentage progress toward the next tier (0–100). */
  private computeTierProgress(lifetimePoints: number, currentMin: number): number {
    const next = lifetimePoints + 1; // placeholder; will be replaced by getNextTier in practice
    return 0; // overridden in getMyAccount
  }

  /** Seed default tiers for a tenant on first read. Idempotent. */
  async ensureTiers(tenantId: string) {
    const existing = await this.prisma.loyaltyTier.count({ where: { tenantId } });
    if (existing >= DEFAULT_TIERS.length) return;
    for (const tier of DEFAULT_TIERS) {
      await this.prisma.loyaltyTier.upsert({
        where: { tenantId_slug: { tenantId, slug: tier.slug } },
        update: {},
        create: {
          tenantId,
          name: tier.name,
          slug: tier.slug,
          color: tier.color,
          starCount: tier.starCount,
          minPoints: tier.minPoints,
          redemptionMultiplier: tier.redemptionMultiplier,
          sortOrder: tier.sortOrder,
          isActive: true,
          benefits: this.defaultBenefits(tier.slug),
        },
      });
    }
  }

  private defaultBenefits(slug: string) {
    const map: Record<string, { description: string; perks: string[] }> = {
      silver:     { description: 'Welcome to FlynGo Rewards',                   perks: ['1.0× redemption rate', 'Standard support'] },
      gold:       { description: 'Loyalty recognized',                          perks: ['1.1× redemption rate (10% bonus)', 'Priority email support'] },
      platinum:   { description: 'High-tier perks unlocked',                    perks: ['1.25× redemption rate', 'Priority chat support', 'Free cancellation up to 48h'] },
      diamond:    { description: 'Diamond-class service',                       perks: ['1.5× redemption rate', 'Dedicated account manager', 'Free date change'] },
      ambassador: { description: 'Our highest tier — thank you for your loyalty', perks: ['2.0× redemption rate', 'Concierge service', 'Exclusive deals', 'Early access to new packages'] },
    };
    return map[slug] ?? { description: slug, perks: [] };
  }
}
