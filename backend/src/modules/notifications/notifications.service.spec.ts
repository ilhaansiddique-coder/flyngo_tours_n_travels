import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '../../config/config.service';

const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: mockSendMail,
  })),
}));

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: PrismaService;
  let config: ConfigService;

  const mockPrisma = {
    notification: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    },
    deviceToken: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockConfig = {
    getOrNull: jest.fn((key: string) => {
      const config: Record<string, string | null> = {
        SMTP_HOST: 'smtp.gmail.com',
        SMTP_PORT: '587',
        SMTP_SECURE: 'false',
        SMTP_USER: 'test@example.com',
        SMTP_PASSWORD: 'password',
        EMAIL_FROM: 'Flyngo <noreply@flyngo.com>',
      };
      return config[key] ?? null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get<PrismaService>(PrismaService);
    config = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    beforeEach(() => {
      mockSendMail.mockClear();
    });

    it('should send email via transporter with correct template', async () => {
      const result = await service.sendEmail(
        'test@example.com',
        'Booking Confirmed',
        'booking-confirmation',
        { fullName: 'John', bookingCode: 'FLY-001', totalAmount: '500', currency: 'USD' },
      );

      expect(result.sent).toBe(true);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: 'Booking Confirmed',
        }),
      );
    });

    it('should render booking-confirmation template', async () => {
      await service.sendEmail(
        'test@example.com',
        'Booking Confirmed',
        'booking-confirmation',
        { fullName: 'John', bookingCode: 'FLY-001', totalAmount: '500', currency: 'USD' },
      );

      const html = mockSendMail.mock.calls[0][0].html;
      expect(html).toContain('John');
      expect(html).toContain('FLY-001');
      expect(html).toContain('500');
    });

    it('should render payment-receipt template', async () => {
      await service.sendEmail(
        'test@example.com',
        'Payment Received',
        'payment-receipt',
        { fullName: 'Jane', bookingCode: 'FLY-002', amount: '300', currency: 'USD' },
      );

      const html = mockSendMail.mock.calls[0][0].html;
      expect(html).toContain('Jane');
      expect(html).toContain('FLY-002');
      expect(html).toContain('300');
    });

    it('should mention the generated invoice in payment-receipt template', async () => {
      await service.sendEmail(
        'test@example.com',
        'Payment Received',
        'payment-receipt',
        {
          fullName: 'Jane',
          bookingCode: 'FLY-002',
          amount: '300',
          currency: 'USD',
          invoiceNumber: 'INV-20260904-AB12',
          invoiceUrl: 'https://flyngo.world/pay/FLY-002',
        },
      );

      const html = mockSendMail.mock.calls[0][0].html;
      expect(html).toContain('INV-20260904-AB12');
      expect(html).toContain('has been generated');
      expect(html).toContain('https://flyngo.world/pay/FLY-002');
    });

    it('should render booking-cancelled template', async () => {
      await service.sendEmail(
        'test@example.com',
        'Booking Cancelled',
        'booking-cancelled',
        { fullName: 'Bob', bookingCode: 'FLY-003' },
      );

      const html = mockSendMail.mock.calls[0][0].html;
      expect(html).toContain('Bob');
      expect(html).toContain('FLY-003');
    });
  });

  describe('getNotifications', () => {
    it('should return paginated notifications', async () => {
      mockPrisma.notification.findMany.mockResolvedValue([
        { id: 'notif-1', title: 'Test', readAt: null },
      ]);
      mockPrisma.notification.count.mockResolvedValue(1);

      const result = await service.getNotifications('user-1', 'tenant-1', 1, 20);

      expect(result.items).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
    });
  });

  describe('markAsRead', () => {
    it('should update readAt timestamp', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.markAsRead('notif-1', 'user-1');

      expect(result.success).toBe(true);
      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: { id: 'notif-1', userId: 'user-1' },
        data: { readAt: expect.any(Date) },
      });
    });
  });

  describe('markAllAsRead', () => {
    it('should update all unread notifications', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.markAllAsRead('user-1', 'tenant-1');

      expect(result.success).toBe(true);
      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', tenantId: 'tenant-1', readAt: null },
        data: { readAt: expect.any(Date) },
      });
    });
  });

  describe('createNotification', () => {
    it('should create notifications for specific users', async () => {
      const mockCreate = jest.fn().mockResolvedValue({ id: 'notif-1' });
      mockPrisma.notification.create = mockCreate;
      mockPrisma.$transaction.mockImplementation((promises: Promise<any>[]) => Promise.all(promises));

      const result = await service.createNotification('tenant-1', {
        userIds: ['user-1', 'user-2'],
        type: 'info',
        title: 'Test Notification',
        body: 'Hello there',
      });

      expect(result.count).toBe(2);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should create notifications for all tenant users when no userIds', async () => {
      mockPrisma.user.findMany.mockResolvedValue([{ id: 'user-1' }, { id: 'user-2' }]);
      const mockCreate = jest.fn().mockResolvedValue({ id: 'notif-1' });
      mockPrisma.notification.create = mockCreate;
      mockPrisma.$transaction.mockImplementation((promises: Promise<any>[]) => Promise.all(promises));

      const result = await service.createNotification('tenant-1', {
        type: 'info',
        title: 'Test Notification',
        body: 'Hello there',
      });

      expect(result.count).toBe(2);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1', deletedAt: null },
        select: { id: true },
      });
    });
  });

  describe('removeNotification', () => {
    it('should delete notification', async () => {
      mockPrisma.notification.findFirst.mockResolvedValue({ id: 'notif-1', tenantId: 'tenant-1' });
      mockPrisma.notification.delete.mockResolvedValue({ id: 'notif-1' });

      const result = await service.removeNotification('notif-1', 'tenant-1');

      expect(result.success).toBe(true);
      expect(mockPrisma.notification.delete).toHaveBeenCalledWith({ where: { id: 'notif-1' } });
    });

    it('should return success false when notification not found', async () => {
      mockPrisma.notification.findFirst.mockResolvedValue(null);

      const result = await service.removeNotification('fake-id', 'tenant-1');

      expect(result.success).toBe(false);
      expect(mockPrisma.notification.delete).not.toHaveBeenCalled();
    });
  });

  describe('registerDeviceToken', () => {
    it('should create a device token when none exists', async () => {
      mockPrisma.deviceToken.findFirst.mockResolvedValue(null);
      mockPrisma.deviceToken.create.mockResolvedValue({ id: 'dt-1' });

      const result = await service.registerDeviceToken('tenant-1', 'user-1', { token: 'tok-123', platform: 'web' });

      expect(result).toEqual({ registered: true });
      expect(mockPrisma.deviceToken.create).toHaveBeenCalledWith({
        data: { tenantId: 'tenant-1', userId: 'user-1', token: 'tok-123', platform: 'web' },
      });
    });

    it('should return alreadyExists when token is registered', async () => {
      mockPrisma.deviceToken.findFirst.mockResolvedValue({ id: 'dt-1' });

      const result = await service.registerDeviceToken('tenant-1', 'user-1', { token: 'tok-123' });

      expect(result).toEqual({ registered: true, alreadyExists: true });
      expect(mockPrisma.deviceToken.create).not.toHaveBeenCalled();
    });

    it('should throw when token is missing', async () => {
      await expect(
        service.registerDeviceToken('tenant-1', 'user-1', { token: '' }),
      ).rejects.toThrow('Token is required');
    });
  });
});
