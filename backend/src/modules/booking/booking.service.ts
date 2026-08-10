import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateHotelBookingDto } from './dto/create-hotel-booking.dto';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(tenantId: string, userId: string, data: {
    type: 'tour' | 'hotel' | 'flight' | 'visa' | 'package';
    itemId: string; startDate: Date; endDate?: Date; guests?: number; notes?: string;
  }) {
    return this.prisma.booking.create({
      data: {
        tenantId, userId, bookingType: data.type, itemId: data.itemId,
        startDate: data.startDate, endDate: data.endDate, guests: data.guests || 1,
        notes: data.notes, status: 'pending', bookingCode: this.generateBookingCode(),
      },
    });
  }

  async getUserBookings(tenantId: string, userId: string, page = 1, limit = 20) {
    const where = { tenantId, userId, deletedAt: null };
    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.booking.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async listAllBookings(tenantId: string, page = 1, limit = 20) {
    const where = { tenantId, deletedAt: null };
    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({
        where, skip: (page - 1) * limit, take: limit,
        include: { user: { select: { id: true, fullName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.booking.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getBookingById(id: string, tenantId: string, userId?: string) {
    const where: any = { id, tenantId };
    if (userId) where.userId = userId;
    const booking = await this.prisma.booking.findFirst({
      where, include: { payments: true, user: { select: { id: true, fullName: true, email: true } } },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async updateStatus(id: string, tenantId: string, status: string) {
    const booking = await this.prisma.booking.findFirst({ where: { id, tenantId } });
    if (!booking) throw new NotFoundException('Booking not found');
    return this.prisma.booking.update({
      where: { id },
      data: { status, cancelledAt: status === 'cancelled' ? new Date() : null },
    });
  }

  async cancelBooking(id: string, tenantId: string, userId: string) {
    const booking = await this.getBookingById(id, tenantId, userId);
    if (booking.status === 'cancelled') throw new BadRequestException('Booking is already cancelled');
    if (booking.status === 'completed') throw new BadRequestException('Cannot cancel a completed booking');
    return this.prisma.booking.update({ where: { id }, data: { status: 'cancelled', cancelledAt: new Date() } });
  }

  async adminCreateBooking(tenantId: string, data: {
    userId: string;
    type: 'tour' | 'hotel' | 'flight' | 'visa' | 'package';
    itemId: string;
    startDate: string;
    endDate?: string;
    guests?: number;
    notes?: string;
    totalAmount?: number;
  }) {
    const user = await this.prisma.user.findFirst({ where: { id: data.userId, tenantId } });
    if (!user) throw new BadRequestException('User not found in this tenant');
    return this.prisma.booking.create({
      data: {
        tenantId,
        userId: data.userId,
        bookingType: data.type,
        itemId: data.itemId,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        guests: data.guests || 1,
        notes: data.notes,
        status: 'pending',
        totalAmount: data.totalAmount ?? 0,
        bookingCode: this.generateBookingCode(),
      },
      include: { user: { select: { id: true, fullName: true, email: true } } },
    });
  }

  private generateBookingCode(): string {
    return `FLY-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }

  async createHotelBooking(tenantId: string, userId: string, dto: CreateHotelBookingDto) {
    const checkIn = new Date(dto.checkInDate);
    const checkOut = new Date(dto.checkOutDate);

    // Normalise to midnight UTC so a same-day booking is always 0 nights, never a
    // fractional value that Math.round could bump up to 1.
    const startOfDay = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    const nights = (startOfDay(checkOut) - startOfDay(checkIn)) / 86_400_000;
    if (nights < 1) throw new BadRequestException('checkOutDate must be at least one night after checkInDate');

    const roomsCount = dto.roomsCount ?? 1;
    const adults = dto.adults ?? 1;
    const children = dto.children ?? 0;
    const childAges = dto.childAges ?? [];

    if (children > 0 && childAges.length !== children) {
      throw new BadRequestException(`childAges must contain exactly ${children} entries`);
    }

    const room = await this.prisma.room.findFirst({
      where: { id: dto.roomId, hotelId: dto.hotelId },
      include: { hotel: { select: { id: true, name: true, tenantId: true } } },
    });
    if (!room) throw new BadRequestException('Room not found for this hotel');
    if (room.hotel.tenantId !== tenantId) throw new BadRequestException('Room not found for this hotel');

    if (adults + children > room.capacity * roomsCount) {
      throw new BadRequestException(
        `Selected rooms hold up to ${room.capacity * roomsCount} guests, but ${adults + children} were provided`,
      );
    }

    // Rooms already committed for any date range that overlaps this stay. Two stays
    // overlap when each starts before the other ends; touching ranges (one checks out
    // the day another checks in) are not an overlap.
    const overlapping = await this.prisma.booking.aggregate({
      _sum: { roomsCount: true },
      where: {
        roomId: dto.roomId,
        tenantId,
        deletedAt: null,
        status: { notIn: ['cancelled'] },
        startDate: { lt: checkOut },
        endDate: { gt: checkIn },
      },
    });

    const alreadyBooked = overlapping._sum.roomsCount ?? 0;
    if (alreadyBooked + roomsCount > room.available) {
      throw new BadRequestException(
        `Only ${Math.max(room.available - alreadyBooked, 0)} room(s) left for these dates`,
      );
    }

    // Priced server-side from the room record; a client-supplied total is never trusted.
    const pricePerNight = room.pricePerNight;
    const totalAmount = pricePerNight.mul(nights).mul(roomsCount);

    const { leadGuest } = dto;
    const travelers = [
      {
        tenantId,
        isLead: true,
        fullName: `${leadGuest.firstName} ${leadGuest.lastName}`.trim(),
        email: leadGuest.email,
        phone: leadGuest.phone,
        type: 'adult',
      },
      ...(dto.additionalGuests ?? []).map((g) => ({
        tenantId,
        isLead: false,
        fullName: g.fullName,
        age: g.age,
        type: g.type ?? 'adult',
      })),
    ];

    return this.prisma.booking.create({
      data: {
        tenantId,
        userId,
        bookingType: 'hotel',
        itemId: dto.hotelId,
        bookingCode: this.generateBookingCode(),
        status: 'pending',
        startDate: checkIn,
        endDate: checkOut,
        guests: adults + children,
        totalAmount,
        currency: room.currency,
        couponCode: dto.couponCode,
        notes: dto.specialRequests,
        hotelId: dto.hotelId,
        roomId: dto.roomId,
        hotelName: room.hotel.name,
        roomName: room.name,
        roomsCount,
        adults,
        children,
        childAges,
        mealPlan: dto.mealPlan,
        nights,
        pricePerNight,
        arrivalTime: dto.arrivalTime,
        flightNumber: dto.flightNumber,
        travelers: { create: travelers },
      },
      include: { travelers: true },
    });
  }
}
