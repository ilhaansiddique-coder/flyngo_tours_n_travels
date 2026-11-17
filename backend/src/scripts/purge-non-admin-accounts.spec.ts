import { PrismaClient } from '@prisma/client';
import { purgeNonAdminAccounts } from './purge-non-admin-accounts';
import { PRIMARY_ADMIN_EMAIL, PRIMARY_ADMIN_ID } from '../common/constants/primary-admin';
import { AccountDeletionService } from '../modules/users/account-deletion.service';
import { PrismaService } from '../database/prisma.service';
import { MediaService } from '../modules/media/media.service';
import { MediaDeletionService } from '../modules/media/media-deletion.service';

describe('one-time account cleanup preserving the primary administrator', () => {
  const keeper = { id: PRIMARY_ADMIN_ID, email: PRIMARY_ADMIN_EMAIL, tenantId: 'flyngo-tenant',
    fullName: 'Super Admin', passwordHash: 'unchanged-private-hash', roleId: 'super-role', role: { code: 'super_admin' },
    isActive: true, deletedAt: null, createdAt: new Date('2026-08-11T00:00:00Z') };
  const targets = [{ id: 'old-customer', fullName: 'Old Customer', deletedAt: new Date() },
    { id: 'current-customer', fullName: 'Current Customer', deletedAt: null }];
  const user = { findUnique: jest.fn(), findMany: jest.fn(), count: jest.fn() };
  const jobs = { count: jest.fn() };
  const remove = jest.fn();
  const db = { user, mediaDeletionJob: jobs } as unknown as Pick<PrismaClient, 'user' | 'mediaDeletionJob'>;
  const deletion = { remove } as Pick<AccountDeletionService, 'remove'>;

  beforeEach(() => {
    jest.resetAllMocks();
    user.findUnique.mockResolvedValue(keeper);
    user.findMany.mockResolvedValue(targets);
    user.count.mockResolvedValue(0);
    jobs.count.mockResolvedValue(0);
    remove.mockResolvedValue({ deleted: true, permanent: true, pendingFileDeletions: 0 });
  });

  it('defaults to a read-only preview and excludes the keeper within its tenant', async () => {
    await expect(purgeNonAdminAccounts(db, deletion)).resolves.toMatchObject({ mode: 'preview', targetCount: 2 });
    expect(remove).not.toHaveBeenCalled();
    expect(user.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { tenantId: 'flyngo-tenant', id: { not: PRIMARY_ADMIN_ID } },
    }));
  });

  it('purges current and deleted accounts through full linked-data deletion', async () => {
    const result = await purgeNonAdminAccounts(db, deletion, { execute: true, expectedCount: 2 });
    expect(remove.mock.calls).toEqual([['old-customer', 'flyngo-tenant'], ['current-customer', 'flyngo-tenant']]);
    expect(remove).not.toHaveBeenCalledWith(PRIMARY_ADMIN_ID, expect.anything());
    expect(result).toMatchObject({ deletedCount: 2, remaining: 0, failures: [] });
  });

  it('refuses an unexpected account count before making changes', async () => {
    await expect(purgeNonAdminAccounts(db, deletion, { execute: true, expectedCount: 23 })).rejects.toThrow('expected count');
    expect(remove).not.toHaveBeenCalled();
  });

  it('refuses a missing or different protected administrator', async () => {
    user.findUnique.mockResolvedValueOnce({ ...keeper, email: 'different@example.invalid' });
    await expect(purgeNonAdminAccounts(db, deletion, { execute: true, expectedCount: 2 })).rejects.toThrow('exact active primary');
    expect(remove).not.toHaveBeenCalled();
  });

  it('reports partial failures without declaring the cleanup complete', async () => {
    remove.mockRejectedValueOnce(Object.assign(new Error('Failure'), { code: 'P2003' }));
    user.count.mockResolvedValueOnce(1);
    await expect(purgeNonAdminAccounts(db, deletion, { execute: true, expectedCount: 2 })).resolves.toMatchObject({
      deletedCount: 1, remaining: 1, failures: [{ id: 'old-customer', code: 'P2003' }],
    });
  });

  it('blocks deletion of the primary administrator before accessing the database', async () => {
    const transaction = jest.fn();
    const service = new AccountDeletionService({ $transaction: transaction } as unknown as PrismaService, {} as MediaService, {} as MediaDeletionService);
    await expect(service.remove(PRIMARY_ADMIN_ID, 'flyngo-tenant')).rejects.toThrow('cannot be deleted');
    expect(transaction).not.toHaveBeenCalled();
  });
});
