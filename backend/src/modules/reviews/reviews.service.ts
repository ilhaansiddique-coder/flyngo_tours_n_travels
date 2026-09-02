import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

const REVIEWABLE = ['tour', 'hotel', 'flight', 'visa', 'transport', 'hajj', 'umrah'];

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Customer submits a review. Created pending moderation (isApproved=false).
   * isVerified is set when the user has a completed booking for the item, so the
   * public list can badge genuine buyers. One review per user per item.
   */
  async create(
    tenantId: string,
    userId: string,
    data: { itemType: string; itemId: string; rating: number; title?: string; content: string },
  ) {
    const rating = Number(data.rating);
    if (!data.itemType || !REVIEWABLE.includes(data.itemType)) {
      throw new BadRequestException('Invalid itemType');
    }
    if (!data.itemId) throw new BadRequestException('itemId is required');
    if (!(rating >= 1 && rating <= 5)) throw new BadRequestException('rating must be 1–5');
    if (!data.content || !data.content.trim()) throw new BadRequestException('content is required');

    const existing = await this.prisma.review.findFirst({
      where: { tenantId, userId, itemType: data.itemType, itemId: data.itemId, deletedAt: null },
    });
    if (existing) throw new BadRequestException('You have already reviewed this item');

    const completed = await this.prisma.booking.findFirst({
      where: { tenantId, userId, itemId: data.itemId, status: 'completed' },
      select: { id: true },
    });

    return this.prisma.review.create({
      data: {
        tenantId,
        userId,
        itemType: data.itemType,
        itemId: data.itemId,
        rating,
        title: data.title?.trim() || null,
        content: data.content.trim(),
        isApproved: false,
        isVerified: !!completed,
      },
    });
  }

  /** Public: approved reviews for a product + aggregate summary. */
  async listPublic(tenantId: string, itemType: string, itemId: string, page = 1, limit = 20) {
    const where: any = { tenantId, itemType, itemId, isApproved: true, deletedAt: null };
    const [items, total, agg] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, fullName: true } } },
      }),
      this.prisma.review.count({ where }),
      this.prisma.review.aggregate({ where, _avg: { rating: true } }),
    ]);
    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      summary: { count: total, averageRating: Math.round((agg._avg.rating ?? 0) * 10) / 10 },
    };
  }

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
