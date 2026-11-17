import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';

jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('new-hash'),
}));

describe('account status authentication enforcement', () => {
  let service: AuthService;
  let prisma: any;
  let jwt: any;
  let config: any;
  const activeUser = {
    id: 'customer-1', tenantId: 'tenant-1', isActive: true, deletedAt: null,
    passwordHash: 'hash', fullName: 'Customer', email: 'customer@example.com',
    role: { code: 'customer', permissions: [] },
  };
  const profile = {
    email: activeUser.email, fullName: activeUser.fullName, provider: 'google', providerId: 'google-1',
  };

  beforeEach(() => {
    prisma = {
      user: {
        findFirst: jest.fn().mockResolvedValue({ ...activeUser }),
        findUnique: jest.fn().mockResolvedValue({ ...activeUser }),
        update: jest.fn().mockResolvedValue({ ...activeUser }),
        create: jest.fn(),
      },
      passwordReset: { findUnique: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
      $transaction: jest.fn().mockResolvedValue([]),
    };
    jwt = {
      verifyAsync: jest.fn().mockResolvedValue({ sub: activeUser.id, tenantId: activeUser.tenantId }),
      signAsync: jest.fn().mockResolvedValue('new-token'),
    };
    config = { get: jest.fn((_key, fallback) => fallback || 'test-secret') };
    service = new AuthService(prisma, jwt, config, {
      onUserVerified: jest.fn().mockResolvedValue(undefined),
    } as any, {} as any, {} as any);
  });

  it.each([false, true])('blocks disabled password login (mustChangePassword=%s) without issuing any token', async (mustChangePassword) => {
    prisma.user.findFirst.mockResolvedValue({ ...activeUser, isActive: false, mustChangePassword });
    await expect(service.login({ email: activeUser.email, password: 'correct-password' }, 'tenant-1'))
      .rejects.toThrow(UnauthorizedException);
    expect(jwt.signAsync).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('keeps active password login working', async () => {
    await expect(service.login({ email: activeUser.email, password: 'correct-password' }, 'tenant-1'))
      .resolves.toHaveProperty('accessToken');
  });

  it('blocks refresh tokens issued before deactivation', async () => {
    prisma.user.findFirst.mockResolvedValue({ ...activeUser, isActive: false });
    await expect(service.refreshToken('existing-refresh-token', 'tenant-1')).rejects.toThrow(UnauthorizedException);
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  it('keeps active refresh working', async () => {
    await expect(service.refreshToken('existing-refresh-token', 'tenant-1')).resolves.toHaveProperty('accessToken');
  });

  it.each(['google', 'facebook'])('blocks disabled %s OAuth login before linking or updating the account', async (provider) => {
    prisma.user.findFirst.mockResolvedValue({ ...activeUser, isActive: false });
    await expect(service.validateOAuthUser({ ...profile, provider }, 'tenant-1')).rejects.toThrow(UnauthorizedException);
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  it('keeps active OAuth login working', async () => {
    await expect(service.validateOAuthUser(profile, 'tenant-1')).resolves.toHaveProperty('accessToken');
  });

  it('blocks completing a temporary-password change after deactivation', async () => {
    prisma.user.findFirst.mockResolvedValue({ ...activeUser, isActive: false });
    await expect(service.completePasswordChange('tenant-1', activeUser.id, 'old-password', 'new-password'))
      .rejects.toThrow(UnauthorizedException);
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  it('checks the current active state when accepting a scoped token', async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: activeUser.id, tenantId: 'tenant-1', scope: 'password_change' });
    prisma.user.findFirst.mockResolvedValue(null);
    await expect(service.verifyScopedToken('old-scoped-token', 'password_change')).rejects.toThrow(UnauthorizedException);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { id: activeUser.id, tenantId: 'tenant-1', deletedAt: null, isActive: true },
      select: { id: true },
    });
  });

  it('keeps active scoped tokens working', async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: activeUser.id, tenantId: 'tenant-1', scope: 'password_change' });
    await expect(service.verifyScopedToken('scoped-token', 'password_change'))
      .resolves.toEqual({ sub: activeUser.id, tenantId: 'tenant-1' });
  });

  it('does not consume an old reset link or update a disabled account', async () => {
    prisma.passwordReset.findUnique.mockResolvedValue({
      id: 'reset-1', userId: activeUser.id, tenantId: 'tenant-1', usedAt: null,
      expiresAt: new Date(Date.now() + 60000),
    });
    prisma.user.findFirst.mockResolvedValue(null);
    await expect(service.resetPassword('existing-reset-token', 'new-password')).rejects.toThrow(BadRequestException);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { id: activeUser.id, tenantId: 'tenant-1', deletedAt: null, isActive: true },
      select: { id: true },
    });
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('keeps password reset working for active accounts', async () => {
    prisma.passwordReset.findUnique.mockResolvedValue({
      id: 'reset-1', userId: activeUser.id, tenantId: 'tenant-1', usedAt: null,
      expiresAt: new Date(Date.now() + 60000),
    });
    await expect(service.resetPassword('reset-token', 'new-password')).resolves.toEqual({ success: true });
  });

  function context(request: any): any {
    return { getHandler: () => ({}), getClass: () => ({}), switchToHttp: () => ({ getRequest: () => request }) };
  }

  it('rejects the same access token on the next protected request after deactivation', async () => {
    const guard = new JwtAuthGuard(jwt, { getAllAndOverride: () => false } as any, config, prisma);
    const request = { headers: { authorization: 'Bearer existing-access-token' } };
    await expect(guard.canActivate(context(request))).resolves.toBe(true);
    prisma.user.findUnique.mockResolvedValue({ ...activeUser, isActive: false });
    await expect(guard.canActivate(context({ headers: request.headers }))).rejects.toThrow(UnauthorizedException);
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(2);
  });

  it('still rejects deleted users with otherwise valid access tokens', async () => {
    prisma.user.findUnique.mockResolvedValue({ ...activeUser, deletedAt: new Date() });
    const guard = new JwtAuthGuard(jwt, { getAllAndOverride: () => false } as any, config, prisma);
    await expect(guard.canActivate(context({ headers: { authorization: 'Bearer token' } })))
      .rejects.toThrow(UnauthorizedException);
  });

  it('keeps public endpoints accessible without a token', async () => {
    const guard = new JwtAuthGuard(jwt, { getAllAndOverride: () => true } as any, config, prisma);
    await expect(guard.canActivate(context({ headers: {} }))).resolves.toBe(true);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('does not attach a disabled identity on optional-auth public endpoints', async () => {
    prisma.user.findUnique.mockResolvedValue({ ...activeUser, isActive: false });
    const guard = new OptionalJwtAuthGuard(jwt, config, prisma);
    const request: any = { headers: { authorization: 'Bearer existing-access-token' } };
    await expect(guard.canActivate(context(request))).resolves.toBe(true);
    expect(request.user).toBeUndefined();
  });

  it('still attaches active identities on optional-auth endpoints', async () => {
    const guard = new OptionalJwtAuthGuard(jwt, config, prisma);
    const request: any = { headers: { authorization: 'Bearer existing-access-token' } };
    await expect(guard.canActivate(context(request))).resolves.toBe(true);
    expect(request.user.id).toBe(activeUser.id);
  });

  it('keeps anonymous optional-auth requests working', async () => {
    const guard = new OptionalJwtAuthGuard(jwt, config, prisma);
    await expect(guard.canActivate(context({ headers: {} }))).resolves.toBe(true);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('makes the Passport strategy reject inactive or deleted accounts', async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    const strategy = new JwtStrategy(config, prisma);
    await expect(strategy.validate({ sub: activeUser.id, tenantId: 'tenant-1' })).rejects.toThrow(UnauthorizedException);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { id: activeUser.id, tenantId: 'tenant-1', deletedAt: null, isActive: true },
      select: { id: true },
    });
  });

  it('keeps the Passport strategy working for active accounts', async () => {
    const strategy = new JwtStrategy(config, prisma);
    await expect(strategy.validate({ sub: activeUser.id, tenantId: 'tenant-1' }))
      .resolves.toEqual({ id: activeUser.id, tenantId: 'tenant-1' });
  });
});
