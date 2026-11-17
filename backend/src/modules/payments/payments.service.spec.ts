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
      findUnique: jest.fn(),
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
    createNotification: jest.fn().mockResolvedValue({ count: 1 }),
  };

  const mockLoyalty = {
    reverseBookingPoints: jest.fn().mockResolvedValue(undefined),
    awardBookingPoints: jest.fn().mockResolvedValue(undefined),
    getProductPoints: jest.fn().mockResolvedValue(100),
    awardBookingConfirmation: jest.fn().mockResolvedValue(undefined),
    awardHajjUmrahConfirmation: jest.fn().mockResolvedValue(undefined),
  };

  const mockMedia = { upload: jest.fn(), uploadPrivate: jest.fn(), validatePrivateAttachments: jest.fn().mockResolvedValue(undefined) };
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

  describe('incomplete gateway paths', () => {
    it.each(['stripe', 'bkash', 'sslcommerz', 'cash', 'unknown'])('rejects %s intents without creating a payment', async (method) => {
      await expect(service.createPaymentIntent('tenant-1', 'user-1', 'booking-1', method, 100)).rejects.toThrow('Online checkout is unavailable');
      expect(mockPrisma.payment.create).not.toHaveBeenCalled();
    });
    it('rejects unimplemented bKash callbacks before touching payments', async () => {
      await expect(service.handleBKashWebhook('signature', Buffer.from('{}'))).rejects.toThrow('callbacks are unavailable');
      expect(mockPrisma.payment.update).not.toHaveBeenCalled();
    });
    it('does not claim a manual bKash refund was processed', async () => {
      mockPrisma.payment.findFirst.mockResolvedValue({ id: 'pay-1', status: 'completed', transactionId: 'trx', method: 'bkash' });
      await expect(service.refundPayment('tenant-1', 'pay-1')).rejects.toThrow('Automatic bKash refunds are unavailable');
      expect(mockPrisma.payment.update).not.toHaveBeenCalled();
    });
    it.each(['pending', 'failed', 'succeeded'])('only acknowledges a Stripe refund with status %s when settled', async (status) => {
      mockPrisma.payment.findFirst.mockResolvedValue({ id: 'pay-1', status: 'completed', transactionId: 'pi_1', method: 'stripe' });
      const create = jest.fn().mockResolvedValue({ id: 're_1', status, amount: 100, currency: 'bdt' });
      (service as any).stripe = { refunds: { create } };
      const result = service.refundPayment('tenant-1', 'pay-1');
      if (status === 'succeeded') await expect(result).resolves.toMatchObject({ ok: true, refundId: 're_1' });
      else await expect(result).rejects.toThrow('not confirmed the refund');
      expect(create).toHaveBeenCalledWith({ payment_intent: 'pi_1' }, { idempotencyKey: 'flyngo-refund-pay-1' });
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
        expect.objectContaining({ fullName: 'John Doe', amount: 100, currency: 'BDT' }),
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
    it.each(['bkash', 'nagad', 'rocket', 'upay', 'tap', 'surecash', 'mcash', 'bank_transfer', 'cash'])('keeps customer %s evidence pending without crediting the booking', async (method) => {
      mockPrisma.booking.findFirst.mockResolvedValue({ id: 'booking-1', userId: 'user-1', bookingCode: 'FLY-ABC123', status: 'pending', totalAmount: 5000, paidAmount: 0, currency: 'BDT' });
      mockWallets.listPublic.mockResolvedValue([{ id: 'wallet-1', provider: method, walletNumber: '01712345678' }] as any);
      mockPrisma.mobileWallet.findFirst.mockResolvedValue({ id: 'wallet-1', provider: method });
      mockPrisma.bankAccount.findFirst.mockResolvedValue({ id: 'ba-1' });
      mockPrisma.payment.findFirst.mockResolvedValue(null);
      mockPrisma.payment.create.mockResolvedValue({ id: 'pay-1', method, status: 'pending' });
      mockPrisma.payment.findUnique.mockResolvedValue({ id: 'pay-1', method, status: 'pending' });
      const result = await service.submitConfirmation('tenant-1', 'user-1', {
        bookingCode: 'FLY-ABC123', method, bkashTrxId: '9J3ABCDE',
        mobileWalletId: method === 'cash' || method === 'bank_transfer' ? undefined : 'wallet-1',
        bankAccountId: 'ba-1', senderName: 'Ada', receiptUrls: ['/api/v1/media/private/receipt'],
      });
      expect(result?.status).toBe('pending');
      expect(mockPrisma.payment.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ amount: 5000, status: 'pending', method }) }));
      expect(mockPrisma.payment.update).not.toHaveBeenCalled();
      expect(mockPrisma.booking.update).not.toHaveBeenCalled();
      expect(mockInvoices.generateForPayment).not.toHaveBeenCalled();
      expect(mockNotifications.sendSms).not.toHaveBeenCalled();
    });

    it('rejects an unconfigured wallet even if a transaction ID was provided', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue({ id: 'booking-1', userId: 'user-1', status: 'pending', totalAmount: 5000, paidAmount: 0 });
      mockWallets.listPublic.mockResolvedValue([]);
      mockPrisma.tenantSettings.findUnique.mockResolvedValue(null);
      await expect(service.submitConfirmation('tenant-1', 'user-1', { bookingCode: 'FLY-ABC123', method: 'nagad', bkashTrxId: '9J3ABCDE' })).rejects.toThrow('unavailable');
      expect(mockPrisma.payment.create).not.toHaveBeenCalled();
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
