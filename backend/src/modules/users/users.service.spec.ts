import { UsersService } from './users.service';
import { PrismaService } from '../../database/prisma.service';
import { MediaService } from '../media/media.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { AccountDeletionService } from './account-deletion.service';

describe('customer creation attribution', () => {
  const prisma = {
    user: { findFirst: jest.fn(), create: jest.fn(), findMany: jest.fn(), count: jest.fn(), update: jest.fn() },
    role: { findFirst: jest.fn() },
  };
  const loyalty = { awardSignupBonus: jest.fn().mockResolvedValue(undefined) };
  const deletion = { remove: jest.fn().mockResolvedValue({ deleted: true, permanent: true, pendingFileDeletions: 0 }) };
  let service: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.findFirst.mockResolvedValue({ id: 'staff-1' });
    prisma.role.findFirst.mockResolvedValue({ id: 'customer-role' });
    prisma.user.create.mockResolvedValue({ id: 'customer-1', passwordHash: 'secret' });
    service = new UsersService(prisma as unknown as PrismaService, {} as MediaService, loyalty as unknown as LoyaltyService, deletion as unknown as AccountDeletionService);
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

  it('allows a new account to reuse a deleted account’s phone and email', async () => {
    prisma.user.findFirst.mockResolvedValueOnce({ id: 'staff-1' })
      .mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    await expect(service.createUser('tenant-1', {
      fullName: 'Replacement Customer', phone: '+880 1919187588', email: 'customer@example.com',
    }, 'staff-1')).resolves.toHaveProperty('id');
    expect(prisma.user.findFirst).toHaveBeenNthCalledWith(2, {
      where: { tenantId: 'tenant-1', email: { equals: 'customer@example.com', mode: 'insensitive' }, deletedAt: null },
    });
    expect(prisma.user.findFirst).toHaveBeenLastCalledWith({
      where: { tenantId: 'tenant-1', phoneKey: '1919187588', deletedAt: null },
      select: { id: true },
    });
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it('uses complete permanent deletion for admin account removal', async () => {
    await expect(service.removeUser('customer-1', 'tenant-1')).resolves.toMatchObject({ permanent: true });
    expect(deletion.remove).toHaveBeenCalledWith('customer-1', 'tenant-1');
  });

  it('requires the exact confirmation before self-service permanent deletion', async () => {
    await expect(service.permanentlyDeleteOwnAccount('customer-1', 'tenant-1', 'yes')).rejects.toThrow('Type DELETE MY ACCOUNT');
    expect(deletion.remove).not.toHaveBeenCalled();
    await service.permanentlyDeleteOwnAccount('customer-1', 'tenant-1', 'DELETE MY ACCOUNT');
    expect(deletion.remove).toHaveBeenCalledWith('customer-1', 'tenant-1');
  });

  it('does not reserve a phone key while editing a deleted customer', async () => {
    prisma.user.findFirst.mockResolvedValueOnce({
      id: 'deleted-customer', phone: '+8801919187588', deletedAt: new Date(), roleId: 'role-customer',
    });
    prisma.user.update.mockResolvedValueOnce({ id: 'deleted-customer' });
    await service.updateUser('deleted-customer', 'tenant-1', { fullName: 'Updated Historical Name' });
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ phoneKey: null }),
    }));
  });

  it.each([
    { target: ['tenant_id', 'phone_key'] },
    { target: 'users_tenant_phone_key_key' },
    { target: ['tenant_id', 'email'] },
  ])('returns 409 for a concurrent identifier collision (%j)', async ({ target }) => {
    prisma.user.findFirst.mockResolvedValueOnce({ id: 'staff-1' }).mockResolvedValueOnce(null);
    prisma.user.create.mockRejectedValueOnce({ code: 'P2002', meta: { target } });
    const promise = service.createUser('tenant-1', {
      fullName: 'Customer', phone: '+8801919187588', password: 'Password123!',
    }, 'staff-1');
    await expect(promise).rejects.toMatchObject({ status: 409 });
    expect(loyalty.awardSignupBonus).not.toHaveBeenCalled();
  });

  it('does not disguise other database failures as duplicate accounts', async () => {
    const failure = new Error('Database unavailable');
    prisma.user.create.mockRejectedValueOnce(failure);
    await expect(service.createUser('tenant-1', { fullName: 'Customer', password: 'Password123!' }, 'staff-1'))
      .rejects.toBe(failure);
  });
});
