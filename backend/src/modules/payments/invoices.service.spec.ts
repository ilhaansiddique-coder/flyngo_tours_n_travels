import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesService } from './invoices.service';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotFoundException } from '@nestjs/common';

describe('InvoicesService', () => {
  let service: InvoicesService;

  const mockPrisma = {
    invoice: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    payment: {
      findFirst: jest.fn(),
    },
    tenantSettings: {
      findUnique: jest.fn(),
    },
    tour: { findFirst: jest.fn() },
    hotel: { findFirst: jest.fn() },
    flight: { findFirst: jest.fn() },
    visaService: { findFirst: jest.fn() },
    transport: { findFirst: jest.fn() },
    hajjPackage: { findFirst: jest.fn() },
    umrahPackage: { findFirst: jest.fn() },
  };

  const mockNotifications = {
    sendRawHtmlEmail: jest.fn().mockResolvedValue({ sent: true, provider: 'log' }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPrisma.invoice.findFirst.mockReset();
    mockPrisma.tenantSettings.findUnique.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotifications },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
  });

  describe('generateForPayment', () => {
    const paymentId = 'pay-1';
    const tenantId = 'tenant-1';

    it('should return existing invoice if one already exists', async () => {
      const existingInvoice = { id: 'inv-1', invoiceNumber: 'INV-1' };
      mockPrisma.invoice.findFirst.mockResolvedValue(existingInvoice);

      const result = await service.generateForPayment(paymentId, tenantId);

      expect(result).toEqual(existingInvoice);
      expect(mockPrisma.invoice.create).not.toHaveBeenCalled();
    });

    it('should create invoice for completed payment', async () => {
      mockPrisma.invoice.findFirst
        .mockResolvedValueOnce(null) // No existing invoice
        .mockResolvedValueOnce(null); // No title resolution
      mockPrisma.payment.findFirst.mockResolvedValue({
        id: paymentId,
        userId: 'user-1',
        bookingId: 'booking-1',
        hajjUmrahBookingId: null,
        status: 'completed',
        amount: 5000,
        currency: 'BDT',
        booking: {
          totalAmount: 5000,
          discountAmount: 0,
          referralDiscount: 0,
          bookingType: 'tour',
          itemId: 'tour-1',
          guests: 2,
          currency: 'BDT',
        },
        hajjUmrahBooking: null,
        user: { id: 'user-1', fullName: 'John Doe', email: 'john@example.com', phone: '123' },
      });
      mockPrisma.tour.findFirst.mockResolvedValue({ title: 'Bali Trip' });
      mockPrisma.invoice.create.mockResolvedValue({
        id: 'inv-1',
        invoiceNumber: 'INV-1',
        status: 'paid',
      });

      const result = await service.generateForPayment(paymentId, tenantId);

      expect(mockPrisma.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'paid',
            paidAt: expect.any(Date),
          }),
        }),
      );
      expect(result.status).toBe('paid');
    });

    it('should create invoice with discount line item', async () => {
      mockPrisma.invoice.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      mockPrisma.payment.findFirst.mockResolvedValue({
        id: paymentId,
        userId: 'user-1',
        bookingId: 'booking-1',
        hajjUmrahBookingId: null,
        status: 'completed',
        amount: 4500,
        currency: 'BDT',
        booking: {
          totalAmount: 5000,
          discountAmount: 500,
          referralDiscount: 0,
          bookingType: 'tour',
          itemId: 'tour-1',
          guests: 2,
          currency: 'BDT',
        },
        hajjUmrahBooking: null,
        user: { id: 'user-1', fullName: 'John Doe', email: 'john@example.com', phone: '123' },
      });
      mockPrisma.tour.findFirst.mockResolvedValue({ title: 'Bali Trip' });
      mockPrisma.invoice.create.mockResolvedValue({ id: 'inv-1' });

      await service.generateForPayment(paymentId, tenantId);

      expect(mockPrisma.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            lineItems: expect.arrayContaining([
              expect.objectContaining({ description: 'Discount' }),
            ]),
            discount: 500,
          }),
        }),
      );
    });

    it('should retry on unique constraint violation', async () => {
      mockPrisma.invoice.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      mockPrisma.payment.findFirst.mockResolvedValue({
        id: paymentId,
        userId: 'user-1',
        bookingId: 'booking-1',
        hajjUmrahBookingId: null,
        status: 'completed',
        amount: 1000,
        currency: 'BDT',
        booking: {
          totalAmount: 1000,
          discountAmount: 0,
          referralDiscount: 0,
          bookingType: 'tour',
          itemId: 'tour-1',
          guests: 1,
          currency: 'BDT',
        },
        hajjUmrahBooking: null,
        user: { id: 'user-1', fullName: 'John Doe', email: 'john@example.com', phone: '123' },
      });
      mockPrisma.tour.findFirst.mockResolvedValue({ title: 'Trip' });
      
      mockPrisma.invoice.create
        .mockRejectedValueOnce({ code: 'P2002' })
        .mockResolvedValueOnce({ id: 'inv-1', invoiceNumber: 'INV-1' });

      const result = await service.generateForPayment(paymentId, tenantId);

      expect(mockPrisma.invoice.create).toHaveBeenCalledTimes(2);
      expect(result.id).toBe('inv-1');
    });

    it('should throw NotFoundException if payment not found', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue(null);
      mockPrisma.payment.findFirst.mockResolvedValue(null);

      await expect(service.generateForPayment(paymentId, tenantId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('listMine', () => {
    it('should return invoices for a specific user', async () => {
      const invoices = [{ id: 'inv-1' }, { id: 'inv-2' }];
      mockPrisma.invoice.findMany.mockResolvedValue(invoices);

      const result = await service.listMine('tenant-1', 'user-1');

      expect(result).toEqual(invoices);
      expect(mockPrisma.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-1', userId: 'user-1' },
        }),
      );
    });
  });

  describe('listAdmin', () => {
    it('should return paginated invoices', async () => {
      const invoices = [{ id: 'inv-1' }];
      mockPrisma.invoice.findMany.mockResolvedValue(invoices);
      mockPrisma.invoice.count.mockResolvedValue(1);

      const result = await service.listAdmin('tenant-1', 1, 10);

      expect(result.items).toEqual(invoices);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe('getOne', () => {
    it('should return invoice with HTML', async () => {
      const invoice = {
        id: 'inv-1',
        tenantId: 'tenant-1',
        invoiceNumber: 'INV-1',
        status: 'paid',
        subtotal: 1000,
        discount: 0,
        total: 1000,
        paidAmount: 1000,
        currency: 'BDT',
        lineItems: [],
        issuedAt: new Date(),
        paidAt: new Date(),
        user: { fullName: 'John', email: 'john@example.com', phone: '123' },
        booking: { bookingCode: 'BK-1', bookingType: 'tour' },
        hajjUmrahBooking: null,
        payment: { method: 'bkash', bkashTrxId: 'trx-1', transactionId: 'txn-1' },
      };
      mockPrisma.invoice.findFirst.mockResolvedValue(invoice);
      mockPrisma.tenantSettings.findUnique.mockResolvedValue({
        companyName: 'Test Company',
        companyAddress: '123 Street',
        companyPhone: '555',
        companyEmail: 'info@test.com',
      });

      const result = await service.getOne('inv-1', 'tenant-1');

      expect(result.id).toBe('inv-1');
      expect(result.html).toContain('Test Company');
    });

    it('should throw NotFoundException if invoice not found', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue(null);

      await expect(service.getOne('inv-1', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('voidInvoice', () => {
    it('should void invoice and send notification', async () => {
      const invoice = {
        id: 'inv-1',
        tenantId: 'tenant-1',
        invoiceNumber: 'INV-1',
        user: { id: 'user-1', fullName: 'John', email: 'john@example.com' },
      };
      mockPrisma.invoice.findFirst.mockResolvedValue(invoice);
      mockPrisma.invoice.update.mockResolvedValue({ ...invoice, status: 'void' });
      mockPrisma.tenantSettings.findUnique.mockResolvedValue({ companyName: 'Test Co' });

      const result = await service.voidInvoice('inv-1', 'tenant-1');

      expect(result.status).toBe('void');
      expect(mockNotifications.sendRawHtmlEmail).toHaveBeenCalledWith(
        'john@example.com',
        expect.stringContaining('Voided'),
        expect.any(String),
      );
    });

    it('should throw NotFoundException if invoice not found', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue(null);

      await expect(service.voidInvoice('inv-1', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('sendByEmail', () => {
    it('should send email to invoice owner', async () => {
      const invoice = {
        id: 'inv-1',
        tenantId: 'tenant-1',
        invoiceNumber: 'INV-1',
        status: 'paid',
        subtotal: 1000,
        discount: 0,
        total: 1000,
        paidAmount: 1000,
        currency: 'BDT',
        lineItems: [],
        issuedAt: new Date(),
        paidAt: new Date(),
        user: { id: 'user-1', fullName: 'John', email: 'john@example.com', phone: '123' },
        booking: { bookingCode: 'BK-1', bookingType: 'tour' },
        hajjUmrahBooking: null,
        payment: { method: 'bkash', bkashTrxId: null, transactionId: null },
      };
      mockPrisma.invoice.findFirst.mockResolvedValue(invoice);
      mockPrisma.tenantSettings.findUnique.mockResolvedValue({ companyName: 'Test Co' });

      const result = await service.sendByEmail('inv-1', 'tenant-1', undefined, 'user-1');

      expect(result.sent).toBe(true);
      expect(result.email).toBe('john@example.com');
    });

    it('should respect userId for non-admin users (prevent IDOR)', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue(null);

      await expect(
        service.sendByEmail('inv-1', 'tenant-1', undefined, 'wrong-user'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow admin to send to custom email', async () => {
      const invoice = {
        id: 'inv-1',
        tenantId: 'tenant-1',
        invoiceNumber: 'INV-1',
        status: 'paid',
        subtotal: 1000,
        discount: 0,
        total: 1000,
        paidAmount: 1000,
        currency: 'BDT',
        lineItems: [],
        issuedAt: new Date(),
        paidAt: new Date(),
        user: { id: 'user-1', fullName: 'John', email: 'john@example.com', phone: '123' },
        booking: { bookingCode: 'BK-1', bookingType: 'tour' },
        hajjUmrahBooking: null,
        payment: { method: 'bkash', bkashTrxId: null, transactionId: null },
      };
      mockPrisma.invoice.findFirst.mockResolvedValue(invoice);
      mockPrisma.tenantSettings.findUnique.mockResolvedValue({ companyName: 'Test Co' });

      const result = await service.sendByEmail('inv-1', 'tenant-1', 'custom@example.com');

      expect(result.sent).toBe(true);
      expect(result.email).toBe('custom@example.com');
    });
  });

  describe('renderHtml', () => {
    it('should render HTML with company info', async () => {
      mockPrisma.tenantSettings.findUnique.mockResolvedValue({
        companyName: 'Flyngo',
        companyAddress: 'Dhaka',
        companyPhone: '123',
        companyEmail: 'info@flyngo.com',
      });

      const html = await service.renderHtml({
        invoiceNumber: 'INV-1',
        status: 'paid',
        subtotal: 1000,
        discount: 0,
        total: 1000,
        paidAmount: 1000,
        currency: 'BDT',
        lineItems: [],
        issuedAt: new Date(),
        paidAt: new Date(),
        user: { fullName: 'John', email: 'john@example.com', phone: '123' },
        booking: { bookingCode: 'BK-1', bookingType: 'tour' },
        hajjUmrahBooking: null,
        payment: { method: 'bkash', bkashTrxId: null, transactionId: null },
        tenantId: 'tenant-1',
      });

      expect(html).toContain('Flyngo');
      expect(html).toContain('INV-1');
      expect(html).toContain('paid');
    });

    it('should escape HTML in user input', async () => {
      mockPrisma.tenantSettings.findUnique.mockResolvedValue({
        companyName: 'Test',
        companyAddress: '',
        companyPhone: '',
        companyEmail: '',
      });

      const html = await service.renderHtml({
        invoiceNumber: 'INV-1',
        status: 'paid',
        subtotal: 1000,
        discount: 0,
        total: 1000,
        paidAmount: 1000,
        currency: 'BDT',
        lineItems: [],
        issuedAt: new Date(),
        paidAt: new Date(),
        user: { fullName: '<script>alert(1)</script>', email: 'a@b.com', phone: '' },
        booking: { bookingCode: 'BK-1', bookingType: 'tour' },
        hajjUmrahBooking: null,
        payment: { method: 'bkash', bkashTrxId: null, transactionId: null },
        tenantId: 'tenant-1',
      });

      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });
  });

  describe('getPdf', () => {
    it('should generate PDF buffer', async () => {
      const invoice = {
        id: 'inv-1',
        tenantId: 'tenant-1',
        invoiceNumber: 'INV-1',
        status: 'paid',
        subtotal: 1000,
        discount: 0,
        total: 1000,
        paidAmount: 1000,
        currency: 'BDT',
        lineItems: [{ description: 'Tour', quantity: 1, unitPrice: 1000, amount: 1000 }],
        issuedAt: new Date(),
        paidAt: new Date(),
        user: { id: 'user-1', fullName: 'John', email: 'john@example.com', phone: '123' },
        booking: { bookingCode: 'BK-1', bookingType: 'tour' },
        hajjUmrahBooking: null,
        payment: { method: 'bkash' },
      };
      mockPrisma.invoice.findFirst.mockResolvedValue(invoice);
      mockPrisma.tenantSettings.findUnique.mockResolvedValue({ companyName: 'Test Co' });

      const result = await service.getPdf('inv-1', 'tenant-1', 'user-1');

      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.invoiceNumber).toBe('INV-1');
    });
  });
});
