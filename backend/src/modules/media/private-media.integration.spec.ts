import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as express from 'express';
import * as request from 'supertest';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { PrivateMediaMigrationService } from './private-media-migration.service';
import { PRIVATE_MEDIA_PREFIX, privateFilePath, blockPrivateStaticFiles } from './private-storage';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '../../config/config.service';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { AccountDeletionService } from '../users/account-deletion.service';
import { MediaDeletionService } from './media-deletion.service';

const url = process.env.PRIVATE_MEDIA_TEST_DATABASE_URL;
const databaseTests = url ? describe : describe.skip;

databaseTests('private media against PostgreSQL and HTTP', () => {
  let db: PrismaClient;
  let media: MediaService;
  let migration: PrivateMediaMigrationService;
  let app: INestApplication;
  let tenantId: string;
  let ownerId: string;
  let otherId: string;
  let roleId: string;
  let ownerSessionId: string;
  let otherSessionId: string;
  let bookingId: string;
  let oldUrl: string;
  let receiptUrl: string;
  let visaUrl: string;
  let privateUrl: string;
  const legacyFiles: string[] = [];
  const privateFiles: string[] = [];
  const content = Buffer.from('%PDF-1.7\nprivate integration fixture');
  const jwt = new JwtService({ secret: 'private-media-integration-secret', signOptions: { expiresIn: '1h' } });
  const config = { get: () => 'private-media-integration-secret', getOrNull: () => null };

  beforeAll(async () => {
    if (!url || new URL(url).hostname !== '127.0.0.1' || new URL(url).pathname !== '/flyngo_private_media_test') {
      throw new Error('Use the disposable localhost flyngo_private_media_test database only');
    }
    db = new PrismaClient({ datasourceUrl: url });
    media = new MediaService(db as PrismaService, config as any);
    migration = new PrivateMediaMigrationService(db as PrismaService, media);
    const tenant = await db.tenant.create({ data: { name: 'Private media integration', slug: randomUUID() } });
    tenantId = tenant.id;
    const role = await db.role.create({ data: { tenantId, name: 'Customer', code: 'customer' } });
    roleId = role.id;
    ownerId = (await db.user.create({ data: { tenantId, roleId, fullName: 'Document owner' } })).id;
    otherId = (await db.user.create({ data: { tenantId, roleId, fullName: 'Other customer' } })).id;
    ownerSessionId = (await db.authSession.create({ data: { tenantId, userId: ownerId, expiresAt: new Date(Date.now() + 3600_000) } })).id;
    otherSessionId = (await db.authSession.create({ data: { tenantId, userId: otherId, expiresAt: new Date(Date.now() + 3600_000) } })).id;
    async function legacy(folder: string) {
      const key = folder + '/' + randomUUID() + '.pdf';
      const target = path.join(process.cwd(), 'uploads', key);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, content);
      legacyFiles.push(target);
      const result = await db.media.create({ data: { tenantId, url: '/api/v1/uploads/' + key, folder, filename: 'passport.pdf' } });
      privateFiles.push(privateFilePath(result.id));
      return result.url;
    }
    oldUrl = await legacy('general'); // Reference-based migration must cover files outside reserved folders too.
    receiptUrl = await legacy('receipts');
    visaUrl = await legacy('visa-documents');
    await db.user.update({ where: { id: ownerId }, data: { passportUrl: oldUrl, nationalIdFrontUrl: oldUrl } });
    await db.userDocument.create({ data: { tenantId, userId: ownerId, url: oldUrl, filename: 'passport.pdf' } });
    const booking = await db.booking.create({ data: { tenantId, userId: ownerId, bookingCode: randomUUID(), bookingType: 'visa', itemId: 'visa-test', startDate: new Date(), meta: { doc_passport: visaUrl } } });
    bookingId = booking.id;
    await db.payment.create({ data: { tenantId, userId: ownerId, bookingId, amount: 100, method: 'bank_transfer', transactionId: randomUUID(), receiptUrls: [receiptUrl] } });
    const module = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [OptionalJwtAuthGuard, { provide: MediaService, useValue: media },
        { provide: PrismaService, useValue: db }, { provide: JwtService, useValue: jwt }, { provide: ConfigService, useValue: config }],
    }).compile();
    app = module.createNestApplication();
    app.use((req: any, _res: any, next: () => void) => { req.tenantId = tenantId; next(); });
    app.use('/api/v1/uploads', blockPrivateStaticFiles, express.static(path.join(process.cwd(), 'uploads')));
    app.useGlobalGuards(new JwtAuthGuard(jwt, new Reflector(), config as any, db as PrismaService));
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.setGlobalPrefix('api/v1');
    await app.init();
  });
  afterAll(async () => {
    if (app) await app.close();
    if (db && tenantId) {
      await db.payment.deleteMany({ where: { tenantId } });
      await db.booking.deleteMany({ where: { tenantId } });
      await db.userDocument.deleteMany({ where: { tenantId } });
      await db.media.deleteMany({ where: { tenantId } });
      await db.user.deleteMany({ where: { tenantId } });
      await db.role.deleteMany({ where: { tenantId } });
      await db.tenant.delete({ where: { id: tenantId } });
    }
    if (db) await db.$disconnect();
    for (const target of [...legacyFiles, ...privateFiles]) await fs.unlink(target).catch(() => undefined);
  });

  it('copies legacy files, rewrites all references, and removes public originals', async () => {
    await migration.onApplicationBootstrap();
    const owner = await db.user.findUniqueOrThrow({ where: { id: ownerId } });
    privateUrl = owner.passportUrl!;
    expect(privateUrl).toMatch(/^\/api\/v1\/media\/private\//);
    expect(owner.nationalIdFrontUrl).toBe(privateUrl);
    expect((await db.userDocument.findFirstOrThrow({ where: { tenantId } })).url).toBe(privateUrl);
    expect((await db.payment.findFirstOrThrow({ where: { tenantId } })).receiptUrls[0]).toMatch(/^\/api\/v1\/media\/private\//);
    expect((await db.booking.findUniqueOrThrow({ where: { id: bookingId } })).meta).toMatchObject({ doc_passport: expect.stringMatching(/^\/api\/v1\/media\/private\//) });
    for (const target of legacyFiles) await expect(fs.access(target)).rejects.toThrow();
    expect(await fs.readFile(privateFilePath(privateUrl.slice(PRIVATE_MEDIA_PREFIX.length)))).toEqual(content);
  });
  it('is safe to run again after a restart', async () => {
    await migration.onApplicationBootstrap();
    expect(await db.media.count({ where: { tenantId, isPrivate: true } })).toBe(3);
    expect((await db.user.findUniqueOrThrow({ where: { id: ownerId } })).passportUrl).toBe(privateUrl);
  });
  it('does not allow startup to finish when public original removal fails, and retries next time', async () => {
    const pendingId = randomUUID();
    await db.media.create({ data: { id: pendingId, tenantId, isPrivate: true, folder: 'receipts', url: PRIVATE_MEDIA_PREFIX + pendingId,
      legacyUrl: '/api/v1/uploads/receipts/already-removed-' + pendingId + '.pdf' } });
    const remove = jest.spyOn(media, 'deleteAccountObject').mockRejectedValueOnce(new Error('Storage unavailable'));
    await expect(migration.onApplicationBootstrap()).rejects.toThrow('Storage unavailable');
    remove.mockRestore();
    await expect(migration.onApplicationBootstrap()).resolves.toBeUndefined();
    expect((await db.media.findUniqueOrThrow({ where: { id: pendingId } })).legacyUrl).toBeNull();
  });
  it('blocks anonymous, invalid-token and other-customer downloads through HTTP', async () => {
    await request(app.getHttpServer()).get(privateUrl).expect(404);
    await request(app.getHttpServer()).get(privateUrl).set('Authorization', 'Bearer invalid').expect(404);
    await request(app.getHttpServer()).get(privateUrl).set('Authorization', 'Bearer ' + jwt.sign({ sub: otherId, tenantId, sid: otherSessionId })).expect(404);
  });
  it('returns raw bytes only to the owner with non-cacheable download headers', async () => {
    const result = await request(app.getHttpServer()).get(privateUrl).set('Authorization', 'Bearer ' + jwt.sign({ sub: ownerId, tenantId, sid: ownerSessionId })).expect(200);
    expect(result.headers['cache-control']).toContain('no-store');
    expect(result.headers['content-disposition']).toContain('attachment');
    expect(result.headers['content-type']).toContain('application/pdf');
    expect(result.body).toEqual(content);
  });
  it('rejects the owner’s existing token immediately after account deactivation', async () => {
    const token = jwt.sign({ sub: ownerId, tenantId, sid: ownerSessionId });
    await db.user.update({ where: { id: ownerId }, data: { isActive: false } });
    await request(app.getHttpServer()).get(privateUrl).set('Authorization', 'Bearer ' + token).expect(404);
    await db.user.update({ where: { id: ownerId }, data: { isActive: true } });
  });
  it('blocks old and hidden static URLs but preserves public images', async () => {
    await request(app.getHttpServer()).get(oldUrl).expect(404);
    await request(app.getHttpServer()).get('/api/v1/uploads/receipts/known.pdf').expect(404);
    await request(app.getHttpServer()).get('/api/v1/uploads/.private/' + privateUrl.slice(PRIVATE_MEDIA_PREFIX.length)).expect(404);
    const key = 'private-test-marketing-' + randomUUID() + '.png';
    const target = path.join(process.cwd(), 'uploads', key);
    await fs.writeFile(target, Buffer.from('public image'));
    legacyFiles.push(target);
    await request(app.getHttpServer()).get('/api/v1/uploads/' + key).expect(200);
  });
  it('removes linked and unattached private uploads when their account is permanently deleted', async () => {
    const upload = () => media.uploadPrivate({ originalname: 'private.pdf', mimetype: 'application/pdf', size: content.length, buffer: content } as Express.Multer.File,
      { tenantId, folder: 'user-documents', ownerId: otherId });
    const linked = await upload();
    const unattached = await upload();
    for (const file of [linked, unattached]) privateFiles.push(privateFilePath(file.url.slice(PRIVATE_MEDIA_PREFIX.length)));
    await db.userDocument.create({ data: { tenantId, userId: otherId, url: linked.url, filename: 'private.pdf' } });
    const worker = new MediaDeletionService(db as PrismaService, media);
    const deletion = new AccountDeletionService(db as PrismaService, media, worker);
    const result = await deletion.remove(otherId, tenantId);
    expect(result.pendingFileDeletions).toBe(0);
    expect(await db.media.count({ where: { tenantId, uploadedById: otherId } })).toBe(0);
    for (const file of [linked, unattached]) await expect(fs.access(privateFilePath(file.url.slice(PRIVATE_MEDIA_PREFIX.length)))).rejects.toThrow();
    expect(await db.user.findUnique({ where: { id: ownerId } })).not.toBeNull();
  });
});
