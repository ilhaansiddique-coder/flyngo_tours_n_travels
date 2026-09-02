import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { buildSearchOr } from '../../common/utils/search.util';
import { ListQueryDto, orderByFor, priceRange } from '../../common/dto/list-query.dto';

@Injectable()
export class FlightsService {
  constructor(private readonly prisma: PrismaService) {}

  async search(
    tenantId: string,
    params: ListQueryDto & { origin?: string; destination?: string; date?: string; q?: string },
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
    const or = buildSearchOr(params.q, [
      (term) => ({ airline: { contains: term, mode: 'insensitive' } }),
      (term) => ({ flightNumber: { contains: term, mode: 'insensitive' } }),
      (term) => ({ originCity: { contains: term, mode: 'insensitive' } }),
      (term) => ({ destinationCity: { contains: term, mode: 'insensitive' } }),
      // Airport codes, so "DAC" matches even when the city name doesn't.
      (term) => ({ originCode: { contains: term, mode: 'insensitive' } }),
      (term) => ({ destinationCode: { contains: term, mode: 'insensitive' } }),
    ]);
    if (or) where.OR = or;

    const price = priceRange(params.minPrice, params.maxPrice);
    if (price) where.price = price;
    if (params.cabinClass) where.cabinClass = params.cabinClass;
    if (params.airline) where.airline = { contains: params.airline, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      this.prisma.flight.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: params.sort ? orderByFor(params.sort, 'price') : { departureTime: 'asc' } }),
      this.prisma.flight.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string, tenantId: string) {
    const flight = await this.prisma.flight.findFirst({ where: { id, tenantId, deletedAt: null } });
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
        coverImageUrl: data.coverImageUrl,
        departureTime: new Date(data.departureTime),
        arrivalTime: new Date(data.arrivalTime),
        duration: data.duration,
        price: data.price,
        currency: data.currency || 'USD',
        availableSeats: data.availableSeats || 0,
        cabinClass: data.cabinClass,
        isActive: data.isActive ?? true,
        pointsAwarded: Number(data.pointsAwarded) || 0,
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
        coverImageUrl: data.coverImageUrl,
        departureTime: data.departureTime ? new Date(data.departureTime) : undefined,
        arrivalTime: data.arrivalTime ? new Date(data.arrivalTime) : undefined,
        duration: data.duration,
        price: data.price,
        currency: data.currency,
        availableSeats: data.availableSeats,
        cabinClass: data.cabinClass,
        isActive: data.isActive,
        pointsAwarded: data.pointsAwarded === undefined ? undefined : Number(data.pointsAwarded) || 0,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    const existing = await this.prisma.flight.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Flight not found');
    return this.prisma.flight.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
