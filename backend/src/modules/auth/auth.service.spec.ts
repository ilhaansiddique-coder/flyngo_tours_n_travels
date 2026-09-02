import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '../../config/config.service';
import { ReferralService } from '../referral/referral.service';
import { TrackingService } from '../tracking/tracking.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let referralService: ReferralService;
  let trackingService: TrackingService;

  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
      // login stamps lastLoginAt; capture-first provisioning updates and
      // reads accounts created from a booking.
      update: jest.fn().mockResolvedValue({}),
      findUnique: jest.fn(),
    },
    role: {
      findFirst: jest.fn(),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({}),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock-token'),
    verifyAsync: jest.fn(),
  };

  const mockConfig = {
    get: jest.fn((key: string) => {
      const map: Record<string, string> = {
        JWT_ACCESS_SECRET: 'test-access-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_ACCESS_EXPIRY: '24h',
        JWT_REFRESH_EXPIRY: '24h',
      };
      return map[key] || '';
    }),
    getOrNull: jest.fn(),
    isDevelopment: true,
    isProduction: false,
    isMultiTenant: false,
  };

  const mockReferralService = {
    prepareRegistration: jest.fn().mockResolvedValue({ referralCode: 'TESTCODE' }),
    finalizeRegistration: jest.fn().mockResolvedValue(undefined),
    awardSignupBonus: jest.fn().mockResolvedValue(undefined),
  };

  const mockTrackingService = {
    emitServerEvent: jest.fn().mockResolvedValue(undefined),
  };

  const mockNotifications = {
    sendEmail: jest.fn().mockResolvedValue({ sent: true, provider: 'log' }),
    sendSms: jest.fn().mockResolvedValue({ sent: true, provider: 'log' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfig },
        { provide: ReferralService, useValue: mockReferralService },
        { provide: TrackingService, useValue: mockTrackingService },
        { provide: NotificationsService, useValue: mockNotifications },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    referralService = module.get<ReferralService>(ReferralService);
    trackingService = module.get<TrackingService>(TrackingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const passwordHash = await bcryptjs.hash('Password123!', 12);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash,
        deletedAt: null,
      });

      const result = await service.login(
        { email: 'test@example.com', phone: '+8801712345678', password: 'Password123!' },
        'tenant-1',
      );

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'wrong@example.com', phone: '+8801712345678', password: 'Password123!' }, 'tenant-1'),
      ).rejects.toThrow(UnauthorizedException);
    });

    // The frontend sends both keys with the unused one blank. These cover the
    // email-only payload, which previously never reached the service at all.
    it('should log in with an email-only payload', async () => {
      const passwordHash = await bcryptjs.hash('Password123!', 12);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'admin@flyngo.com',
        passwordHash,
        deletedAt: null,
      });

      const result = await service.login(
        { email: 'admin@flyngo.com', phone: '', password: 'Password123!' },
        'tenant-1',
      );

      expect(result).toHaveProperty('accessToken');
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1', OR: [{ email: 'admin@flyngo.com' }], deletedAt: null },
      });
    });

    it('should not query by a blank phone when logging in by email', async () => {
      const passwordHash = await bcryptjs.hash('Password123!', 12);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'admin@flyngo.com',
        passwordHash,
        deletedAt: null,
      });

      await service.login({ email: 'admin@flyngo.com', phone: '', password: 'Password123!' }, 'tenant-1');

      const { OR } = mockPrisma.user.findFirst.mock.calls[0][0].where;
      expect(OR).toHaveLength(1);
      expect(OR[0]).not.toHaveProperty('phone');
    });

    it('should log in with a phone-only payload', async () => {
      const passwordHash = await bcryptjs.hash('Password123!', 12);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-2',
        phone: '+8801712345678',
        passwordHash,
        deletedAt: null,
      });

      const result = await service.login(
        { email: '', phone: '+8801712345678', password: 'Password123!' },
        'tenant-1',
      );

      expect(result).toHaveProperty('accessToken');
      // Phone is matched on its normalized core (last 10 digits) so country
      // code / leading zero / spacing differences still resolve to the user.
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1', OR: [{ phone: { endsWith: '1712345678' } }], deletedAt: null },
      });
    });

    it('should reject when neither identifier is supplied without querying', async () => {
      await expect(
        service.login({ email: '', phone: '', password: 'Password123!' }, 'tenant-1'),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockPrisma.user.findFirst).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const passwordHash = await bcryptjs.hash('CorrectPass1', 12);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash,
        deletedAt: null,
      });

      await expect(
        service.login({ email: 'test@example.com', phone: '+8801712345678', password: 'WrongPass1' }, 'tenant-1'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create user and return tokens', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.role.findFirst.mockResolvedValue({ id: 'role-customer' });
      mockPrisma.user.create.mockResolvedValue({
        id: 'new-user-1',
        email: 'new@example.com',
        fullName: 'New User',
        tenantId: 'tenant-1',
        roleId: 'role-customer',
      });

      const result = await service.register(
        { email: 'new@example.com', phone: '+8801712345678', password: 'Password123!', fullName: 'New User', address: 'Dhaka, BD' },
        'tenant-1',
      );

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException for duplicate email', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing-user' });

      await expect(
        service.register(
          { email: 'existing@example.com', phone: '+8801712345678', password: 'Password123!', fullName: 'Existing', address: 'Dhaka, BD' },
          'tenant-1',
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens for valid refresh token', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: 'user-1',
        tenantId: 'tenant-1',
      });
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        deletedAt: null,
        passwordHash: 'hashed',
      });

      const result = await service.refreshToken('valid-refresh-token', 'tenant-1');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid'));

      await expect(
        service.refreshToken('invalid-token', 'tenant-1'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // The collision matrix is the risky part of capture-first booking: get a case
  // wrong and the public booking form becomes a way to attach yourself to
  // someone else's account, or a way to probe which numbers have booked.
  describe('resolveBookingAccount', () => {
    beforeEach(() => {
      mockPrisma.user.findFirst.mockReset();
      mockPrisma.user.create.mockReset();
      mockPrisma.role.findFirst.mockResolvedValue({ id: 'role-customer' });
    });

    it('uses the signed-in user and never looks up by phone', async () => {
      const res = await service.resolveBookingAccount('tenant-1', 'user-9', {
        fullName: 'Someone Else',
        phone: '01711223344',
      });

      expect(res).toEqual({ userId: 'user-9', created: false, provisional: false });
      expect(mockPrisma.user.findFirst).not.toHaveBeenCalled();
    });

    it('creates an invited account with temp password for a new guest', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 'user-new' });

      const res = await service.resolveBookingAccount('tenant-1', null, {
        fullName: 'Asif Khan',
        phone: '+880 1711223344',
      });

      expect(res).toEqual({ userId: 'user-new', created: true, provisional: true });
      const data = mockPrisma.user.create.mock.calls[0][0].data;
      // Auto-provisioned with the well-known temp password, not null.
      expect(data.passwordHash).toBeTruthy();
      expect(data.accountStatus).toBe('invited');
      expect(data.mustChangePassword).toBe(true);
      expect(data.tempPasswordExpiresAt).toBeInstanceOf(Date);
      // Canonicalised, so the same number in another format won't duplicate.
      expect(data.phoneKey).toBe('1711223344');
    });

    it('reuses an existing ACTIVE account without disclosing that it exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-existing',
        accountStatus: 'active',
        fullName: 'Real Owner',
        email: 'owner@example.com',
        phone: '01711223344',
      });

      const res = await service.resolveBookingAccount('tenant-1', null, {
        fullName: 'Someone Typing The Same Number',
        phone: '01711223344',
      });

      // Linked, but flagged as non-provisional and NOT signed in — the caller
      // gets no token and no hint that the account was already there.
      expect(res).toEqual({ userId: 'user-existing', created: false, provisional: false });
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
      // An active account's details are never overwritten from a booking form.
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('books as a pure guest when the phone is unusable', async () => {
      const res = await service.resolveBookingAccount('tenant-1', null, {
        fullName: 'No Phone',
        phone: '123',
      });

      expect(res).toEqual({ userId: null, created: false, provisional: false });
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('recovers from a concurrent booking that created the account first', async () => {
      mockPrisma.user.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'user-raced', accountStatus: 'provisional' });
      mockPrisma.user.create.mockRejectedValue({ code: 'P2002' });

      const res = await service.resolveBookingAccount('tenant-1', null, {
        fullName: 'Asif',
        phone: '01711223344',
      });

      expect(res).toEqual({ userId: 'user-raced', created: false, provisional: true });
    });
  });
});
