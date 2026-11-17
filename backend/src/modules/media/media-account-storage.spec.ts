jest.mock('fs', () => ({ ...jest.requireActual('fs'), promises: { ...jest.requireActual('fs').promises, unlink: jest.fn() } }));
import { promises as fs } from 'fs';
import * as path from 'path';
import { MediaService } from './media.service';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '../../config/config.service';

describe('account file storage boundaries', () => {
  let service: MediaService;
  beforeEach(() => {
    jest.resetAllMocks();
    service = new MediaService({} as PrismaService, { getOrNull: () => null } as unknown as ConfigService);
  });

  it('physically deletes a managed local object', async () => {
    await service.deleteAccountObject('/api/v1/uploads/documents/test.pdf');
    expect(fs.unlink).toHaveBeenCalledWith(path.resolve(process.cwd(), 'uploads/documents/test.pdf'));
  });

  it.each(['/api/v1/uploads/../../outside.txt', '/api/v1/uploads/%2e%2e%2foutside.txt', '/api/v1/uploads-evil/doc.pdf', 'https://example.com/doc.pdf'])(
    'rejects an unsafe or unmanaged URL: %s', async (url) => {
      await expect(service.deleteAccountObject(url)).rejects.toThrow();
      expect(fs.unlink).not.toHaveBeenCalled();
    });

  it('treats a missing object as already deleted', async () => {
    (fs.unlink as jest.Mock).mockRejectedValueOnce({ code: 'ENOENT' });
    await expect(service.deleteAccountObject('/api/v1/uploads/documents/gone.pdf')).resolves.toBeUndefined();
  });

  it('propagates storage failures so cleanup can retry', async () => {
    (fs.unlink as jest.Mock).mockRejectedValueOnce({ code: 'EACCES' });
    await expect(service.deleteAccountObject('/api/v1/uploads/documents/test.pdf')).rejects.toMatchObject({ code: 'EACCES' });
  });
});
