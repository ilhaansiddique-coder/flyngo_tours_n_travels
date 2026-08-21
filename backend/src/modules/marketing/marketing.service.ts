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
    if (coupon.usedCount >= coupon.maxUses) return { valid: false, message: 'Coupon usage limit reached' };
    return { valid: true, coupon };
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
