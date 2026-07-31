import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 20, filters?: { itemType?: string; isApproved?: string }) {
    const where: any = { tenantId, deletedAt: null };
    if (filters?.itemType) where.itemType = filters.itemType;
    if (filters?.isApproved === 'true') where.isApproved = true;
    if (filters?.isApproved === 'false') where.isApproved = false;

    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, fullName: true, email: true } } },
      }),
      this.prisma.review.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string, tenantId: string) {
    const item = await this.prisma.review.findFirst({
      where: { id, tenantId },
      include: { user: { select: { id: true, fullName: true, email: true } } },
    });
    if (!item) throw new NotFoundException('Review not found');
    return item;
  }

  async approve(id: string, tenantId: string, isApproved: boolean) {
    const existing = await this.prisma.review.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Review not found');
    return this.prisma.review.update({ where: { id }, data: { isApproved } });
  }

  async remove(id: string, tenantId: string) {
    const existing = await this.prisma.review.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Review not found');
    return this.prisma.review.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
