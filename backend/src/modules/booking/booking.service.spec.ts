import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from './booking.service';
import { PrismaService } from '../../database/prisma.service';
import { ReferralService } from '../referral/referral.service';
import { TrackingService } from '../tracking/tracking.service';
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
    room: {
      findFirst: jest.fn(),
    },
    affiliateCommission: {
      updateMany: jest.fn(),
    },
    affiliateReferral: {
      updateMany: jest.fn(),
    },
  };

  const mockReferral = {
    resolveDiscountForUser: jest.fn().mockResolvedValue({ discount: 0, code: null }),
    recordBookingConversion: jest.fn().mockResolvedValue(null),
  };

  const mockTracking = {
    emitServerEvent: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ReferralService, useValue: mockReferral },
        { provide: TrackingService, useValue: mockTracking },
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
