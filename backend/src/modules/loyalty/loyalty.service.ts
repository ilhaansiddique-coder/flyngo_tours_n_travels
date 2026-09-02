import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PointReferenceType, PointTransactionType } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { LedgerService } from './ledger/ledger.service';
import { TierService } from './tiers/tier.service';
import { LoyaltyReferralService } from './referrals/referral.service';
import { RedemptionService } from './redemption/redemption.service';

@Injectable()
export class LoyaltyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: LedgerService,
    private readonly tiers: TierService,
    private readonly referrals: LoyaltyReferralService,
    private readonly redemption: RedemptionService,
  ) {}

  async getOverview(tenantId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null },
      select: { id: true, lifetimePoints: true, availablePoints: true, pendingPoints: true, currentTierId: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const allTiers = await this.tiers.list(tenantId);
    const currentTier = await this.tiers.highest(tenantId, user.lifetimePoints);
    const nextTier = allTiers.find((tier) => tier.minPoints > user.lifetimePoints) ?? null;
    const progress = this.tiers.progress(user.lifetimePoints, currentTier, nextTier);
    return {
      tier: currentTier,
      lifetimePoints: user.lifetimePoints,
      availablePoints: user.availablePoints,
      pendingPoints: user.pendingPoints,
      currentTier,
      nextTier,
      progress: progress.progress,
      pointsToNext: progress.pointsToNext,
      pointsToNextTier: progress.pointsToNext,
      tiers: allTiers,
    };
  }

  async getMyAccount(tenantId: string, userId: string) {
    const overview = await this.getOverview(tenantId, userId);
    const transactions = await this.ledger.listForUser(userId, undefined, undefined, 50);
    const multiplier = overview.currentTier ? Number(overview.currentTier.redemptionMultiplier) : 1;
    return {
      id: userId,
      ...overview,
      currentTierId: overview.currentTier?.id ?? null,
      recentTransactions: transactions.items.map((transaction) => ({
        ...transaction,
        points: transaction.amount,
      })),
      redeemedPoints: 0,
      redemptionMultiplier: multiplier,
      maxRedeemableBdt: Math.floor(overview.availablePoints * multiplier),
      tierProgress: overview.progress,
    };
  }

  async getTierSummary(tenantId: string, userId: string) {
    const overview = await this.getOverview(tenantId, userId);
    return {
      lifetimePoints: overview.lifetimePoints,
      availablePoints: overview.availablePoints,
      pendingPoints: overview.pendingPoints,
      redeemedPoints: 0,
      currentTier: overview.currentTier,
      nextTier: overview.nextTier,
      pointsToNext: overview.pointsToNext,
      progress: overview.progress,
      tiers: overview.tiers,
    };
  }

  async getReferralLink(tenantId: string, userId: string) {
    return this.referrals.getReferralLink(tenantId, userId);
  }

  async getReferrals(tenantId: string, userId: string, status?: string) {
    return this.referrals.listReferrals(tenantId, userId, status);
  }

  async getTransactions(tenantId: string, userId: string, type?: string, cursor?: string) {
    const user = await this.prisma.user.findFirst({ where: { id: userId, tenantId }, select: { id: true } });
    if (!user) throw new NotFoundException('User not found');
    let parsedCursor;
    if (cursor) {
      try {
        parsedCursor = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
      } catch {
        throw new BadRequestException('Invalid transaction cursor');
      }
    }
    return this.ledger.listForUser(userId, type, parsedCursor, 25);
  }

  /** Callable verification hook. Raw password registration never calls this. */
  async onUserVerified(tenantId: string, userId: string) {
    return this.referrals.onUserVerified(tenantId, userId);
  }

  /** Signup bonus — award every new user their signup points (default 100). */
  async awardSignupBonus(tenantId: string, userId: string) {
    return this.referrals.awardSignupBonus(tenantId, userId);
  }

  /**
   * Grant the signup bonus to every active user in the tenant that never
   * received it — backfills accounts created before the bonus existed (or by an
   * admin). Idempotent: users who already have a SIGNUP_BONUS are skipped, and
   * the ledger key prevents any double-credit.
   */
  async backfillSignupBonus(tenantId: string) {
    const users = await this.prisma.user.findMany({
      where: { tenantId, deletedAt: null },
      select: { id: true },
    });
    let credited = 0;
    for (const u of users) {
      const has = await this.prisma.pointTransaction.findFirst({
        where: { userId: u.id, type: PointTransactionType.SIGNUP_BONUS },
        select: { id: true },
      });
      if (has) continue;
      const tx = await this.referrals.awardSignupBonus(tenantId, u.id);
      if (tx) credited++;
    }
    return { total: users.length, credited };
  }

  async awardReferralSignup(tenantId: string, _referrerUserId: string, referredUserId: string, _pointsOverride?: number) {
    // Compatibility method: it is safe only when the verification marker exists.
    return this.onUserVerified(tenantId, referredUserId);
  }

  async awardBookingConfirmation(
    tenantId: string,
    bookingId: string,
    userId: string,
    bookingType: string,
    productPoints: number,
  ) {
    const half = Math.floor(Math.max(0, productPoints) / 2);
    if (half <= 0) return null;
    const booking = await this.prisma.booking.findFirst({ where: { id: bookingId, tenantId, userId }, select: { id: true } });
    if (!booking) return null;
    const result = await this.ledger.postBookingConfirmation(userId, bookingId, half, { bookingType, stage: 'confirmed' });
    await this.prisma.booking.updateMany({
      where: { id: bookingId, tenantId },
      data: { pointsAwardedConfirmation: half },
    });
    return result;
  }

  async awardBookingCompletion(
    tenantId: string,
    bookingId: string,
    userId: string,
    bookingType: string,
    productPoints: number,
  ) {
    const total = Math.max(0, Math.floor(productPoints));
    if (total <= 0) return null;
    const booking = await this.prisma.booking.findFirst({ where: { id: bookingId, tenantId, userId }, select: { id: true } });
    if (!booking) return null;
    const result = await this.ledger.postBookingCompletion(userId, bookingId, total, { bookingType, stage: 'completed' });
    const confirmed = Math.floor(total / 2);
    await this.prisma.booking.updateMany({
      where: { id: bookingId, tenantId },
      data: { pointsAwardedConfirmation: confirmed, pointsAwardedCompletion: total - confirmed },
    });
    return result;
  }

  async reverseBookingPoints(tenantId: string, bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findFirst({ where: { id: bookingId, tenantId, userId }, select: { id: true } });
    if (!booking) return [];
    return this.ledger.reverseBooking(userId, bookingId);
  }

  // --- Hajj/Umrah bookings live in a separate table (hajjUmrahBooking), so they
  //     need their own award path. The ledger keys purely on a bookingId string
  //     (no FK), so it accepts these ids fine; we just guard + track against the
  //     hajj_umrah_bookings row instead of the generic booking table.
  async awardHajjUmrahConfirmation(
    tenantId: string,
    bookingId: string,
    userId: string,
    kind: string,
    productPoints: number,
  ) {
    const half = Math.floor(Math.max(0, productPoints) / 2);
    if (half <= 0) return null;
    const booking = await this.prisma.hajjUmrahBooking.findFirst({ where: { id: bookingId, tenantId, userId }, select: { id: true } });
    if (!booking) return null;
    const result = await this.ledger.postBookingConfirmation(userId, bookingId, half, { bookingType: kind, stage: 'confirmed' });
    await this.prisma.hajjUmrahBooking.updateMany({
      where: { id: bookingId, tenantId },
      data: { pointsAwardedConfirmation: half },
    });
    return result;
  }

  async awardHajjUmrahCompletion(
    tenantId: string,
    bookingId: string,
    userId: string,
    kind: string,
    productPoints: number,
  ) {
    const total = Math.max(0, Math.floor(productPoints));
    if (total <= 0) return null;
    const booking = await this.prisma.hajjUmrahBooking.findFirst({ where: { id: bookingId, tenantId, userId }, select: { id: true } });
    if (!booking) return null;
    const result = await this.ledger.postBookingCompletion(userId, bookingId, total, { bookingType: kind, stage: 'completed' });
    const confirmed = Math.floor(total / 2);
    await this.prisma.hajjUmrahBooking.updateMany({
      where: { id: bookingId, tenantId },
      data: { pointsAwardedConfirmation: confirmed, pointsAwardedCompletion: total - confirmed },
    });
    return result;
  }

  async getProductPoints(tenantId: string, bookingType: string, itemId: string): Promise<number> {
    const now = new Date();
    const specificRule = await this.prisma.productPointsRule.findFirst({
      where: {
        tenantId, productType: bookingType, productId: itemId, isActive: true,
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
      },
      orderBy: { createdAt: 'desc' },
    });
    const categoryRule = specificRule ?? await this.prisma.productPointsRule.findFirst({
      where: {
        tenantId, productType: bookingType, productId: null, isActive: true,
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
      },
      orderBy: { createdAt: 'desc' },
    });
    if (categoryRule) {
      const points = Math.max(0, categoryRule.pointsValue);
      return categoryRule.maxPoints == null ? points : Math.min(points, Math.max(0, categoryRule.maxPoints));
    }

    let product: { pointsAwarded: number } | null = null;
    switch (bookingType) {
      case 'tour': product = await this.prisma.tour.findFirst({ where: { id: itemId, tenantId }, select: { pointsAwarded: true } }); break;
      case 'hotel': product = await this.prisma.hotel.findFirst({ where: { id: itemId, tenantId }, select: { pointsAwarded: true } }); break;
      case 'flight': product = await this.prisma.flight.findFirst({ where: { id: itemId, tenantId }, select: { pointsAwarded: true } }); break;
      case 'visa': product = await this.prisma.visaService.findFirst({ where: { id: itemId, tenantId }, select: { pointsAwarded: true } }); break;
      case 'hajj': product = await this.prisma.hajjPackage.findFirst({ where: { id: itemId, tenantId }, select: { pointsAwarded: true } }); break;
      case 'umrah': product = await this.prisma.umrahPackage.findFirst({ where: { id: itemId, tenantId }, select: { pointsAwarded: true } }); break;
      case 'transport': product = await this.prisma.transport.findFirst({ where: { id: itemId, tenantId }, select: { pointsAwarded: true } }); break;
      case 'package': product = await this.prisma.hajjPackage.findFirst({ where: { id: itemId, tenantId }, select: { pointsAwarded: true } });
        if (!product) product = await this.prisma.umrahPackage.findFirst({ where: { id: itemId, tenantId }, select: { pointsAwarded: true } });
        break;
    }
    return product?.pointsAwarded ?? 0;
  }

  async listTiers(tenantId: string) { return this.tiers.list(tenantId); }
  async ensureTiers(tenantId: string) { return this.tiers.ensureDefaults(tenantId); }

  async redeemPoints(_tenantId: string, _userId: string, _points: number, _bookingId?: string): Promise<never> {
    return this.redemption.redeem();
  }

  async previewRedemption(_tenantId: string, _userId: string, _points: number): Promise<never> {
    return this.redemption.quote();
  }

  async adminListTransactions(tenantId: string, opts: { userId?: string; type?: string; page?: number; limit?: number } = {}) {
    const result = await this.ledger.listForTenant(tenantId, opts);
    return {
      ...result,
      items: result.items.map((transaction) => ({
        ...transaction,
        type: legacyTransactionType(transaction.type),
        ledgerType: transaction.type,
        points: transaction.amount,
        bdtValue: null,
        description: null,
        account: { user: transaction.user },
      })),
    };
  }

  async adminListAccounts(tenantId: string, opts: { search?: string; page?: number; limit?: number } = {}) {
    const page = Math.max(opts.page ?? 1, 1);
    const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200);
    const where: Prisma.UserWhereInput = { tenantId, deletedAt: null };
    if (opts.search) {
      where.OR = [
        { fullName: { contains: opts.search, mode: 'insensitive' } },
        { email: { contains: opts.search, mode: 'insensitive' } },
        { phone: { contains: opts.search } },
      ];
    }
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { lifetimePoints: 'desc' },
        select: {
          id: true, tenantId: true, fullName: true, email: true, phone: true, avatarUrl: true,
          referralCode: true, lifetimePoints: true, availablePoints: true, pendingPoints: true,
          currentTierId: true, tierAchievedAt: true, createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    const items = await Promise.all(users.map(async (user) => ({
      id: `loyalty-${user.id}`,
      userId: user.id,
      lifetimePoints: user.lifetimePoints,
      availablePoints: user.availablePoints,
      pendingPoints: user.pendingPoints,
      redeemedPoints: 0,
      currentTierId: user.currentTierId,
      tierAchievedAt: user.tierAchievedAt,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        referralCode: user.referralCode,
      },
      currentTier: await this.tiers.highest(tenantId, user.lifetimePoints),
    })));
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async adminAdjustPoints(
    tenantId: string,
    userId: string,
    points: number,
    reason: string,
    reference?: string,
    adminId?: string,
  ) {
    if (!Number.isInteger(points) || points === 0) throw new BadRequestException('points must be a non-zero integer');
    const user = await this.prisma.user.findFirst({ where: { id: userId, tenantId }, select: { id: true } });
    if (!user) throw new NotFoundException('User not found');
    return this.ledger.post({
      userId,
      type: PointTransactionType.ADMIN_ADJUSTMENT,
      amount: points,
      referenceType: PointReferenceType.ADMIN,
      referenceId: reference || `adjustment-${Date.now()}`,
      idempotencyKey: `admin:${userId}:${reference || `${Date.now()}-${Math.random()}`}`,
      metadata: { reason, reference: reference ?? null, adminId: adminId ?? null },
    });
  }

  async adminGetTiers(tenantId: string) { return this.tiers.list(tenantId, false); }

  async adminUpsertTier(tenantId: string, id: string | null, data: any) {
    if (id) {
      const existing = await this.prisma.loyaltyTier.findFirst({ where: { id, tenantId } });
      if (!existing) throw new NotFoundException('Tier not found');
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
    return this.prisma.productPointsRule.findMany({ where: { tenantId, ...(productType ? { productType } : {}) }, orderBy: { productType: 'asc' } });
  }

  async adminUpsertProductRule(tenantId: string, id: string | null, data: any) {
    const values = {
      productType: data.productType,
      productId: data.productId ?? null,
      productName: data.productName ?? null,
      pointsValue: data.pointsValue,
      maxPoints: data.maxPoints ?? null,
      minSpend: data.minSpend ?? null,
      isActive: data.isActive ?? true,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
    };
    if (id) return this.prisma.productPointsRule.update({ where: { id }, data: values });
    return this.prisma.productPointsRule.create({ data: { tenantId, ...values } });
  }

  async adminDeleteProductRule(id: string, tenantId: string) {
    const rule = await this.prisma.productPointsRule.findFirst({ where: { id, tenantId } });
    if (!rule) throw new NotFoundException('Rule not found');
    return this.prisma.productPointsRule.delete({ where: { id } });
  }

  async adminStats(tenantId: string) {
    const [totalAccounts, lifetime, totalTransactions, tiers] = await Promise.all([
      this.prisma.user.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.user.aggregate({ where: { tenantId, deletedAt: null }, _sum: { lifetimePoints: true } }),
      this.prisma.pointTransaction.count({ where: { user: { tenantId } } }),
      this.adminGetTiers(tenantId),
    ]);
    return {
      totalAccounts,
      totalLifetimePoints: lifetime._sum.lifetimePoints ?? 0,
      totalRedeemedPoints: 0,
      totalRedeemedBdt: 0,
      totalTransactions,
      tiers,
    };
  }
}

function legacyTransactionType(type: PointTransactionType) {
  const map: Record<PointTransactionType, string> = {
    SIGNUP_BONUS: 'signup_bonus',
    REFERRAL_SIGNUP: 'referral_signup',
    BOOKING_CONFIRMED: 'booking_confirmation',
    BOOKING_COMPLETED: 'booking_completion',
    REDEMPTION: 'redemption',
    ADMIN_ADJUSTMENT: 'admin_adjustment',
    REVERSAL: 'refund',
  };
  return map[type];
}
