import { MediaDeletionService } from './media-deletion.service';
import { PrismaService } from '../../database/prisma.service';
import { MediaService } from './media.service';

describe('durable account file deletion', () => {
  const jobs = { findMany: jest.fn(), deleteMany: jest.fn(), updateMany: jest.fn() };
  const prisma = { mediaDeletionJob: jobs, $queryRaw: jest.fn() };
  const media = { deleteAccountObject: jest.fn() };
  let worker: MediaDeletionService;

  beforeEach(() => {
    jest.resetAllMocks();
    jobs.findMany.mockResolvedValue([{ id: 'job-1', tenantId: 'tenant-1', url: '/api/v1/uploads/documents/private.pdf' }]);
    prisma.$queryRaw.mockResolvedValue([{ shared: false }]);
    media.deleteAccountObject.mockResolvedValue(undefined);
    worker = new MediaDeletionService(prisma as unknown as PrismaService, media as unknown as MediaService);
  });

  it('removes the job only after its physical file has been deleted', async () => {
    await worker.flush('tenant-1');
    expect(media.deleteAccountObject).toHaveBeenCalledWith('/api/v1/uploads/documents/private.pdf');
    expect(jobs.deleteMany).toHaveBeenCalledWith({ where: { id: 'job-1' } });
    expect(media.deleteAccountObject.mock.invocationCallOrder[0]).toBeLessThan(jobs.deleteMany.mock.invocationCallOrder[0]);
  });

  it('keeps and reschedules a failed deletion, then succeeds on retry', async () => {
    media.deleteAccountObject.mockRejectedValueOnce(new Error('Storage unavailable'));
    await worker.flush();
    expect(jobs.deleteMany).not.toHaveBeenCalled();
    expect(jobs.updateMany).toHaveBeenCalledWith({ where: { id: 'job-1' }, data: {
      attempts: { increment: 1 }, retryAfter: expect.any(Date),
    } });
    await worker.flush();
    expect(jobs.deleteMany).toHaveBeenCalledWith({ where: { id: 'job-1' } });
  });

  it('preserves a file newly referenced by a surviving account', async () => {
    prisma.$queryRaw.mockResolvedValueOnce([{ shared: true }]);
    await worker.flush();
    expect(media.deleteAccountObject).not.toHaveBeenCalled();
    expect(jobs.deleteMany).toHaveBeenCalledWith({ where: { id: 'job-1' } });
  });
});
