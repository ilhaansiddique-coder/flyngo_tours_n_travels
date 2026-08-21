import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateHotelBookingDto } from './dto/create-hotel-booking.dto';
import { ReferralService } from '../referral/referral.service';
import { TrackingService } from '../tracking/tracking.service';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly referralService: ReferralService,
    private readonly trackingService: TrackingService,
  ) {}

  async createBooking(tenantId: string, userId: string, data: {
    type: 'tour' | 'hotel' | 'flight' | 'visa' | 'package';
    itemId: string; startDate: Date; endDate?: Date; guests?: number; notes?: string;
    utm?: { utmSource?: string; utmMedium?: string; utmCampaign?: string; utmContent?: string; utmTerm?: string; gclid?: string; fbclid?: string; msclkid?: string; landingPath?: string };
  }) {
    const booking = await this.prisma.booking.create({
      data: {
        tenantId, userId, bookingType: data.type, itemId: data.itemId,
        startDate: data.startDate, endDate: data.endDate, guests: data.guests || 1,
        notes: data.notes, status: 'pending', bookingCode: this.generateBookingCode(),
        utmSource: data.utm?.utmSource,
        utmMedium: data.utm?.utmMedium,
        utmCampaign: data.utm?.utmCampaign,
        utmContent: data.utm?.utmContent,
        utmTerm: data.utm?.utmTerm,
        gclid: data.utm?.gclid,
        fbclid: data.utm?.fbclid,
        msclkid: data.utm?.msclkid,
        landingPath: data.utm?.landingPath,
      },
    });

    // Emit server-side tracking events
    void this.trackingService.emitServerEvent(tenantId, 'initiate_checkout', {
      userId,
      value: Number(booking.totalAmount || 0),
      currency: booking.currency,
      contentName: `${booking.bookingType}:${booking.itemId}`,
      contentIds: [booking.itemId],
    });

    // Attempt referral conversion if this booking's pending status is in the conversion list
    try {
      await this.referralService.recordBookingConversion(tenantId, {
        bookingId: booking.id,
        userId,
        bookingTotal: Number(booking.totalAmount || 0),
        bookingCurrency: booking.currency,
        status: booking.status,
      });
    } catch (err: any) {
      this.logger.warn(`Referral conversion (createBooking) failed: ${err.message}`);
    }

    return booking;
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
    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status, cancelledAt: status === 'cancelled' ? new Date() : null },
    });

    // Re-evaluate referral conversion with the new status (idempotent inside the service)
    try {
      await this.referralService.recordBookingConversion(tenantId, {
        bookingId: id,
        userId: booking.userId,
        bookingTotal: Number(updated.totalAmount || 0),
        bookingCurrency: updated.currency,
        status,
      });
    } catch (err: any) {
      this.logger.warn(`Referral conversion (updateStatus) failed: ${err.message}`);
    }

    // Emit purchase event when status becomes "confirmed" — fires Meta CAPI + GA4
    if (status === 'confirmed' || status === 'completed') {
      void this.trackingService.emitServerEvent(tenantId, 'purchase', {
        userId: booking.userId,
        value: Number(updated.totalAmount || 0),
        currency: updated.currency,
        contentName: `${updated.bookingType}:${updated.itemId}`,
        contentIds: [updated.itemId],
        utmSource: updated.utmSource ?? undefined,
        utmMedium: updated.utmMedium ?? undefined,
        utmCampaign: updated.utmCampaign ?? undefined,
        utmContent: updated.utmContent ?? undefined,
        utmTerm: updated.utmTerm ?? undefined,
        gclid: updated.gclid ?? undefined,
        fbclid: updated.fbclid ?? undefined,
      });
    }

    return updated;
  }

  async cancelBooking(id: string, tenantId: string, userId: string) {
    const booking = await this.getBookingById(id, tenantId, userId);
    if (booking.status === 'cancelled') throw new BadRequestException('Booking is already cancelled');
    if (booking.status === 'completed') throw new BadRequestException('Cannot cancel a completed booking');
    const updated = await this.prisma.booking.update({ where: { id }, data: { status: 'cancelled', cancelledAt: new Date() } });

    // Cancel any pending referral commission tied to this booking
    try {
      await this.prisma.affiliateCommission.updateMany({
        where: { tenantId, bookingId: id, status: 'pending' },
        data: { status: 'cancelled' },
      });
      await this.prisma.affiliateReferral.updateMany({
        where: { tenantId, referredUserId: userId, status: 'converted' },
        data: { status: 'cancelled', cancelledAt: new Date() },
      });
    } catch (err: any) {
      this.logger.warn(`Could not cancel referral commission: ${err.message}`);
    }

    return updated;
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

    // Apply referral referee discount if this user signed up via a referral link
    // (and the cookie window hasn't expired).
    const referralDiscountInfo = await this.referralService.resolveDiscountForUser(
      tenantId,
      userId,
      Number(totalAmount),
    );
    const referralDiscount = referralDiscountInfo.discount;
    const referredByCode = referralDiscountInfo.code;

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

    const booking = await this.prisma.booking.create({
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
        referredByCode,
        referralDiscount,
        travelers: { create: travelers },
      },
      include: { travelers: true },
    });

    // Emit server initiate_checkout event
    void this.trackingService.emitServerEvent(tenantId, 'initiate_checkout', {
      userId,
      value: Number(totalAmount),
      currency: room.currency,
      contentName: `hotel:${room.hotel.name}`,
      contentIds: [dto.hotelId, dto.roomId].filter(Boolean),
    });

    // Record referral conversion (idempotent — pending status usually not in conversion list,
    // so this is a no-op here and will fire when admin confirms the booking).
    try {
      await this.referralService.recordBookingConversion(tenantId, {
        bookingId: booking.id,
        userId,
        bookingTotal: Number(totalAmount),
        bookingCurrency: room.currency,
        status: booking.status,
      });
    } catch (err: any) {
      this.logger.warn(`Referral conversion (createHotelBooking) failed: ${err.message}`);
    }

    return booking;
  }
}
