import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '../../config/config.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrisma = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    role: {
      findFirst: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock-token'),
  };

  const mockConfig = {
    get: jest.fn((key: string) => {
      const map: Record<string, string> = {
        JWT_ACCESS_SECRET: 'test-access-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_ACCESS_EXPIRY: '15m',
        JWT_REFRESH_EXPIRY: '7d',
      };
      return map[key] || '';
    }),
    getOrNull: jest.fn(),
    isDevelopment: true,
    isProduction: false,
    isMultiTenant: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
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
        { email: 'test@example.com', password: 'Password123!' },
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
        service.login({ email: 'wrong@example.com', password: 'Password123!' }, 'tenant-1'),
      ).rejects.toThrow(UnauthorizedException);
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
        service.login({ email: 'test@example.com', password: 'WrongPass1' }, 'tenant-1'),
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
        { email: 'new@example.com', password: 'Password123!', fullName: 'New User' },
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
          { email: 'existing@example.com', password: 'Password123!', fullName: 'Existing' },
          'tenant-1',
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens for valid refresh token', async () => {
      jest.spyOn(jwtService, 'verifyAsync' as any).mockResolvedValue({
        sub: 'user-1',
        tenantId: 'tenant-1',
      });
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        deletedAt: null,
      });

      const result = await service.refreshToken('valid-refresh-token', 'tenant-1');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('Invalid'));

      await expect(
        service.refreshToken('invalid-token', 'tenant-1'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
