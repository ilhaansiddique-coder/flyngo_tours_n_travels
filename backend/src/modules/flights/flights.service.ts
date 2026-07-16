import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FlightsService {
  constructor(private readonly prisma: PrismaService) {}

  async search(tenantId: string, params: { origin?: string; destination?: string; date?: string }, page = 1, limit = 20) {
    const where: any = { tenantId, deletedAt: null };

    if (params.origin) where.originCode = params.origin;
    if (params.destination) where.destinationCode = params.destination;

    const [items, total] = await Promise.all([
      this.prisma.flight.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { departureTime: 'asc' },
      }),
      this.prisma.flight.count({ where }),
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string, tenantId: string) {
    return this.prisma.flight.findFirst({
      where: { id, tenantId },
    });
  }
}
