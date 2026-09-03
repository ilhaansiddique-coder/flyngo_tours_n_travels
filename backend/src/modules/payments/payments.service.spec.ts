import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '../../config/config.service';
import { EmailQueueService } from '../notifications/email-queue.service';
import { NotificationsService } from '../notifications/notifications.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { MediaService } from '../media/media.service';
import { BankAccountsService } from './bank-accounts.service';
import { MobileWalletsService } from './mobile-wallets.service';
import { InvoicesService } from './invoices.service';
import { BadRequestException } from '@nestjs/common';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: PrismaService;

  const mockPrisma = {
    payment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
    },
    booking: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    hajjUmrahBooking: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    bankAccount: {
      findFirst: jest.fn(),
    },
    mobileWallet: {
      findFirst: jest.fn(),
    },
    tenantSettings: {
      findUnique: jest.fn(),
    },
  };

  const mockConfig = {
    get: jest.fn(),
    getOrNull: jest.fn().mockReturnValue(null),
    getNumber: jest.fn().mockReturnValue(0),
    getBoolean: jest.fn().mockReturnValue(false),
  };

  const mockEmailQueue = {
    addEmail: jest.fn().mockResolvedValue(true),
  };

  const mockNotifications = {
    sendSms: jest.fn().mockResolvedValue({ sent: true, provider: 'log' }),
  };

  const mockLoyalty = {
    reverseBookingPoints: jest.fn().mockResolvedValue(undefined),
    awardBookingPoints: jest.fn().mockResolvedValue(undefined),
    getProductPoints: jest.fn().mockResolvedValue(100),
    awardBookingConfirmation: jest.fn().mockResolvedValue(undefined),
    awardHajjUmrahConfirmation: jest.fn().mockResolvedValue(undefined),
  };

  const mockMedia = { upload: jest.fn() };
  const mockBanks = { listPublic: jest.fn().mockResolvedValue([]) };
  const mockWallets = { listPublic: jest.fn().mockResolvedValue([]) };
  const mockInvoices = { generateForPayment: jest.fn().mockResolvedValue({ id: 'inv-1', invoiceNumber: 'INV-1' }) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
        { provide: EmailQueueService, useValue: mockEmailQueue },
        { provide: NotificationsService, useValue: mockNotifications },
        { provide: LoyaltyService, useValue: mockLoyalty },
        { provide: MediaService, useValue: mockMedia },
        { provide: BankAccountsService, useValue: mockBanks },
        { provide: MobileWalletsService, useValue: mockWallets },
        { provide: InvoicesService, useValue: mockInvoices },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPaymentIntent', () => {
    it('should create a payment with pending status', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue({
        id: 'booking-1', tenantId: 'tenant-1', userId: 'user-1',
        totalAmount: 100, referralDiscount: 0, pointsRedemptionBdt: 0, currency: 'BDT',
      });
      mockPrisma.payment.create.mockResolvedValue({
        id: 'payment-1',
        tenantId: 'tenant-1',
        userId: 'user-1',
        bookingId: 'booking-1',
        amount: 100,
        currency: 'BDT',
        method: 'bkash',
        status: 'pending',
        transactionId: 'PAY-123',
      });

      const result = await service.createPaymentIntent('tenant-1', 'user-1', 'booking-1', 'bkash', 100);

      expect(result.status).toBe('pending');
      expect(result.transactionId).toContain('PAY-');
      expect(mockPrisma.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'pending', currency: 'BDT', method: 'bkash', amount: 100 }),
        }),
      );
    });

    it('should throw BadRequestException when booking not found', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue(null);

      await expect(
        service.createPaymentIntent('tenant-1', 'user-1', 'booking-1', 'bkash', 100),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPaymentStatus', () => {
    it('should return the payment', async () => {
      mockPrisma.payment.findFirst.mockResolvedValue({
        id: 'payment-1',
        tenantId: 'tenant-1',
        userId: 'user-1',
        status: 'pending',
      });

      const result = await service.getPaymentStatus('payment-1', 'tenant-1', 'user-1');

      expect(result?.status).toBe('pending');
      expect(mockPrisma.payment.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'payment-1', tenantId: 'tenant-1', userId: 'user-1' } }),
      );
    });
  });

  describe('listAllPayments', () => {
    it('should return paginated results with filters', async () => {
      mockPrisma.payment.findMany.mockResolvedValue([{ id: 'payment-1' }]);
      mockPrisma.payment.count.mockResolvedValue(1);

      const result = await service.listAllPayments('tenant-1', 1, 10, { status: 'completed', method: 'bkash' });

      expect(result.items).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
      expect(mockPrisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 'tenant-1', status: 'completed', method: 'bkash' } }),
      );
    });

    it('should apply no filters when none provided', async () => {
      mockPrisma.payment.findMany.mockResolvedValue([]);
      mockPrisma.payment.count.mockResolvedValue(0);

      const result = await service.listAllPayments('tenant-1');

      expect(result.items).toHaveLength(0);
      expect(mockPrisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
      );
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update status and send email when completed', async () => {
      mockPrisma.payment.findFirst.mockResolvedValue({
        id: 'payment-1',
        tenantId: 'tenant-1',
        currency: 'BDT',
        amount: 100,
        status: 'pending',
        userId: 'user-1',
        booking: {
          id: 'booking-1', userId: 'user-1', bookingCode: 'FLY-ABC123',
          totalAmount: 100, paidAmount: 0, currency: 'BDT', status: 'pending',
          bookingType: 'tour', itemId: 'tour-1', referralDiscount: 0, pointsRedemptionBdt: 0,
        },
        hajjUmrahBooking: null,
        user: { email: 'user@example.com', fullName: 'John Doe' },
      });
      mockPrisma.payment.update.mockResolvedValue({
        id: 'payment-1',
        status: 'completed',
      });
      mockPrisma.booking.update.mockResolvedValue({});

      const result = await service.updatePaymentStatus('payment-1', 'tenant-1', 'completed', 'admin-1');

      expect(result.status).toBe('completed');
      expect(mockPrisma.payment.update).toHaveBeenCalledWith({
        where: { id: 'payment-1' },
        data: expect.objectContaining({ status: 'completed' }),
      });
      expect(mockPrisma.booking.update).toHaveBeenCalled();
      expect(mockLoyalty.awardBookingConfirmation).toHaveBeenCalled();
      expect(mockInvoices.generateForPayment).toHaveBeenCalledWith('payment-1', 'tenant-1');
      expect(mockEmailQueue.addEmail).toHaveBeenCalledWith(
        'user@example.com',
        expect.stringContaining('FLY-ABC123'),
        'payment-receipt',
        expect.objectContaining({ customerName: 'John Doe' }),
      );
    });

    it('should throw BadRequestException when payment not found', async () => {
      mockPrisma.payment.findFirst.mockResolvedValue(null);

      await expect(
        service.updatePaymentStatus('fake-id', 'tenant-1', 'completed'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPaymentStats', () => {
    it('should return aggregated stats', async () => {
      mockPrisma.payment.count.mockResolvedValue(5);
      mockPrisma.payment.groupBy
        .mockResolvedValueOnce([{ status: 'completed', _count: { id: 3 } }, { status: 'pending', _count: { id: 2 } }])
        .mockResolvedValueOnce([{ method: 'bkash', _count: { id: 4 } }, { method: 'card', _count: { id: 1 } }]);
      mockPrisma.payment.aggregate.mockResolvedValue({ _sum: { amount: 1000 } });

      const result = await service.getPaymentStats('tenant-1');

      expect(result.total).toBe(5);
      expect(result.totalCompleted).toBe(1000);
      expect(result.byStatus).toEqual({ completed: 3, pending: 2 });
      expect(result.byMethod).toEqual({ bkash: 4, card: 1 });
    });

    it('should default totalCompleted to 0 when no completed payments', async () => {
      mockPrisma.payment.count.mockResolvedValue(0);
      mockPrisma.payment.groupBy.mockResolvedValue([]);
      mockPrisma.payment.aggregate.mockResolvedValue({ _sum: { amount: null } });

      const result = await service.getPaymentStats('tenant-1');

      expect(result.totalCompleted).toBe(0);
      expect(result.byStatus).toEqual({});
      expect(result.byMethod).toEqual({});
    });
  });

  describe('recordAdminPayment', () => {
    it('rejects when the booking is already paid', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue({
        id: 'booking-1', userId: 'user-1', bookingCode: 'FLY-ABC123', bookingType: 'tour',
        status: 'pending', totalAmount: 5000, paidAmount: 5000, referralDiscount: 0,
        pointsRedemptionBdt: 0, currency: 'BDT', customerName: 'Ada',
      });

      await expect(
        service.recordAdminPayment('tenant-1', 'admin-1', {
          bookingCode: 'FLY-ABC123',
          method: 'cash',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('submitConfirmation', () => {
    it('creates a pending bKash payment with trx ID', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue({
        id: 'booking-1', userId: 'user-1', bookingCode: 'FLY-ABC123', bookingType: 'tour',
        status: 'pending', totalAmount: 5000, paidAmount: 0, referralDiscount: 0,
        pointsRedemptionBdt: 0, currency: 'BDT', customerName: 'Ada',
      });
      mockPrisma.payment.findFirst.mockResolvedValue(null);
      mockPrisma.payment.create.mockResolvedValue({
        id: 'pay-1', method: 'bkash', status: 'pending', bkashTrxId: '9J3ABCDE',
      });

      const result = await service.submitConfirmation('tenant-1', 'user-1', {
        bookingCode: 'FLY-ABC123',
        method: 'bkash',
        bkashTrxId: '9J3ABCDE',
      });

      expect(result.status).toBe('pending');
      expect(mockPrisma.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            method: 'bkash',
            status: 'pending',
            bkashTrxId: '9J3ABCDE',
            userId: 'user-1',
            bookingId: 'booking-1',
            amount: 5000,
          }),
        }),
      );
    });

    it('rejects bank transfer without a receipt', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue({
        id: 'booking-1', userId: 'user-1', bookingCode: 'FLY-ABC123', bookingType: 'tour',
        status: 'pending', totalAmount: 5000, paidAmount: 0, referralDiscount: 0,
        pointsRedemptionBdt: 0, currency: 'BDT', customerName: 'Ada',
      });
      mockPrisma.bankAccount.findFirst.mockResolvedValue({ id: 'ba-1' });

      await expect(
        service.submitConfirmation('tenant-1', 'user-1', {
          bookingCode: 'FLY-ABC123',
          method: 'bank_transfer',
          bankAccountId: 'ba-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
