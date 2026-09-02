import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MarketingService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveCoupons(tenantId: string) {
    return this.prisma.coupon.findMany({
      where: { tenantId, deletedAt: null, isActive: true, startDate: { lte: new Date() }, endDate: { gte: new Date() } },
    });
  }

  async validateCoupon(code: string, tenantId: string) {
    const coupon = await this.prisma.coupon.findFirst({
      where: { code, tenantId, deletedAt: null, isActive: true, startDate: { lte: new Date() }, endDate: { gte: new Date() } },
    });
    if (!coupon) return { valid: false, message: 'Invalid or expired coupon' };
    // maxUses = 0 means unlimited — only enforce a real cap.
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      return { valid: false, message: 'Coupon usage limit reached' };
    }
    return { valid: true, coupon };
  }

  /**
   * Compute the discount a coupon yields for a given subtotal + item type.
   * Returns { discount, couponId } (discount 0 with a message when it doesn't
   * apply). Used at booking time so the discount is authoritative server-side.
   */
  async computeCouponDiscount(
    tenantId: string,
    code: string | undefined | null,
    subtotal: number,
    itemType: string,
  ): Promise<{ discount: number; couponId: string | null; code: string | null; message?: string }> {
    if (!code || !code.trim()) return { discount: 0, couponId: null, code: null };
    const res = await this.validateCoupon(code.trim(), tenantId);
    if (!res.valid || !res.coupon) return { discount: 0, couponId: null, code: null, message: res.message };
    const c = res.coupon;

    if (Array.isArray(c.applicableTo) && c.applicableTo.length > 0 && !c.applicableTo.includes(itemType)) {
      return { discount: 0, couponId: null, code: null, message: `Coupon not valid for ${itemType} bookings` };
    }
    if (c.minPurchase != null && subtotal < Number(c.minPurchase)) {
      return { discount: 0, couponId: null, code: null, message: `Minimum spend of ${Number(c.minPurchase)} required` };
    }

    let discount = c.type === 'percentage' ? (subtotal * Number(c.value)) / 100 : Number(c.value);
    if (c.maxDiscount != null) discount = Math.min(discount, Number(c.maxDiscount));
    discount = Math.max(0, Math.min(discount, subtotal)); // never negative, never over subtotal
    discount = Math.round(discount * 100) / 100;
    return { discount, couponId: c.id, code: c.code };
  }

  /** Atomically bump a coupon's used count after it's applied to a booking. */
  async incrementCouponUsage(couponId: string) {
    return this.prisma.coupon.update({
      where: { id: couponId },
      data: { usedCount: { increment: 1 } },
    });
  }

  async listAllCoupons(tenantId: string, page = 1, limit = 20) {
    const where = { tenantId, deletedAt: null };
    const [items, total] = await Promise.all([
      this.prisma.coupon.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.coupon.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async createCoupon(tenantId: string, data: any) {
    const existing = await this.prisma.coupon.findFirst({ where: { tenantId, code: data.code } });
    if (existing) throw new ConflictException('A coupon with this code already exists');

    return this.prisma.coupon.create({
      data: {
        tenantId, code: data.code, type: data.type, value: data.value,
        minPurchase: data.minPurchase, maxDiscount: data.maxDiscount,
        maxUses: data.maxUses || 0, usedCount: 0,
        startDate: new Date(data.startDate), endDate: new Date(data.endDate),
        isActive: data.isActive ?? true, applicableTo: data.applicableTo || [],
      },
    });
  }

  async updateCoupon(id: string, tenantId: string, data: any) {
    const existing = await this.prisma.coupon.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Coupon not found');

    if (data.code && data.code !== existing.code) {
      const dupe = await this.prisma.coupon.findFirst({ where: { tenantId, code: data.code, id: { not: id } } });
      if (dupe) throw new ConflictException('A coupon with this code already exists');
    }

    return this.prisma.coupon.update({
      where: { id },
      data: {
        code: data.code, type: data.type, value: data.value,
        minPurchase: data.minPurchase, maxDiscount: data.maxDiscount,
        maxUses: data.maxUses, isActive: data.isActive,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        applicableTo: data.applicableTo,
      },
    });
  }

  async removeCoupon(id: string, tenantId: string) {
    const existing = await this.prisma.coupon.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Coupon not found');
    return this.prisma.coupon.delete({ where: { id } });
  }
}
