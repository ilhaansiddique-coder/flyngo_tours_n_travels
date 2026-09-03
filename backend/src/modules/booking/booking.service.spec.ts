import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from './booking.service';
import { PrismaService } from '../../database/prisma.service';
import { ReferralService } from '../referral/referral.service';
import { TrackingService } from '../tracking/tracking.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { PaymentsService } from '../payments/payments.service';
import { EmailQueueService } from '../notifications/email-queue.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MarketingService } from '../marketing/marketing.service';
import { AuthService } from '../auth/auth.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('BookingService', () => {
  let service: BookingService;
  let prisma: PrismaService;

  const mockPrisma = {
    booking: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      aggregate: jest.fn(),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue({ fullName: 'Test User', phone: '+8800000000000' }),
    },
    room: {
      findFirst: jest.fn(),
    },
    tour: {
      findFirst: jest.fn().mockResolvedValue({ id: 'tour-1', price: 1000, salePrice: null, currency: 'USD' }),
    },
    flight: {
      findFirst: jest.fn().mockResolvedValue({ id: 'flight-1', price: 500, currency: 'USD' }),
    },
    visaService: {
      findFirst: jest.fn().mockResolvedValue({ id: 'visa-1', price: 300, currency: 'USD' }),
    },
    affiliateCommission: {
      updateMany: jest.fn(),
    },
    affiliateReferral: {
      updateMany: jest.fn(),
    },
    payment: {
      findFirst: jest.fn().mockResolvedValue(null),
      update: jest.fn(),
    },
    hajjPackage: {
      update: jest.fn(),
    },
    $transaction: jest.fn((fn: any) => fn({ booking: mockPrisma.booking, affiliateCommission: mockPrisma.affiliateCommission, affiliateReferral: mockPrisma.affiliateReferral, hajjPackage: mockPrisma.hajjPackage })),
  };

  const mockReferral = {
    resolveDiscountForUser: jest.fn().mockResolvedValue({ discount: 0, code: null }),
    recordBookingConversion: jest.fn().mockResolvedValue(null),
  };

  const mockTracking = {
    emitServerEvent: jest.fn().mockResolvedValue(undefined),
  };

  const mockLoyalty = {
    getProductPoints: jest.fn().mockResolvedValue(0),
    awardBookingConfirmation: jest.fn().mockResolvedValue(undefined),
    awardBookingCompletion: jest.fn().mockResolvedValue(undefined),
  };

  const mockPayments = {
    refundPayment: jest.fn().mockResolvedValue({ ok: true, refundId: 're_123' }),
  };

  const mockEmailQueue = {
    addEmail: jest.fn().mockResolvedValue(true),
  };

  const mockNotifications = {
    sendSms: jest.fn().mockResolvedValue({ sent: true, provider: 'log' }),
  };

  const mockMarketing = {
    computeCouponDiscount: jest.fn().mockResolvedValue({ discount: 0, couponId: null, code: null }),
    incrementCouponUsage: jest.fn().mockResolvedValue({}),
  };

  // Capture-first provisioning. Default: echo back whoever is signed in, which
  // is what these existing tests assume.
  const mockAuth = {
    resolveBookingAccount: jest
      .fn()
      .mockImplementation(async (_tenantId: string, signedInUserId: string | null) => ({
        userId: signedInUserId,
        created: false,
        provisional: false,
      })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ReferralService, useValue: mockReferral },
        { provide: TrackingService, useValue: mockTracking },
        { provide: LoyaltyService, useValue: mockLoyalty },
        { provide: PaymentsService, useValue: mockPayments },
        { provide: EmailQueueService, useValue: mockEmailQueue },
        { provide: NotificationsService, useValue: mockNotifications },
        { provide: MarketingService, useValue: mockMarketing },
        { provide: AuthService, useValue: mockAuth },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    it('should create a booking with a generated code', async () => {
      mockPrisma.booking.create.mockResolvedValue({
        id: 'booking-1',
        bookingCode: 'FLY-ABC123',
        tenantId: 'tenant-1',
        userId: 'user-1',
        bookingType: 'tour',
        status: 'pending',
      });

      const result = await service.createBooking('tenant-1', 'user-1', {
        type: 'tour',
        itemId: 'tour-1',
        startDate: new Date('2026-08-01'),
        guests: 2,
      });

      expect(result.status).toBe('pending');
      expect(result.bookingCode).toContain('FLY-');
      expect(mockPrisma.booking.create).toHaveBeenCalled();
    });

    it('applies the referee 5% first-booking discount to tours', async () => {
      // 1 tour @ 1000 USD, guests 2 → subtotal 2000; referral resolves to 5% → 100
      mockReferral.resolveDiscountForUser.mockResolvedValue({ discount: 100, code: 'FRIEND1' });
      mockPrisma.booking.create.mockImplementation(({ data }: any) => ({ ...data, id: 'booking-1' }));

      const result: any = await service.createBooking('tenant-1', 'user-1', {
        type: 'tour',
        itemId: 'tour-1',
        startDate: new Date('2026-08-01'),
        guests: 2,
      });

      expect(result.referralDiscount).toBe(100);
      expect(result.referredByCode).toBe('FRIEND1');
      expect(result.totalAmount).toBe(1900);
      expect(result.discountAmount).toBe(100);
    });

    // Hotels can now go through the generic endpoint for payment-free general
    // bookings. resolveItemPrice still has no 'hotel' case, so a booking made
    // here is priced at 0 and left for the operator to quote.
    it('allows hotels through the generic endpoint priced at zero for a quote', async () => {
      mockReferral.resolveDiscountForUser.mockResolvedValue({ discount: 0, code: null });
      mockPrisma.booking.create.mockImplementation(({ data }: any) => ({ ...data, id: 'booking-1' }));

      const result: any = await service.createBooking('tenant-1', 'user-1', {
        type: 'hotel',
        itemId: 'hotel-1',
        startDate: new Date('2026-08-01'),
        guests: 2,
      });

      expect(result.bookingType).toBe('hotel');
      expect(result.totalAmount).toBe(0);
      expect(mockPrisma.booking.create).toHaveBeenCalled();
    });

    // Public endpoint with an inline body and no DTO — a date-only value used to
    // reach Prisma and surface as a bare 500.
    it('accepts a date-only startDate and anchors it to midnight UTC', async () => {
      mockPrisma.booking.create.mockImplementation(({ data }: any) => ({ ...data, id: 'booking-1' }));

      const result: any = await service.createBooking('tenant-1', 'user-1', {
        type: 'tour',
        itemId: 'tour-1',
        startDate: '2026-11-10' as any,
        guests: 1,
      });

      expect(result.startDate.toISOString()).toBe('2026-11-10T00:00:00.000Z');
    });

    it('rejects an unparseable date with 400 rather than a 500 from the driver', async () => {
      await expect(
        service.createBooking('tenant-1', 'user-1', {
          type: 'tour',
          itemId: 'tour-1',
          startDate: 'not-a-date' as any,
          guests: 1,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('persists flow answers but drops non-scalar and oversized values', async () => {
      mockPrisma.booking.create.mockImplementation(({ data }: any) => ({ ...data, id: 'booking-1' }));

      const result: any = await service.createBooking('tenant-1', 'user-1', {
        type: 'tour',
        itemId: 'tour-1',
        startDate: new Date('2026-08-01'),
        guests: 1,
        meta: {
          purpose: 'Tourism',
          doc_passport: 'yes',
          empty: '',
          nested: { a: 'b' },
          list: [1, 2, 3],
          huge: 'x'.repeat(5000),
        },
      });

      expect(result.meta.purpose).toBe('Tourism');
      expect(result.meta.doc_passport).toBe('yes');
      expect(result.meta.nested).toBeUndefined();
      expect(result.meta.list).toBeUndefined();
      expect(result.meta.empty).toBeUndefined();
      expect(result.meta.huge).toHaveLength(2000);
    });
  });

  describe('getUserBookings', () => {
    it('should return paginated user bookings', async () => {
      mockPrisma.booking.findMany.mockResolvedValue([{ id: 'booking-1' }]);
      mockPrisma.booking.count.mockResolvedValue(1);

      const result = await service.getUserBookings('tenant-1', 'user-1');

      expect(result.items).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe('getBookingById', () => {
    it('should return booking when found', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue({
        id: 'booking-1',
        tenantId: 'tenant-1',
        userId: 'user-1',
        payments: [],
      });

      const result = await service.getBookingById('booking-1', 'tenant-1', 'user-1');
      expect(result.id).toBe('booking-1');
    });

    it('should throw NotFoundException when booking not found', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue(null);

      await expect(
        service.getBookingById('fake-id', 'tenant-1', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelBooking', () => {
    it('should cancel a pending booking', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue({
        id: 'booking-1',
        status: 'pending',
      });
      mockPrisma.booking.update.mockResolvedValue({
        id: 'booking-1',
        status: 'cancelled',
        cancelledAt: new Date(),
      });

      const result = await service.cancelBooking('booking-1', 'tenant-1', 'user-1');
      expect(result.status).toBe('cancelled');
    });

    it('should throw when cancelling completed booking', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue({
        id: 'booking-1',
        status: 'completed',
      });

      await expect(
        service.cancelBooking('booking-1', 'tenant-1', 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createHotelBooking', () => {
    const baseDto = {
      hotelId: 'hotel-1',
      roomId: 'room-1',
      checkInDate: '2026-09-01',
      checkOutDate: '2026-09-04',
      roomsCount: 2,
      adults: 2,
      children: 0,
      leadGuest: {
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        phone: '+8801700000000',
      },
    } as any;

    const mockRoom = (overrides: Record<string, unknown> = {}) => ({
      id: 'room-1',
      name: 'Deluxe Twin',
      capacity: 2,
      available: 5,
      currency: 'USD',
      pricePerNight: new Prisma.Decimal('120.50'),
      hotel: { id: 'hotel-1', name: 'Grand Hotel', tenantId: 'tenant-1' },
      ...overrides,
    });

    beforeEach(() => {
      mockPrisma.room.findFirst.mockResolvedValue(mockRoom());
      mockPrisma.booking.aggregate.mockResolvedValue({ _sum: { roomsCount: null } });
      mockPrisma.booking.create.mockImplementation(({ data }: any) => ({ ...data, id: 'booking-1' }));
    });

    it('prices the stay server-side as nights x rooms x rate', async () => {
      const result: any = await service.createHotelBooking('tenant-1', 'user-1', baseDto);

      // 3 nights x 2 rooms x 120.50
      expect(result.totalAmount.toString()).toBe('723');
      expect(result.nights).toBe(3);
      expect(result.currency).toBe('USD');
      expect(result.hotelName).toBe('Grand Hotel');
      expect(result.roomName).toBe('Deluxe Twin');
    });

    it('records the lead guest as a traveler', async () => {
      const result: any = await service.createHotelBooking('tenant-1', 'user-1', {
        ...baseDto,
        additionalGuests: [{ fullName: 'Grace Hopper', type: 'adult' }],
      });

      expect(result.travelers.create).toHaveLength(2);
      expect(result.travelers.create[0]).toMatchObject({
        isLead: true,
        fullName: 'Ada Lovelace',
        email: 'ada@example.com',
      });
      expect(result.travelers.create[1]).toMatchObject({ isLead: false, fullName: 'Grace Hopper' });
    });

    it('rejects a checkout that is not after checkin', async () => {
      await expect(
        service.createHotelBooking('tenant-1', 'user-1', {
          ...baseDto,
          checkOutDate: '2026-09-01',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects a room belonging to another tenant', async () => {
      mockPrisma.room.findFirst.mockResolvedValue(
        mockRoom({ hotel: { id: 'hotel-1', name: 'Grand Hotel', tenantId: 'other-tenant' } }),
      );

      await expect(
        service.createHotelBooking('tenant-1', 'user-1', baseDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects when childAges does not match the children count', async () => {
      await expect(
        service.createHotelBooking('tenant-1', 'user-1', {
          ...baseDto,
          children: 2,
          childAges: [7],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects when occupancy exceeds room capacity', async () => {
      await expect(
        service.createHotelBooking('tenant-1', 'user-1', {
          ...baseDto,
          adults: 4,
          children: 2,
          childAges: [5, 9],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects when overlapping bookings exhaust inventory', async () => {
      mockPrisma.booking.aggregate.mockResolvedValue({ _sum: { roomsCount: 4 } });

      await expect(
        service.createHotelBooking('tenant-1', 'user-1', baseDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('ignores cancelled bookings when counting inventory', async () => {
      await service.createHotelBooking('tenant-1', 'user-1', baseDto);

      const where = mockPrisma.booking.aggregate.mock.calls[0][0].where;
      expect(where.status).toEqual({ notIn: ['cancelled'] });
      expect(where.roomId).toBe('room-1');
    });
  });
});
