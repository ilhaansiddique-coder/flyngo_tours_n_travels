import { UsersService } from './users.service';
import { PrismaService } from '../../database/prisma.service';
import { MediaService } from '../media/media.service';
import { LoyaltyService } from '../loyalty/loyalty.service';

describe('customer creation attribution', () => {
  const prisma = {
    user: { findFirst: jest.fn(), create: jest.fn(), findMany: jest.fn(), count: jest.fn() },
    role: { findFirst: jest.fn() },
  };
  const loyalty = { awardSignupBonus: jest.fn().mockResolvedValue(undefined) };
  let service: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.findFirst.mockResolvedValue({ id: 'staff-1' });
    prisma.role.findFirst.mockResolvedValue({ id: 'customer-role' });
    prisma.user.create.mockResolvedValue({ id: 'customer-1', passwordHash: 'secret' });
    service = new UsersService(prisma as unknown as PrismaService, {} as MediaService, loyalty as unknown as LoyaltyService);
  });

  it('records the authenticated creator and ignores forged attribution in the body', async () => {
    await service.createUser('tenant-1', {
      fullName: 'New Customer', password: 'Password123!',
      createdByUserId: 'forged-user', creationSource: 'self_registration',
    }, 'staff-1');
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { id: 'staff-1', tenantId: 'tenant-1', deletedAt: null, isActive: true },
      select: { id: true },
    });
    expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ createdByUserId: 'staff-1', creationSource: 'admin' }),
    }));
  });

  it('rejects an actor outside the current tenant or no longer active', async () => {
    prisma.user.findFirst.mockResolvedValueOnce(null);
    await expect(service.createUser('tenant-1', { fullName: 'Customer' }, 'other-tenant-user'))
      .rejects.toThrow('Invalid account creator');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('returns creator identity in the admin list without credentials', async () => {
    prisma.user.findMany.mockResolvedValueOnce([{
      id: 'customer-1', creationSource: 'admin', createdBy: { id: 'staff-1', fullName: 'Staff Member' },
      passwordHash: 'secret', refreshToken: 'secret-token',
    }]);
    prisma.user.count.mockResolvedValueOnce(1);
    const result = await service.listUsers('tenant-1');
    expect(result.items[0]).toMatchObject({ createdBy: { id: 'staff-1', fullName: 'Staff Member' } });
    expect(result.items[0]).not.toHaveProperty('passwordHash');
    expect(result.items[0]).not.toHaveProperty('refreshToken');
    expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
      include: expect.objectContaining({ createdBy: { select: { id: true, fullName: true } } }),
    }));
  });
});
