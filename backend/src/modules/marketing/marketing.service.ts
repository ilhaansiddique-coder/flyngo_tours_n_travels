import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MarketingService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveCoupons(tenantId: string) {
    return this.prisma.coupon.findMany({
      where: {
        tenantId,
        deletedAt: null,
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    });
  }

  async validateCoupon(code: string, tenantId: string) {
    const coupon = await this.prisma.coupon.findFirst({
      where: {
        code,
        tenantId,
        deletedAt: null,
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    });

    if (!coupon) return { valid: false, message: 'Invalid or expired coupon' };
    if (coupon.usedCount >= coupon.maxUses) return { valid: false, message: 'Coupon usage limit reached' };

    return { valid: true, coupon };
  }

  async getAffiliateStats(tenantId: string, affiliateId: string) {
    const [referrals, commissions] = await Promise.all([
      this.prisma.affiliateReferral.count({ where: { tenantId, affiliateId } }),
      this.prisma.affiliateCommission.aggregate({
        where: { tenantId, affiliateId, status: 'paid' },
        _sum: { amount: true },
      }),
    ]);

    return { referrals, totalCommissions: commissions._sum.amount || 0 };
  }
}
