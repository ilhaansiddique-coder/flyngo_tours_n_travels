import { BadRequestException, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { MediaService } from './media.service';
import { PRIVATE_MEDIA_PREFIX, privateFilePath, blockPrivateStaticFiles, hashUploadToken, privateMime } from './private-storage';

describe('private documents', () => {
  let service: MediaService;
  let db: any;
  const written: string[] = [];
  const owner = { id: 'owner', tenantId: 'tenant-1', roleCode: 'customer' };
  const id = randomUUID();
  const file = { id, tenantId: 'tenant-1', url: PRIVATE_MEDIA_PREFIX + id, isPrivate: true,
    folder: 'user-documents', uploadedById: owner.id, filename: 'passport.pdf',
    uploadTokenHash: null, uploadTokenExpiresAt: null };
  const content = Buffer.from('%PDF-1.7\ntest document');

  beforeEach(() => {
    db = {
      media: { findFirst: jest.fn().mockResolvedValue({ ...file }), create: jest.fn().mockImplementation(({ data }) => Promise.resolve(data)) },
      user: { findFirst: jest.fn().mockResolvedValue(null) },
      userDocument: { findFirst: jest.fn().mockResolvedValue(null) },
      payment: { findFirst: jest.fn().mockResolvedValue(null) },
      booking: { findMany: jest.fn().mockResolvedValue([]) },
    };
    service = new MediaService(db, { getOrNull: () => null } as any);
  });
  beforeAll(async () => {
    await fs.mkdir(path.dirname(privateFilePath(id)), { recursive: true });
    await fs.writeFile(privateFilePath(id), content);
    written.push(privateFilePath(id));
  });
  afterAll(async () => { for (const target of written) await fs.unlink(target).catch(() => undefined); });

  it('writes uploads only into protected storage, with no public URL', async () => {
    const result = await service.uploadPrivate({ buffer: content, size: content.length, originalname: 'passport.pdf', mimetype: 'application/pdf' } as any,
      { tenantId: 'tenant-1', folder: 'user-documents', ownerId: owner.id });
    const storedId = result.url.slice(PRIVATE_MEDIA_PREFIX.length);
    written.push(privateFilePath(storedId));
    expect(result.url).toMatch(/^\/api\/v1\/media\/private\/[a-f0-9-]+$/);
    expect(await fs.readFile(privateFilePath(storedId))).toEqual(content);
    expect(db.media.create.mock.calls[0][0].data).toMatchObject({ isPrivate: true, uploadedById: owner.id });
    expect(result.uploadToken).toBeUndefined();
  });

  it('issues only a hashed, expiring guest capability in the database', async () => {
    const result = await service.uploadPrivate({ buffer: content, size: content.length, originalname: 'receipt.pdf', mimetype: 'application/pdf' } as any,
      { tenantId: 'tenant-1', folder: 'receipts', guestUpload: true });
    written.push(privateFilePath(result.url.slice(PRIVATE_MEDIA_PREFIX.length)));
    const stored = db.media.create.mock.calls[0][0].data;
    expect(result.uploadToken).toHaveLength(64);
    expect(stored.uploadTokenHash).toBe(hashUploadToken(result.uploadToken!));
    expect(stored.uploadTokenHash).not.toBe(result.uploadToken);
    expect(stored.uploadTokenExpiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('rejects anonymous access even when the document URL is known', async () => {
    await expect(service.readPrivate(id, 'tenant-1')).rejects.toThrow(NotFoundException);
  });
  it('allows the document owner', async () => {
    await expect(service.readPrivate(id, 'tenant-1', owner)).resolves.toMatchObject({ buffer: content, mimeType: 'application/pdf' });
  });
  it.each(['admin', 'super_admin'])('allows same-tenant %s', async (roleCode) => {
    await expect(service.readPrivate(id, 'tenant-1', { ...owner, id: 'staff', roleCode })).resolves.toHaveProperty('buffer');
  });
  it.each(['customer', 'manager', 'moderator'])('denies another %s access to NID/passport documents', async (roleCode) => {
    await expect(service.readPrivate(id, 'tenant-1', { ...owner, id: 'other', roleCode })).rejects.toThrow(NotFoundException);
  });
  it('denies even an administrator from another tenant', async () => {
    await expect(service.readPrivate(id, 'tenant-1', { ...owner, tenantId: 'tenant-2', roleCode: 'super_admin' })).rejects.toThrow(NotFoundException);
    expect(db.media.findFirst).not.toHaveBeenCalled();
  });
  it('checks both tenant and private status when loading the record', async () => {
    await service.readPrivate(id, 'tenant-1', owner);
    expect(db.media.findFirst).toHaveBeenCalledWith({ where: { id, tenantId: 'tenant-1', isPrivate: true } });
  });
  it('allows an owner to open a migrated identity document using its authoritative reference', async () => {
    db.media.findFirst.mockResolvedValue({ ...file, uploadedById: null });
    db.user.findFirst.mockResolvedValue({ id: owner.id });
    await expect(service.readPrivate(id, 'tenant-1', owner)).resolves.toHaveProperty('buffer');
  });
  it('allows the payment owner to open a previously guest-uploaded receipt', async () => {
    db.media.findFirst.mockResolvedValue({ ...file, folder: 'receipts', uploadedById: null });
    db.payment.findFirst.mockResolvedValue({ id: 'payment-1' });
    await expect(service.readPrivate(id, 'tenant-1', owner)).resolves.toHaveProperty('buffer');
    expect(db.payment.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { tenantId: 'tenant-1', userId: owner.id, receiptUrls: { has: file.url } } }));
  });
  it('allows a guest only with their receipt upload capability', async () => {
    db.media.findFirst.mockResolvedValue({ ...file, folder: 'receipts', uploadedById: null,
      uploadTokenHash: hashUploadToken('secret-capability'), uploadTokenExpiresAt: new Date(Date.now() + 60000) });
    await expect(service.readPrivate(id, 'tenant-1', undefined, 'secret-capability')).resolves.toHaveProperty('buffer');
    await expect(service.readPrivate(id, 'tenant-1', undefined, 'wrong-capability')).rejects.toThrow(NotFoundException);
  });
  it('rejects expired capabilities and does not accept capabilities for identity documents', async () => {
    db.media.findFirst.mockResolvedValue({ ...file, folder: 'receipts', uploadTokenHash: hashUploadToken('secret'), uploadTokenExpiresAt: new Date(0) });
    await expect(service.readPrivate(id, 'tenant-1', undefined, 'secret')).rejects.toThrow(NotFoundException);
    db.media.findFirst.mockResolvedValue({ ...file, uploadTokenHash: hashUploadToken('secret'), uploadTokenExpiresAt: new Date(Date.now() + 60000) });
    await expect(service.readPrivate(id, 'tenant-1', undefined, 'secret')).rejects.toThrow(NotFoundException);
  });
  it('rejects attaching another uploader’s receipt using only its URL', async () => {
    await expect(service.validatePrivateAttachments('tenant-1', [file.url], 'other')).rejects.toThrow(BadRequestException);
  });
  it('allows receipt attachment with the matching capability', async () => {
    db.media.findFirst.mockResolvedValue({ ...file, folder: 'receipts', uploadedById: null,
      uploadTokenHash: hashUploadToken('secret'), uploadTokenExpiresAt: new Date(Date.now() + 60000) });
    await expect(service.validatePrivateAttachments('tenant-1', [file.url], null, { [file.url]: 'secret' })).resolves.toBeUndefined();
  });
  it('rejects missing/unregistered or external attachment URLs', async () => {
    db.media.findFirst.mockResolvedValue(null);
    await expect(service.validatePrivateAttachments('tenant-1', ['https://example.com/receipt.pdf'], owner.id)).rejects.toThrow(BadRequestException);
  });
  it('prevents using the public library upload method for sensitive folders', async () => {
    await expect(service.upload({} as any, { tenantId: 'tenant-1', folder: 'User-Documents' })).rejects.toThrow(BadRequestException);
  });
  it.each(['../../outside', '%2e%2e%2foutside', 'a/b', 'a\\b'])('rejects unsafe private paths: %s', (value) => {
    expect(() => privateFilePath(value)).toThrow();
  });
  it('never treats SVG or spoofed HTML as a previewable image', () => {
    expect(privateMime(Buffer.from('<svg onload="alert(1)">'))).toBe('application/octet-stream');
    expect(privateMime(Buffer.from('<html>not an image</html>'))).toBe('application/octet-stream');
  });

  it('keeps new private files local even when public R2 storage is configured', async () => {
    const values: Record<string, string> = { R2_ACCOUNT_ID: 'test', R2_ACCESS_KEY_ID: 'test', R2_SECRET_ACCESS_KEY: 'test', R2_BUCKET_NAME: 'public', R2_PUBLIC_URL: 'https://media.example.test' };
    const r2Service = new MediaService(db, { getOrNull: (key: string) => values[key] || null } as any);
    const send = jest.fn();
    (r2Service as any).r2ClientCache = { send };
    const result = await r2Service.uploadPrivate({ buffer: content, size: content.length, originalname: 'nid.pdf', mimetype: 'application/pdf' } as any,
      { tenantId: 'tenant-1', folder: 'user-documents', ownerId: owner.id });
    written.push(privateFilePath(result.url.slice(PRIVATE_MEDIA_PREFIX.length)));
    expect(send).not.toHaveBeenCalled();
    expect(result.url).toMatch(/^\/api\/v1\/media\/private\//);
  });

  it('copies old R2 documents into protected storage before deleting the public object', async () => {
    const values: Record<string, string> = { R2_ACCOUNT_ID: 'test', R2_ACCESS_KEY_ID: 'test', R2_SECRET_ACCESS_KEY: 'test', R2_BUCKET_NAME: 'public', R2_PUBLIC_URL: 'https://media.example.test' };
    const r2Service = new MediaService(db, { getOrNull: (key: string) => values[key] || null } as any);
    const migratedId = randomUUID();
    written.push(privateFilePath(migratedId));
    const send = jest.fn().mockResolvedValueOnce({ Body: { transformToByteArray: async () => content } }).mockResolvedValueOnce({});
    (r2Service as any).r2ClientCache = { send };
    await r2Service.copyLegacyToPrivate(migratedId, 'https://media.example.test/receipts/old.pdf');
    expect(await fs.readFile(privateFilePath(migratedId))).toEqual(content);
    expect(send.mock.calls[0][0].input).toMatchObject({ Bucket: 'public', Key: 'receipts/old.pdf' });
    await r2Service.deleteAccountObject('https://media.example.test/receipts/old.pdf');
    expect(send.mock.calls[1][0].input).toMatchObject({ Bucket: 'public', Key: 'receipts/old.pdf' });
  });
});

describe('legacy public upload protection', () => {
  it.each(['/user-documents/id.pdf', '/receipts/a.png', '/visa-documents/b.pdf', '/.private/id', '/%75ser-documents/id.pdf', '/%2eprivate/id', '/general/../receipts/id'])('blocks %s before static serving', (url) => {
    const response = { status: jest.fn().mockReturnThis(), end: jest.fn(), setHeader: jest.fn() };
    const next = jest.fn();
    blockPrivateStaticFiles({ path: url }, response, next);
    expect(response.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });
  it('preserves public marketing image access', () => {
    const next = jest.fn();
    blockPrivateStaticFiles({ path: '/tours/cover.jpg' }, {}, next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
