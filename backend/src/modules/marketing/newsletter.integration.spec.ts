import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import * as request from 'supertest';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '../../config/config.service';
import { NotificationsService } from '../notifications/notifications.service';

const url = process.env.PRIVATE_MEDIA_TEST_DATABASE_URL;
const databaseTests = url ? describe : describe.skip;
databaseTests('newsletter consent against PostgreSQL and HTTP', () => {
  let db: PrismaClient;
  let app: INestApplication;
  let service: NewsletterService;
  let tenantId: string;
  let configured = true;
  const sendRawHtmlEmail = jest.fn();
  beforeAll(async () => {
    if (!url || new URL(url).hostname !== '127.0.0.1' || new URL(url).pathname !== '/flyngo_private_media_test') throw new Error('Use the disposable private-media test database only');
    db = new PrismaClient({ datasourceUrl: url });
    tenantId = (await db.tenant.create({ data: { name: 'Newsletter integration', slug: randomUUID() } })).id;
    const module = await Test.createTestingModule({ controllers: [NewsletterController], providers: [NewsletterService,
      { provide: PrismaService, useValue: db }, { provide: ConfigService, useValue: { getOrNull: () => 'https://flyngo.test' } },
      { provide: NotificationsService, useValue: { getDeliveryStatus: () => ({ email: { configured } }), sendRawHtmlEmail } },
    ] }).compile();
    service = module.get(NewsletterService);
    app = module.createNestApplication();
    app.use((req: any, _res: any, next: () => void) => { req.tenantId = tenantId; next(); });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, transformOptions: { enableImplicitConversion: true } }));
    await app.init();
  });
  beforeEach(async () => { configured = true; sendRawHtmlEmail.mockReset().mockResolvedValue({ sent: true, provider: 'smtp' }); await db.newsletterSubscription.deleteMany({ where: { tenantId } }); });
  afterAll(async () => { await app?.close(); if (db) { await db.newsletterSubscription.deleteMany({ where: { tenantId } }); await db.tenant.delete({ where: { id: tenantId } }); await db.$disconnect(); } });
  const subscribe = (body: any) => request(app.getHttpServer()).post('/newsletter/subscribe').send(body);
  function tokens() {
    const html = sendRawHtmlEmail.mock.calls[0][2] as string;
    return { confirmation: /confirm#token=([a-f0-9]{64})/.exec(html)![1], unsubscribe: /unsubscribe#token=([a-f0-9]{64})/.exec(html)![1] };
  }

  it('requires consent and a valid email before persisting anything', async () => {
    await subscribe({ email: 'customer@example.invalid' }).expect(400);
    await subscribe({ email: 'customer@example.invalid', consent: 'false' }).expect(400);
    await subscribe({ email: 'invalid', consent: true }).expect(400);
    expect(await db.newsletterSubscription.count({ where: { tenantId } })).toBe(0);
    expect(sendRawHtmlEmail).not.toHaveBeenCalled();
  });
  it('persists pending consent, confirms once, lists only confirmed members and unsubscribes', async () => {
    const response = await subscribe({ email: 'Customer@Example.invalid', consent: true }).expect(201);
    expect(response.body).toMatchObject({ accepted: true });
    expect(JSON.stringify(response.body)).not.toContain('token');
    const token = tokens();
    const saved = await db.newsletterSubscription.findFirstOrThrow({ where: { tenantId } });
    expect(saved).toMatchObject({ email: 'customer@example.invalid', status: 'pending', consentVersion: 'newsletter-v1' });
    expect(saved.confirmationHash).not.toBe(token.confirmation);
    expect((await service.listConfirmed(tenantId)).items).toHaveLength(0);
    await expect(service.confirm(randomUUID(), token.confirmation)).rejects.toThrow('invalid or expired');
    await request(app.getHttpServer()).post('/newsletter/confirm').send({ token: token.confirmation }).expect(201);
    await request(app.getHttpServer()).post('/newsletter/confirm').send({ token: token.confirmation }).expect(400);
    expect((await service.listConfirmed(tenantId)).items).toEqual([expect.objectContaining({ email: saved.email })]);
    await subscribe({ email: saved.email, consent: true }).expect(201);
    expect(sendRawHtmlEmail).toHaveBeenCalledTimes(1);
    await request(app.getHttpServer()).post('/newsletter/unsubscribe').send({ token: token.unsubscribe }).expect(201);
    await request(app.getHttpServer()).post('/newsletter/unsubscribe').send({ token: token.unsubscribe }).expect(201);
    expect((await service.listConfirmed(tenantId)).items).toHaveLength(0);
  });
  it('rejects expired confirmations and suppresses duplicate pending emails', async () => {
    await subscribe({ email: 'pending@example.invalid', consent: true }).expect(201);
    const token = tokens();
    await subscribe({ email: 'pending@example.invalid', consent: true }).expect(201);
    expect(sendRawHtmlEmail).toHaveBeenCalledTimes(1);
    await db.newsletterSubscription.updateMany({ where: { tenantId }, data: { confirmationExpiresAt: new Date(0) } });
    await request(app.getHttpServer()).post('/newsletter/confirm').send({ token: token.confirmation }).expect(400);
    expect((await service.listConfirmed(tenantId)).items).toHaveLength(0);
  });
  it('fails explicitly without delivery and allows retry after a provider failure', async () => {
    configured = false;
    await subscribe({ email: 'retry@example.invalid', consent: true }).expect(503);
    expect(await db.newsletterSubscription.count({ where: { tenantId } })).toBe(0);
    configured = true;
    sendRawHtmlEmail.mockRejectedValueOnce(new Error('Provider rejected'));
    await subscribe({ email: 'retry@example.invalid', consent: true }).expect(503);
    expect(await db.newsletterSubscription.findFirst({ where: { tenantId } })).toMatchObject({ confirmationHash: null, lastRequestedAt: null });
    await subscribe({ email: 'retry@example.invalid', consent: true }).expect(201);
    expect(sendRawHtmlEmail).toHaveBeenCalledTimes(2);
  });
});
