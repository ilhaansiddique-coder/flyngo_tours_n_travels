import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateHotelBookingDto } from './dto/create-hotel-booking.dto';
import { ReferralService } from '../referral/referral.service';
import { TrackingService } from '../tracking/tracking.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { PaymentsService } from '../payments/payments.service';
import { EmailQueueService } from '../notifications/email-queue.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MarketingService } from '../marketing/marketing.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly referralService: ReferralService,
    private readonly trackingService: TrackingService,
    private readonly loyaltyService: LoyaltyService,
    private readonly paymentsService: PaymentsService,
    private readonly emailQueueService: EmailQueueService,
    private readonly notificationsService: NotificationsService,
    private readonly marketingService: MarketingService,
    private readonly authService: AuthService,
  ) {}

  async createBooking(tenantId: string, userId: string | null, data: {
    type: 'tour' | 'hotel' | 'flight' | 'visa' | 'package' | 'transport' | 'hajj' | 'umrah';
    itemId: string; startDate: Date; endDate?: Date; guests?: number; notes?: string;
    couponCode?: string;
    firstName?: string; lastName?: string; email?: string; phone?: string;
    meta?: Record<string, unknown>;
    utm?: { utmSource?: string; utmMedium?: string; utmCampaign?: string; utmContent?: string; utmTerm?: string; gclid?: string; fbclid?: string; msclkid?: string; landingPath?: string };
  }) {
    // This endpoint is public and takes an inline body with no DTO, so dates
    // arrive however the caller typed them. Prisma rejects a date-only
    // "2026-11-10" with "premature end of input", which surfaced as a bare 500.
    // Coerce here and reject a genuinely bad date with a message that says so.
    const startDate = this.parseDate(data.startDate, 'startDate');
    const endDate = data.endDate ? this.parseDate(data.endDate, 'endDate') : null;
    if (endDate && endDate < startDate) {
      throw new BadRequestException('endDate must be on or after startDate');
    }

    // Resolve a server-side unit price from the bookable item. Never trust a
    // client-supplied amount. Guests default to 1 so total = unit * guests.
    const unitPrice = await this.resolveItemPrice(tenantId, data.type, data.itemId);
    const guests = data.guests || 1;
    const subtotal = Number(unitPrice) * guests;
    const currency = await this.resolveItemCurrency(tenantId, data.type, data.itemId);

    // Referral / loyalty perks only apply to logged-in users. Guests (no
    // userId) simply book without those benefits.
    let referralDiscount = 0;
    let referredByCode: string | null = null;
    if (userId) {
      const referralDiscountInfo = await this.referralService.resolveDiscountForUser(
        tenantId,
        userId,
        subtotal,
      );
      referralDiscount = referralDiscountInfo.discount;
      referredByCode = referralDiscountInfo.code;
    }

    // Coupon discount — validated + computed server-side against the subtotal
    // (after referral). Usage is incremented only once the booking is created.
    const coupon = await this.marketingService.computeCouponDiscount(
      tenantId,
      data.couponCode,
      subtotal - referralDiscount,
      data.type,
    );
    const couponDiscount = coupon.discount;

    const finalTotal = Math.max(0, subtotal - referralDiscount - couponDiscount);

    // Capture guest contact details (provided on the public booking form) so the
    // team can follow up even when there is no linked account.
    const leadContact = !userId
      ? this.formatGuestContact(data.firstName, data.lastName, data.email, data.phone)
      : null;
    const notes = [data.notes, leadContact].filter(Boolean).join('\n\n') || undefined;

    // Always store a structured customer name + phone so the admin table shows
    // who booked — for guests AND signed-in users. Prefer the submitted form
    // details; backfill from the account when a signed-in user left them blank.
    let customerName = [data.firstName, data.lastName].filter(Boolean).join(' ').trim() || null;
    let customerPhone = (data.phone || '').trim() || null;
    if (userId && (!customerName || !customerPhone)) {
      const u = await this.prisma.user.findUnique({ where: { id: userId }, select: { fullName: true, phone: true } });
      if (u) {
        customerName = customerName || u.fullName || null;
        customerPhone = customerPhone || u.phone || null;
      }
    }

    // Capture-first: a guest booking creates (or reuses) a provisional account
    // keyed on their phone number, so the booking has a customer record staff
    // can act on and credentials can be issued later. It never signs anyone in
    // and never tells the caller whether an account already existed.
    const account = await this.authService.resolveBookingAccount(tenantId, userId, {
      fullName: customerName,
      phone: customerPhone,
      email: data.email ?? null,
    });
    const bookingUserId = account.userId;

    const booking = await this.prisma.booking.create({
      data: {
        tenantId, userId: bookingUserId, bookingType: data.type, itemId: data.itemId,
        customerName, customerPhone,
        startDate, endDate, guests,
        notes, status: 'pending', bookingCode: this.generateBookingCode(),
        // Whatever the flow-specific wizard collected (visa application answers,
        // custom-quote brief). Sanitised so a client can't dump unbounded data.
        meta: this.sanitizeMeta(data.meta),
        totalAmount: finalTotal,
        discountAmount: (referralDiscount + couponDiscount) || 0,
        referralDiscount,
        referredByCode,
        couponCode: coupon.code,
        currency,
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

    // Coupon consumed — bump its usage now that a booking exists. Non-fatal.
    if (coupon.couponId) {
      this.marketingService.incrementCouponUsage(coupon.couponId).catch((err: any) =>
        this.logger.warn(`Coupon usage increment failed: ${err.message}`),
      );
    }

    // Emit server-side tracking events
    void this.trackingService.emitServerEvent(tenantId, 'initiate_checkout', {
      userId: userId ?? undefined,
      value: Number(booking.totalAmount || 0),
      currency: booking.currency,
      contentName: `${booking.bookingType}:${booking.itemId}`,
      contentIds: [booking.itemId],
      email: data.email ?? undefined,
      phone: customerPhone ?? undefined,
      fullName: customerName ?? undefined,
    });

    // Attempt referral conversion if this booking's pending status is in the conversion list
    if (userId) {
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
    }

    return booking;
  }

  private formatGuestContact(firstName?: string, lastName?: string, email?: string, phone?: string): string | null {
    const name = [firstName, lastName].filter(Boolean).join(' ').trim();
    const parts = [
      name && `Lead: ${name}`,
      email && `Email: ${email}`,
      phone && `Phone: ${phone}`,
    ].filter(Boolean);
    return parts.length ? parts.join('  |  ') : null;
  }

  async getUserBookings(tenantId: string, userId: string, page = 1, limit = 20) {
    const where = { tenantId, userId, deletedAt: null };
    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.booking.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async listAllBookings(tenantId: string, page = 1, limit = 20, status?: string, type?: string, search?: string) {
    const where: any = {
      tenantId,
      deletedAt: null,
    };
    if (status) {
      where.status = status;
    }
    if (type) {
      where.bookingType = type;
    }
    // Search spans the booking code, customer name/phone and the linked
    // account's name/email, so admins can hunt past-page bookings by typing.
    const q = (search || '').trim();
    if (q) {
      where.OR = [
        { bookingCode: { contains: q, mode: 'insensitive' } },
        { customerName: { contains: q, mode: 'insensitive' } },
        { customerPhone: { contains: q } },
        { user: { is: { fullName: { contains: q, mode: 'insensitive' } } } },
        { user: { is: { email: { contains: q, mode: 'insensitive' } } } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({
        where, skip: (page - 1) * limit, take: limit,
        include: {
          user: { select: { id: true, fullName: true, email: true, accountStatus: true } },
          payments: {
            orderBy: { createdAt: 'desc' },
            select: {
              id: true, amount: true, currency: true, method: true, status: true,
              transactionId: true, bkashTrxId: true, createdAt: true,
              receiptUrls: true, senderName: true, senderAccount: true, payerPhone: true, notes: true, verifiedAt: true,
            },
          },
          invoices: {
            select: {
              id: true, invoiceNumber: true, status: true, total: true, paidAmount: true, currency: true, issuedAt: true, paidAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.booking.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  // ---- Trash (soft delete / restore) ---------------------------------------
  // Bookings are never hard-deleted by default: `deletedAt` moves them out of
  // every list (which all filter deletedAt: null) into the trash, from where an
  // admin can restore them or purge them for good.

  /** Move a booking to the trash. Reverses any loyalty points it had awarded. */
  async softDeleteBooking(id: string, tenantId: string) {
    const booking = await this.prisma.booking.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!booking) throw new NotFoundException('Booking not found');

    // A trashed booking shouldn't keep crediting the customer.
    if (booking.userId) {
      try {
        await this.loyaltyService.reverseBookingPoints(tenantId, id, booking.userId);
      } catch (err: any) {
        this.logger.warn(`Loyalty reversal (softDelete) failed: ${err.message}`);
      }
    }
    return this.prisma.booking.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  /** List trashed bookings (admin). */
  async listTrashedBookings(tenantId: string, page = 1, limit = 20) {
    const where = { tenantId, deletedAt: { not: null } };
    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({
        where, skip: (page - 1) * limit, take: limit,
        include: { user: { select: { id: true, fullName: true, email: true, accountStatus: true } } },
        orderBy: { deletedAt: 'desc' },
      }),
      this.prisma.booking.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  /** Restore a trashed booking back into the active list. */
  async restoreBooking(id: string, tenantId: string) {
    const booking = await this.prisma.booking.findFirst({ where: { id, tenantId, deletedAt: { not: null } } });
    if (!booking) throw new NotFoundException('Booking not found in trash');
    return this.prisma.booking.update({ where: { id }, data: { deletedAt: null } });
  }

  /** Permanently remove a trashed booking (irreversible). */
  async purgeBooking(id: string, tenantId: string) {
    const booking = await this.prisma.booking.findFirst({ where: { id, tenantId, deletedAt: { not: null } } });
    if (!booking) throw new NotFoundException('Booking not found in trash — move it to trash before deleting permanently');
    await this.prisma.payment.deleteMany({ where: { bookingId: id } });
    await this.prisma.booking.delete({ where: { id } });
    return { success: true };
  }

  /**
   * Public booking lookup by the FLY-XXXX code shown after checkout. Returns
   * only non-personal fields so anyone with the code can check status without
   * exposing contact/payment details.
   */
  async trackByCode(tenantId: string, code: string) {
    const trimmed = code.trim();
    const booking = await this.prisma.booking.findFirst({
      where: { tenantId, bookingCode: trimmed, deletedAt: null },
      select: {
        bookingCode: true, bookingType: true, status: true,
        startDate: true, endDate: true, createdAt: true,
        totalAmount: true, paidAmount: true, currency: true,
      },
    });
    if (booking) return booking;

    // Hajj/Umrah bookings live in their own table but share the FLY- code
    // format, so the same public tracker resolves them. Mapped onto the same
    // shape the /track page renders.
    const pilgrimage = await this.prisma.hajjUmrahBooking.findFirst({
      where: { tenantId, bookingCode: trimmed },
      select: {
        bookingCode: true, kind: true, status: true,
        departureDate: true, returnDate: true, createdAt: true,
        totalAmount: true, advancePaid: true, currency: true,
      },
    });
    if (pilgrimage) {
      return {
        bookingCode: pilgrimage.bookingCode,
        bookingType: pilgrimage.kind,
        status: pilgrimage.status,
        startDate: pilgrimage.departureDate,
        endDate: pilgrimage.returnDate,
        createdAt: pilgrimage.createdAt,
        totalAmount: pilgrimage.totalAmount,
        paidAmount: pilgrimage.advancePaid,
        currency: pilgrimage.currency,
      };
    }

    throw new NotFoundException('No booking found for that code');
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
    const booking = await this.prisma.booking.findFirst({
      where: { id, tenantId },
      include: { user: { select: { fullName: true, email: true } } },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status, cancelledAt: status === 'cancelled' ? new Date() : null },
    });

    // Re-evaluate referral conversion with the new status (idempotent inside the service)
    if (booking.userId) {
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
    }

    // Emit purchase event when status becomes "confirmed" — fires Meta CAPI + GA4
    if (status === 'confirmed' || status === 'completed' || status === 'paid') {
      // Loyalty points: 50% on confirmation, remaining 50% on completion (Q4)
      if (booking.userId) {
        try {
          const productPoints = await this.loyaltyService.getProductPoints(tenantId, booking.bookingType, booking.itemId);
          if (status === 'confirmed' || status === 'paid') {
            await this.loyaltyService.awardBookingConfirmation(tenantId, id, booking.userId, booking.bookingType, productPoints);
          } else if (status === 'completed') {
            await this.loyaltyService.awardBookingCompletion(tenantId, id, booking.userId, booking.bookingType, productPoints);
          }
        } catch (err: any) {
          this.logger.warn(`Loyalty award (${status}) failed: ${err.message}`);
        }
      }

      // Send confirmation email + SMS to the customer.
      try {
        const fullBooking = await this.prisma.booking.findFirst({
          where: { id, tenantId },
          include: { user: { select: { email: true, fullName: true, phone: true } } },
        });
        // Confirmation email — only when the linked account has an address.
        const email = fullBooking?.user?.email;
        if (email && fullBooking.user) {
          await this.emailQueueService.addEmail(email, `Booking Confirmed — ${fullBooking.bookingCode}`, 'booking-confirmation', {
            customerName: fullBooking.user.fullName || 'Customer',
            bookingCode: fullBooking.bookingCode,
            tourName: fullBooking.hotelName || fullBooking.bookingType,
            travelDate: fullBooking.startDate?.toISOString().slice(0, 10) ?? 'N/A',
            amount: fullBooking.totalAmount ? `${fullBooking.currency || 'BDT'} ${fullBooking.totalAmount}` : 'N/A',
          });
        }
      } catch (err: any) {
        this.logger.warn(`Booking confirmation email failed: ${err.message}`);
      }

      // Confirmation SMS — to the phone captured at booking time, falling back
      // to the linked account's phone. Best-effort so a gateway failure never
      // blocks the status update.
      try {
        const fullBooking = await this.prisma.booking.findFirst({
          where: { id, tenantId },
          include: { user: { select: { phone: true } } },
        });
        const phone = fullBooking?.customerPhone || fullBooking?.user?.phone;
        const travelDate = (fullBooking?.startDate ? new Date(fullBooking.startDate).toISOString().slice(0, 10) : '');
        if (phone) {
          await this.notificationsService.sendSms(
            phone,
            `Your ${fullBooking?.hotelName || fullBooking?.bookingType || 'Flyngo'} booking ${fullBooking?.bookingCode || ''} is confirmed.${travelDate ? ` Date: ${travelDate}.` : ''} Thank you for choosing Flyngo.`,
          );
        }
      } catch (err: any) {
        this.logger.warn(`Booking confirmation SMS failed: ${err.message}`);
      }

      void this.trackingService.emitServerEvent(tenantId, 'purchase', {
        userId: booking.userId ?? undefined,
        value: Number(updated.totalAmount || 0),
        currency: updated.currency,
        contentName: `${updated.bookingType}:${updated.itemId}`,
        contentIds: [updated.itemId],
        email: booking.user?.email ?? undefined,
        fullName: booking.customerName || booking.user?.fullName || undefined,
        phone: booking.customerPhone ?? undefined,
        utmSource: updated.utmSource ?? undefined,
        utmMedium: updated.utmMedium ?? undefined,
        utmCampaign: updated.utmCampaign ?? undefined,
        utmContent: updated.utmContent ?? undefined,
        utmTerm: updated.utmTerm ?? undefined,
        gclid: updated.gclid ?? undefined,
        fbclid: updated.fbclid ?? undefined,
      });
    }

    if (status === 'cancelled' && booking.userId) {
      try {
        await this.loyaltyService.reverseBookingPoints(tenantId, id, booking.userId);
      } catch (err: any) {
        this.logger.warn(`Loyalty reversal (updateStatus) failed: ${err.message}`);
      }
    }

    return updated;
  }

  async cancelBooking(id: string, tenantId: string, userId: string) {
    const booking = await this.getBookingById(id, tenantId, userId);
    if (booking.status === 'cancelled') throw new BadRequestException('Booking is already cancelled');
    if (booking.status === 'completed') throw new BadRequestException('Cannot cancel a completed booking');

    // Reverse any loyalty points awarded for this booking.
    try {
      await this.loyaltyService.reverseBookingPoints(tenantId, id, userId);
    } catch (err: any) {
      this.logger.warn(`Loyalty reversal (cancelBooking) failed: ${err.message}`);
    }

    // Find the most relevant completed payment to attempt a refund on. We
    // only refund payments that are actually completed; pending ones were
    // never captured and don't need a refund.
    const refundablePayment = await this.prisma.payment.findFirst({
      where: { bookingId: id, status: 'completed' },
      orderBy: { createdAt: 'desc' },
    });

    // Refund the captured payment (if any) and persist the new payment status.
    let refundResult: { ok: true; refundId: string } | { ok: false; reason: string };
    if (refundablePayment) {
      try {
        const result = await this.paymentsService.refundPayment(
          tenantId,
          refundablePayment.id,
        );
        refundResult = { ok: true, refundId: result.refundId };
        await this.prisma.payment.update({
          where: { id: refundablePayment.id },
          data: { status: 'refunded' },
        });
      } catch (err: any) {
        this.logger.error(
          `Refund failed for booking ${id} payment ${refundablePayment.id}: ${err.message}`,
        );
        refundResult = { ok: false, reason: err.message };
      }
    } else {
      refundResult = { ok: false, reason: 'no_captured_payment' };
    }

    // Single transaction: mark booking cancelled, restore Hajj seats if the
    // booking was a Hajj package, and void any pending referral commission.
    await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id },
        data: { status: 'cancelled', cancelledAt: new Date() },
      });

      // Restore seats on Hajj packages so inventory goes back to the pool.
      if (booking.bookingType === 'package' && booking.itemId) {
        try {
          await tx.hajjPackage.update({
            where: { id: booking.itemId },
            data: { seatsBooked: { decrement: booking.guests ?? 1 } },
          });
        } catch (err: any) {
          this.logger.warn(`Could not restore Hajj seats for booking ${id}: ${err.message}`);
        }
      }

      // Cancel any pending referral commission tied to this booking.
      await tx.affiliateCommission.updateMany({
        where: { tenantId, bookingId: id, status: 'pending' },
        data: { status: 'cancelled' },
      });
      await tx.affiliateReferral.updateMany({
        where: { tenantId, referredUserId: userId, status: 'converted' },
        data: { status: 'cancelled', cancelledAt: new Date() },
      });
      if (Number(booking.referralDiscount || 0) > 0) {
        await tx.affiliateReferral.updateMany({
          where: { tenantId, referredUserId: userId, discountUsedAt: { not: null } },
          data: { discountUsedAt: null },
        });
      }
    });

    // Fire confirmation email asynchronously so it never blocks the API.
    try {
      const email = booking.user?.email;
      if (email) {
        await this.emailQueueService.addEmail(
          email,
          `Booking ${booking.bookingCode} cancelled`,
          'booking-cancelled',
          {
            customerName: booking.user?.fullName || 'Customer',
            bookingCode: booking.bookingCode,
            refundStatus: refundResult.ok ? 'processed' : 'pending',
            refundId: refundResult.ok ? refundResult.refundId : undefined,
          },
        );
      }
    } catch (err: any) {
      this.logger.warn(`Booking cancellation email failed: ${err.message}`);
    }

    return { ...booking, status: 'cancelled', refund: refundResult };
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

  /**
   * Resolve the authoritative unit price for a bookable item. Prices come
   * from the DB so a client can never supply its own amount. If the item
   * can't be found or a price can't be determined, we fall back to 0 and the
   * distinction is recorded in the booking (totalAmount 0 → operator reviews).
   */
  /**
   * Accept both a full ISO timestamp and a plain `YYYY-MM-DD`. A date-only
   * value is anchored to midnight UTC so a booking made in Dhaka doesn't shift
   * to the previous day.
   */
  private parseDate(value: Date | string, field: string): Date {
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
    const raw = String(value ?? '').trim();
    if (!raw) throw new BadRequestException(`${field} is required`);
    const normalized = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T00:00:00.000Z` : raw;
    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`${field} must be a valid date (YYYY-MM-DD or ISO-8601)`);
    }
    return parsed;
  }

  /**
   * `meta` is a free-form JSON column fed straight from a public endpoint, so
   * it needs a ceiling: scalar values only, capped key count and string length.
   * Without this it is an unauthenticated way to write arbitrary nested JSON
   * into the database.
   */
  private sanitizeMeta(meta: unknown): Record<string, string | number | boolean> | undefined {
    if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return undefined;
    const out: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(meta as Record<string, unknown>)) {
      if (Object.keys(out).length >= 40) break;
      if (value === null || value === undefined || value === '') continue;
      if (typeof value === 'string') out[key.slice(0, 60)] = value.slice(0, 2000);
      else if (typeof value === 'number' || typeof value === 'boolean') out[key.slice(0, 60)] = value;
    }
    return Object.keys(out).length ? out : undefined;
  }

  private async resolveItemPrice(tenantId: string, type: string, itemId: string): Promise<number> {
    switch (type) {
      case 'tour': {
        const t = await this.prisma.tour.findFirst({ where: { id: itemId, tenantId } });
        return t ? Number(t.salePrice ?? t.price) : 0;
      }
      case 'flight': {
        const f = await this.prisma.flight.findFirst({ where: { id: itemId, tenantId } });
        return f ? Number(f.price) : 0;
      }
      case 'visa': {
        const v = await this.prisma.visaService.findFirst({ where: { id: itemId, tenantId } });
        return v ? Number(v.price) : 0;
      }
      case 'transport': {
        const tr = await this.prisma.transport.findFirst({ where: { id: itemId, tenantId } });
        return tr ? Number(tr.price) : 0;
      }
      case 'hajj': {
        const h = await this.prisma.hajjPackage.findFirst({ where: { id: itemId, tenantId } });
        return h ? Number(h.price) : 0;
      }
      case 'umrah': {
        const u = await this.prisma.umrahPackage.findFirst({ where: { id: itemId, tenantId } });
        return u ? Number(u.price) : 0;
      }
      default:
        // 'hotel' and 'package' are handled by dedicated flows (hotel) or are
        // operator-assigned (package); for those we don't double-apply, so
        // return the price the caller already knows is authoritative.
        return 0;
    }
  }

  private async resolveItemCurrency(tenantId: string, type: string, itemId: string): Promise<string> {
    switch (type) {
      case 'tour': {
        const t = await this.prisma.tour.findFirst({ where: { id: itemId, tenantId }, select: { currency: true } });
        return t?.currency || 'USD';
      }
      case 'flight': {
        const f = await this.prisma.flight.findFirst({ where: { id: itemId, tenantId }, select: { currency: true } });
        return f?.currency || 'USD';
      }
      case 'visa': {
        const v = await this.prisma.visaService.findFirst({ where: { id: itemId, tenantId }, select: { currency: true } });
        return v?.currency || 'USD';
      }
      case 'transport': {
        const tr = await this.prisma.transport.findFirst({ where: { id: itemId, tenantId }, select: { currency: true } });
        return tr?.currency || 'BDT';
      }
      case 'hajj': {
        const h = await this.prisma.hajjPackage.findFirst({ where: { id: itemId, tenantId }, select: { currency: true } });
        return h?.currency || 'BDT';
      }
      case 'umrah': {
        const u = await this.prisma.umrahPackage.findFirst({ where: { id: itemId, tenantId }, select: { currency: true } });
        return u?.currency || 'BDT';
      }
      default:
        return 'USD';
    }
  }

  /**
   * Self-heal: any booking that has a phone but no linked account gets its
   * customer account created (or linked) via the same capture-first path as a
   * new booking — so an old booking (or one made on a flow that didn't
   * auto-provision, e.g. hotels before the upgrade) still ends up with a
   * customer ID the phone can log in with. Covers generic + Hajj/Umrah rows.
   */
  async repairMissingCustomerAccounts(tenantId: string) {
    const generic = await this.prisma.booking.findMany({
      where: { tenantId, userId: null, customerPhone: { not: null }, deletedAt: null },
      select: { id: true, customerName: true, customerPhone: true },
    });
    const pilgrimage = await this.prisma.hajjUmrahBooking.findMany({
      where: { tenantId, userId: null, customerPhone: { not: null } },
      select: { id: true, customerName: true, customerPhone: true, customerEmail: true },
    });

    let created = 0;
    let linked = 0;
    for (const b of generic) {
      try {
        const acc = await this.authService.resolveBookingAccount(tenantId, null, {
          fullName: b.customerName,
          phone: b.customerPhone,
          email: null,
        });
        if (acc.userId) {
          await this.prisma.booking.update({ where: { id: b.id }, data: { userId: acc.userId } });
          if (acc.created) created++;
          else linked++;
        }
      } catch (err: any) {
        this.logger.warn(`Repair customer for booking ${b.id} failed: ${err.message}`);
      }
    }
    for (const b of pilgrimage) {
      try {
        const acc = await this.authService.resolveBookingAccount(tenantId, null, {
          fullName: b.customerName,
          phone: b.customerPhone,
          email: b.customerEmail,
        });
        if (acc.userId) {
          await this.prisma.hajjUmrahBooking.update({ where: { id: b.id }, data: { userId: acc.userId } });
          if (acc.created) created++;
          else linked++;
        }
      } catch (err: any) {
        this.logger.warn(`Repair customer for Hajj/Umrah booking ${b.id} failed: ${err.message}`);
      }
    }
    return { scanned: generic.length + pilgrimage.length, created, linked };
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

    // Same capture-first identity as the main booking flow: a guest hotel
    // booking creates (or reuses) a provisional account keyed on the lead
    // guest's phone so the booking has a customer record staff can act on.
    const account = await this.authService.resolveBookingAccount(tenantId, userId, {
      fullName: `${leadGuest.firstName} ${leadGuest.lastName}`.trim(),
      phone: leadGuest.phone ?? null,
      email: leadGuest.email ?? null,
    });
    const bookingUserId = account.userId;

    const booking = await this.prisma.booking.create({
      data: {
        tenantId,
        userId: bookingUserId,
        bookingType: 'hotel',
        itemId: dto.hotelId,
        bookingCode: this.generateBookingCode(),
        customerName: `${leadGuest.firstName} ${leadGuest.lastName}`.trim() || null,
        customerPhone: leadGuest.phone || null,
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
      email: leadGuest.email ?? undefined,
      phone: leadGuest.phone ?? undefined,
      fullName: `${leadGuest.firstName} ${leadGuest.lastName}`.trim() || undefined,
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
