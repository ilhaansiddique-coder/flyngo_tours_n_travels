jest.mock('./api', () => ({ api: { getBlob: jest.fn().mockResolvedValue(new Blob(['document'])) } }));
import { api } from './api';
import { rememberPrivateUpload, privateUploadTokens, bookingUploadTokens, privateFileBlob } from './private-files';

describe('private file client', () => {
  beforeEach(() => jest.clearAllMocks());
  it('sends guest capabilities in headers, never in the URL', async () => {
    const url = '/api/v1/media/private/file-1';
    rememberPrivateUpload({ url, uploadToken: 'guest-secret' });
    await privateFileBlob(url);
    expect(api.getBlob).toHaveBeenCalledWith('/media/private/file-1', {
      cache: 'no-store', headers: { 'X-Upload-Token': 'guest-secret' },
    });
  });
  it('includes capabilities only for selected attachments', () => {
    const selected = '/api/v1/media/private/selected';
    rememberPrivateUpload({ url: selected, uploadToken: 'selected-secret' });
    rememberPrivateUpload({ url: '/api/v1/media/private/unused', uploadToken: 'other-secret' });
    expect(privateUploadTokens([selected])).toEqual({ [selected]: 'selected-secret' });
    expect(bookingUploadTokens({ doc_passport: selected, notes: '/api/v1/media/private/unused' })).toEqual({ [selected]: 'selected-secret' });
  });
  it.each(['https://untrusted.example/file', '/api/v1/uploads/old.pdf', '/api/v1/media/private/../../users'])('rejects unsafe download URL %s without sending credentials', async (url) => {
    await expect(privateFileBlob(url)).rejects.toThrow('Invalid private file URL');
    expect(api.getBlob).not.toHaveBeenCalled();
  });
});
