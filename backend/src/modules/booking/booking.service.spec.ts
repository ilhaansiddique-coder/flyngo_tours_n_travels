import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from './booking.service';
import { PrismaService } from '../../database/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

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
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        { provide: PrismaService, useValue: mockPrisma },
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
});
