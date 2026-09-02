import { Injectable, NotFoundException } from '@nestjs/common';
import { PointReferenceType, PointTransactionType } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { ConfigService } from '../../../config/config.service';
import { LedgerService } from '../ledger/ledger.service';

@Injectable()
export class LoyaltyReferralService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly ledger: LedgerService,
  ) {}

  /**
   * Callable by a future email/OTP verification handler. Phase 1 has no such
   * handler, so raw password registration deliberately does not call this.
   * There is no referral reward cap in the Phase 1 policy.
   */
  async onUserVerified(tenantId: string, referredUserId: string) {
    const settings = await this.prisma.referralSetting.findUnique({ where: { tenantId } });
    if (settings && !settings.isEnabled) return null;
    const referred = await this.prisma.user.findFirst({
      where: { id: referredUserId, tenantId, deletedAt: null },
      select: { id: true, referredByCode: true, emailVerifiedAt: true, phoneVerifiedAt: true, phone: true },
    });
    if (!referred || (!referred.emailVerifiedAt && !referred.phoneVerifiedAt) || !referred.referredByCode) return null;

    const referrer = await this.prisma.user.findFirst({
      where: { tenantId, referralCode: referred.referredByCode, deletedAt: null, isActive: true },
      select: { id: true, phone: true },
    });
    if (!referrer || referrer.id === referred.id || this.samePhone(referrer.phone, referred.phone)) return null;

    // Record the attribution regardless of whether signup points are awarded —
    // the referrer's real earning is the commission on the referee's purchases.
    await this.prisma.affiliateReferral.updateMany({
      where: { tenantId, referredUserId: referred.id, status: { in: ['pending', 'registered'] } },
      data: { status: 'registered', registeredAt: new Date() },
    });

    // Optional referrer signup reward — configurable, default 0 (off).
    const reward = settings?.referrerSignupPoints ?? 0;
    if (reward <= 0) return null;

    const result = await this.ledger.post({
      userId: referrer.id,
      type: PointTransactionType.REFERRAL_SIGNUP,
      amount: reward,
      referenceType: PointReferenceType.REFERRAL,
      referenceId: referred.id,
      idempotencyKey: `referral:${referred.id}:signup`,
      metadata: { referredUserId: referred.id, reward },
    });
    return result.transaction;
  }

  /**
   * Signup bonus — every newly registered user receives a fixed number of
   * loyalty points (default 100) the moment they sign up, independent of any
   * referral. Credited immediately as available (POSTED). Idempotent on the
   * user id via the ledger's unique key, so linking an OAuth identity onto a
   * pre-existing account never double-credits. The amount is read from
   * ReferralSetting.signupBonusPoints so an admin can change it.
   */
  async awardSignupBonus(tenantId: string, userId: string) {
    const settings = await this.prisma.referralSetting.findUnique({ where: { tenantId } });
    if (settings && !settings.isEnabled) return null;
    const points = settings?.signupBonusPoints ?? 100;
    if (points <= 0) return null;

    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null },
      select: { id: true },
    });
    if (!user) return null;

    const result = await this.ledger.post({
      userId: user.id,
      type: PointTransactionType.SIGNUP_BONUS,
      amount: points,
      referenceType: PointReferenceType.SIGNUP,
      referenceId: user.id,
      idempotencyKey: `signup-bonus:${user.id}`,
      metadata: { reason: 'signup_bonus', points },
    });
    return result.transaction;
  }

  async getReferralLink(tenantId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null },
      select: { id: true, referralCode: true },
    });
    if (!user) throw new NotFoundException('User not found');

    let code = user.referralCode;
    if (!code) {
      code = await this.newCode();
      await this.prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
    }
    const affiliate = await this.prisma.affiliate.findUnique({ where: { userId }, select: { referralCode: true } });
    if (!affiliate) {
      await this.prisma.affiliate.create({ data: { tenantId, userId, referralCode: code } });
    } else if (affiliate.referralCode !== code) {
      code = affiliate.referralCode;
      await this.prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
    }
    const baseUrl = (this.config.getOrNull('FRONTEND_URL') || '').replace(/\/$/, '');
    return { code, url: `${baseUrl}/?ref=${encodeURIComponent(code)}` };
  }

  async listReferrals(tenantId: string, userId: string, status?: string) {
    const affiliate = await this.prisma.affiliate.findUnique({ where: { userId }, select: { id: true } });
    if (!affiliate) return { items: [], stats: { total: 0, registered: 0, converted: 0 } };
    const referrals = await this.prisma.affiliateReferral.findMany({
      where: { tenantId, affiliateId: affiliate.id, ...(status ? { status } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    const users = await this.prisma.user.findMany({
      where: { id: { in: referrals.map((referral) => referral.referredUserId) } },
      select: { id: true, fullName: true, createdAt: true },
    });
    const usersById = new Map(users.map((user) => [user.id, user]));
    const [total, registered, converted, pointsEarned] = await Promise.all([
      this.prisma.affiliateReferral.count({ where: { tenantId, affiliateId: affiliate.id } }),
      this.prisma.affiliateReferral.count({ where: { tenantId, affiliateId: affiliate.id, status: 'registered' } }),
      this.prisma.affiliateReferral.count({ where: { tenantId, affiliateId: affiliate.id, status: 'converted' } }),
      this.prisma.pointTransaction.aggregate({
        where: {
          userId,
          type: PointTransactionType.REFERRAL_SIGNUP,
          referenceType: PointReferenceType.REFERRAL,
        },
        _sum: { amount: true },
      }),
    ]);
    return {
      items: referrals.map((referral) => ({ ...referral, referredUser: usersById.get(referral.referredUserId) ?? null })),
      stats: { total, registered, converted, pointsEarned: pointsEarned._sum.amount ?? 0 },
    };
  }

  private async newCode() {
    const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    for (let attempt = 0; attempt < 8; attempt++) {
      const code = Array.from({ length: 8 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
      const existing = await this.prisma.user.findFirst({ where: { referralCode: code } });
      if (!existing) return code;
    }
    return `REF${Date.now().toString(36).toUpperCase()}`;
  }

  private samePhone(left: string | null, right: string | null) {
    if (!left || !right) return false;
    return left.replace(/\D/g, '') === right.replace(/\D/g, '');
  }
}
