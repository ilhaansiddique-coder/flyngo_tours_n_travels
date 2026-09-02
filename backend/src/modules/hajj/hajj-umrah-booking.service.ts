import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TrackingService } from '../tracking/tracking.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ReferralService } from '../referral/referral.service';
import { LoyaltyService } from '../loyalty/loyalty.service';

export interface PilgrimInput {
  fullName: string;
  passportNumber: string;
  passportExpiry: string; // ISO date
  dateOfBirth: string; // ISO date
  gender: 'male' | 'female';
  mahramRelation?: string;
  relationshipToLead?: string;
}

export interface CreateHajjUmrahBookingInput {
  kind: 'hajj' | 'umrah';
  packageId: string;
  departureDate: string;
  returnDate?: string;
  durationDays?: number;
  occupancyType: 'quad' | 'triple' | 'double';
  paymentPlan: 'full' | 'installments';
  advancePaid?: number;
  balanceDueDate?: string;
  pilgrims: PilgrimInput[];
  // Lead contact — the only contact details a guest booking has. For signed-in
  // users we fall back to their profile. Email stays optional site-wide.
  leadGuest?: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email?: string;
    phone?: string;
  };
}

@Injectable()
export class HajjUmrahBookingService {
  private readonly logger = new Logger(HajjUmrahBookingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly trackingService: TrackingService,
    private readonly notificationsService: NotificationsService,
    private readonly referralService: ReferralService,
    private readonly loyaltyService: LoyaltyService,
  ) {}

  /**
   * Create a Hajj/Umrah booking with strict compliance validation:
   *  - every pilgrim's passport must be valid ≥ `passportValidityMonths`
   *    beyond the return date
   *  - every female pilgrim must have a mahram relation when the package
   *    requires it
   *  - seat inventory must be available (seatsBooked < totalSeats)
   *  - the whole thing runs in a transaction so seats are only booked in
   *    genuine bookable events
   */
  async create(
    tenantId: string,
    userId: string | null,
    input: CreateHajjUmrahBookingInput,
  ) {
    const packageModel = input.kind === 'hajj' ? 'hajjPackage' : 'umrahPackage';
    const pkg = await (this.prisma as any)[packageModel].findFirst({
      where: { id: input.packageId, tenantId, deletedAt: null, isActive: true },
    });
    if (!pkg) throw new NotFoundException('Package not found');

    const departure = new Date(input.departureDate);
    const returnDate = input.returnDate ? new Date(input.returnDate) : null;
    const validityMonths = pkg.passportValidityMonths ?? 6;
    if (input.kind === 'hajj' && !returnDate) {
      throw new BadRequestException('Hajj bookings must include a return date');
    }

    // Compliance: passport expiry validation for every pilgrim.
    for (const p of input.pilgrims) {
      const expiry = new Date(p.passportExpiry);
      const anchor = returnDate ?? departure;
      const minValid = new Date(anchor);
      minValid.setMonth(minValid.getMonth() + validityMonths);
      if (expiry < minValid) {
        throw new BadRequestException(
          `Passport for ${p.fullName} expires before the required ${validityMonths} months after the trip — passport must be valid until ${minValid.toISOString().slice(0, 10)}.`,
        );
      }
    }

    // Compliance: mahram required for female pilgrims.
    if (pkg.requireMahramForFemales !== false) {
      for (const p of input.pilgrims) {
        if (p.gender === 'female' && !p.mahramRelation) {
          throw new BadRequestException(
            `${p.fullName} is female — a mahram relationship (spouse/father/son/brother) is required per Hajj/Umrah rules.`,
          );
        }
      }
    }

    // Seat inventory check — only enforced when the package sets a real limit.
    // totalSeats = 0 means "unlimited / not seat-capped" (the default), so a
    // package without an explicit seat count stays bookable instead of silently
    // rejecting every booking.
    const seatCapped = (pkg.totalSeats ?? 0) > 0;
    if (seatCapped) {
      const available = pkg.totalSeats - pkg.seatsBooked;
      if (input.pilgrims.length > available) {
        throw new BadRequestException(
          `Only ${available} seat(s) remaining on this departure — requested ${input.pilgrims.length}.`,
        );
      }
    }

    // Pricing by occupancy.
    const perPerson =
      input.occupancyType === 'double'
        ? Number(pkg.doublePrice)
        : input.occupancyType === 'triple'
          ? Number(pkg.triplePrice)
          : Number(pkg.quadPrice) || Number(pkg.price);
    const subtotal = perPerson * input.pilgrims.length;

    // One-time referee discount (5% on the first booking via a referral link),
    // atomically claimed so two simultaneous checkouts can't both use it.
    // Referral is account-bound, so guests simply don't get one.
    const referralInfo = userId
      ? await this.referralService.resolveDiscountForUser(tenantId, userId, subtotal)
      : { discount: 0, code: null as string | null };
    const referralDiscount = referralInfo.discount;
    const referredByCode = referralInfo.code;
    const total = subtotal - referralDiscount;

    const advance = Number(input.advancePaid || 0);
    const balance = total - advance;
    if (advance < 0 || advance > total) {
      throw new BadRequestException('advancePaid must be between 0 and totalAmount');
    }

    // Lead contact: prefer what the form supplied, fall back to the signed-in
    // user's profile. Stored on the booking so guest bookings still show a
    // name + phone in the admin table instead of a blank cell.
    const contact = await this.resolveLeadContact(userId, input.leadGuest, input.pilgrims);

    const booking = await this.prisma.$transaction(async (tx) => {
      const created = await tx.hajjUmrahBooking.create({
        data: {
          tenantId,
          userId,
          bookingCode: this.generateBookingCode(),
          customerName: contact.name,
          customerPhone: contact.phone,
          customerEmail: contact.email,
          kind: input.kind,
          packageId: pkg.id,
          packageTitle: pkg.title,
          packageSlug: pkg.slug,
          departureDate: departure,
          returnDate,
          durationDays: input.durationDays ?? pkg.durationDays ?? 0,
          occupancyType: input.occupancyType,
          numPilgrims: input.pilgrims.length,
          currency: pkg.currency || 'BDT',
          perPersonAmount: perPerson,
          totalAmount: total,
          referralDiscount,
          discountAmount: referralDiscount || 0,
          referredByCode,
          advancePaid: advance,
          balanceDue: balance,
          balanceDueDate: input.balanceDueDate ? new Date(input.balanceDueDate) : pkg.balanceDueDate ?? null,
          paymentPlan: input.paymentPlan,
          status: 'pending',
          paymentStatus: advance > 0 ? (advance >= total ? 'paid' : 'partial') : 'unpaid',
          pilgrims: {
            create: input.pilgrims.map((p) => ({
              fullName: p.fullName,
              passportNumber: p.passportNumber,
              passportExpiry: new Date(p.passportExpiry),
              dateOfBirth: new Date(p.dateOfBirth),
              gender: p.gender,
              mahramRelation: p.gender === 'female' ? p.mahramRelation ?? null : null,
              relationshipToLead: p.relationshipToLead ?? null,
            })),
          },
        },
        include: { pilgrims: true },
      });

      // Decrement seat inventory.
      await (tx as any)[packageModel].update({
        where: { id: pkg.id },
        data: { seatsBooked: { increment: input.pilgrims.length } },
      });

      return created;
    });

    // Fire-and-forget tracking + email.
    void this.trackingService.emitServerEvent(tenantId, `${input.kind}_booking_confirmed`, {
      userId: userId ?? undefined,
      value: total,
      currency: booking.currency,
      contentIds: [pkg.id],
      contentName: `${input.kind}:${pkg.slug}`,
      email: contact.email ?? undefined,
      phone: contact.phone ?? undefined,
      fullName: contact.name ?? undefined,
    });
    // Email is optional site-wide — only send when we actually have an address.
    if (contact.email) {
      void this.notificationsService.sendEmail(
        contact.email,
        `Your ${input.kind} booking is confirmed (${pkg.title})`,
        'booking-confirmation',
        {
          bookingCode: booking.bookingCode ?? booking.id.slice(0, 8).toUpperCase(),
          totalAmount: `${total} ${booking.currency}`,
          currency: booking.currency,
        },
      ).catch((err: any) => this.logger.warn(`Booking email failed: ${err.message}`));
    }

    return {
      success: true,
      data: booking,
    };
  }

  async listForUser(tenantId: string, userId: string, kind?: string, page = 1, limit = 20) {
    const where: any = { tenantId, userId };
    if (kind) where.kind = kind;
    const [items, total] = await Promise.all([
      this.prisma.hajjUmrahBooking.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { pilgrims: true },
      }),
      this.prisma.hajjUmrahBooking.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async listAdmin(tenantId: string, kind?: string, status?: string, page = 1, limit = 20) {
    const where: any = { tenantId };
    if (kind) where.kind = kind;
    if (status) where.status = status;
    const [items, total] = await Promise.all([
      this.prisma.hajjUmrahBooking.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { pilgrims: true, user: { select: { id: true, fullName: true, email: true, phone: true } } },
      }),
      this.prisma.hajjUmrahBooking.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async changeStatus(id: string, tenantId: string, status: string, paymentStatus?: string) {
    const booking = await this.prisma.hajjUmrahBooking.findFirst({
      where: { id, tenantId },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const updated = await this.prisma.hajjUmrahBooking.update({
      where: { id },
      data: {
        status,
        ...(paymentStatus ? { paymentStatus } : {}),
      },
    });

    // Award loyalty points on status transitions, mirroring the generic booking
    // flow: 50% on confirm, the remainder on completion. Idempotent via the
    // ledger's idempotencyKey + the points-awarded columns, so re-confirming or
    // re-completing never double-credits. Fire-and-forget so status update never
    // fails on a loyalty hiccup.
    // Guest bookings have no account to credit, so there is nothing to award.
    try {
      if (booking.userId) {
        const points = await this.loyaltyService.getProductPoints(tenantId, booking.kind, booking.packageId);
        if (status === 'confirmed' && booking.pointsAwardedConfirmation === 0) {
          await this.loyaltyService.awardHajjUmrahConfirmation(tenantId, id, booking.userId, booking.kind, points);
        } else if (status === 'completed') {
          await this.loyaltyService.awardHajjUmrahCompletion(tenantId, id, booking.userId, booking.kind, points);
        }
      }
    } catch (err: any) {
      this.logger.warn(`Loyalty award failed for ${booking.kind} booking ${id}: ${err.message}`);
    }

    return updated;
  }

  /**
   * Work out who to put on the booking. Order of preference:
   *   1. what the booking form sent (guests only ever have this)
   *   2. the signed-in user's profile
   *   3. the lead pilgrim's name — better than an empty admin cell
   * Email is never required; a null email just means no confirmation mail.
   */
  private async resolveLeadContact(
    userId: string | null,
    lead: CreateHajjUmrahBookingInput['leadGuest'],
    pilgrims: PilgrimInput[],
  ): Promise<{ name: string | null; phone: string | null; email: string | null }> {
    let name =
      (lead?.fullName || [lead?.firstName, lead?.lastName].filter(Boolean).join(' ')).trim() || null;
    let phone = (lead?.phone || '').trim() || null;
    let email = (lead?.email || '').trim() || null;

    if (userId && (!name || !phone || !email)) {
      const u = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { fullName: true, phone: true, email: true },
      });
      if (u) {
        name = name || u.fullName || null;
        phone = phone || u.phone || null;
        email = email || u.email || null;
      }
    }

    // Last resort so the admin table never shows a nameless booking.
    if (!name) name = pilgrims[0]?.fullName?.trim() || null;

    return { name, phone, email };
  }

  /** Same FLY-XXXX-XXXX shape as the generic booking flow, so /track works. */
  private generateBookingCode(): string {
    return `FLY-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }
}
