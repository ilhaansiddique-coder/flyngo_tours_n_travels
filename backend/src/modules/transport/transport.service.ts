import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TransportService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page = 1, limit = 20) {
    const where = { tenantId, deletedAt: null };
    const [items, total] = await Promise.all([
      this.prisma.transport.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transport.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string, tenantId: string) {
    const item = await this.prisma.transport.findFirst({ where: { id, tenantId } });
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
