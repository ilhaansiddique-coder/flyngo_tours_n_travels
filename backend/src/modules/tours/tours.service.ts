import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ToursService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.prisma.tour.findMany({
        where: { tenantId, deletedAt: null },
        skip: (page - 1) * limit,
        take: limit,
        include: { destination: true, images: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tour.count({ where: { tenantId, deletedAt: null } }),
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string, tenantId: string) {
    return this.prisma.tour.findFirst({
      where: { id, tenantId },
      include: {
        destination: true,
        images: true,
        itinerary: { orderBy: { day: 'asc' } },
      },
    });
  }
}
