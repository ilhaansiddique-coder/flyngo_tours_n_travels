import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

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

  private generateBookingCode(): string {
    return `FLY-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }
}
