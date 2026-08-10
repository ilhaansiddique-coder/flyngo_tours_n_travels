import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FlightsService {
  constructor(private readonly prisma: PrismaService) {}

  async search(
    tenantId: string,
    params: { origin?: string; destination?: string; date?: string; q?: string },
    page = 1,
    limit = 20,
  ) {
    const where: any = { tenantId, deletedAt: null };
    if (params.origin) where.originCode = params.origin;
    if (params.destination) where.destinationCode = params.destination;
    if (params.date) {
      const dayStart = new Date(params.date);
      const dayEnd = new Date(params.date);
      dayEnd.setDate(dayEnd.getDate() + 1);
      where.departureTime = { gte: dayStart, lt: dayEnd };
    }
    if (params.q && params.q.trim()) {
      const term = params.q.trim();
      where.OR = [
        { airline: { contains: term, mode: 'insensitive' } },
        { flightNumber: { contains: term, mode: 'insensitive' } },
        { originCity: { contains: term, mode: 'insensitive' } },
        { destinationCity: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.flight.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { departureTime: 'asc' } }),
      this.prisma.flight.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string, tenantId: string) {
    const flight = await this.prisma.flight.findFirst({ where: { id, tenantId } });
    if (!flight) throw new NotFoundException('Flight not found');
    return flight;
  }

  async create(tenantId: string, data: any) {
    return this.prisma.flight.create({
      data: {
        tenantId,
        airline: data.airline,
        flightNumber: data.flightNumber,
        originCode: data.originCode,
        originCity: data.originCity,
        destinationCode: data.destinationCode,
        destinationCity: data.destinationCity,
        departureTime: new Date(data.departureTime),
        arrivalTime: new Date(data.arrivalTime),
        duration: data.duration,
        price: data.price,
        currency: data.currency || 'USD',
        availableSeats: data.availableSeats || 0,
        cabinClass: data.cabinClass,
        isActive: data.isActive ?? true,
      },
    });
  }

  async update(id: string, tenantId: string, data: any) {
    const existing = await this.prisma.flight.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Flight not found');

    return this.prisma.flight.update({
      where: { id },
      data: {
        airline: data.airline,
        flightNumber: data.flightNumber,
        originCode: data.originCode,
        originCity: data.originCity,
        destinationCode: data.destinationCode,
        destinationCity: data.destinationCity,
        departureTime: data.departureTime ? new Date(data.departureTime) : undefined,
        arrivalTime: data.arrivalTime ? new Date(data.arrivalTime) : undefined,
        duration: data.duration,
        price: data.price,
        currency: data.currency,
        availableSeats: data.availableSeats,
        cabinClass: data.cabinClass,
        isActive: data.isActive,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    const existing = await this.prisma.flight.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Flight not found');
    return this.prisma.flight.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
