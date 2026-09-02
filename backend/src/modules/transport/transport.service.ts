import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { buildSearchOr } from '../../common/utils/search.util';
import { ListQueryDto, orderByFor, priceRange } from '../../common/dto/list-query.dto';

@Injectable()
export class TransportService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 20, q?: string, filters: ListQueryDto = {}) {
    const where: any = { tenantId, deletedAt: null };

    const price = priceRange(filters.minPrice, filters.maxPrice);
    if (price) where.price = price;
    if (filters.vehicleType) where.vehicleType = filters.vehicleType;

    const or = buildSearchOr(q, [
      (term) => ({ title: { contains: term, mode: 'insensitive' } }),
      (term) => ({ operatorName: { contains: term, mode: 'insensitive' } }),
      (term) => ({ originCity: { contains: term, mode: 'insensitive' } }),
      (term) => ({ destinationCity: { contains: term, mode: 'insensitive' } }),
    ]);
    if (or) where.OR = or;
    const [items, total] = await Promise.all([
      this.prisma.transport.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: orderByFor(filters.sort, 'price'),
      }),
      this.prisma.transport.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string, tenantId: string) {
    const item = await this.prisma.transport.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!item) throw new NotFoundException('Transport not found');
    return item;
  }

  async create(tenantId: string, data: any) {
    return this.prisma.transport.create({
      data: {
        tenantId,
        vehicleType: data.vehicleType,
        operatorName: data.operatorName,
        title: data.title,
        originCity: data.originCity,
        destinationCity: data.destinationCity,
        boardingPoints: data.boardingPoints || [],
        droppingPoints: data.droppingPoints || [],
        departureTime: data.departureTime,
        arrivalTime: data.arrivalTime,
        duration: data.duration,
        price: data.price,
        currency: data.currency || 'BDT',
        totalSeats: data.totalSeats ?? 0,
        availableSeats: data.availableSeats ?? 0,
        amenities: data.amenities || [],
        isActive: data.isActive ?? true,
        pointsAwarded: Number(data.pointsAwarded) || 0,
      },
    });
  }

  async update(id: string, tenantId: string, data: any) {
    const existing = await this.prisma.transport.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Transport not found');
    return this.prisma.transport.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    const existing = await this.prisma.transport.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Transport not found');
    return this.prisma.transport.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
