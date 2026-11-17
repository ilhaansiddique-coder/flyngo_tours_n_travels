import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { randomUUID, createHash } from 'crypto';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionService, sessionTokenHash } from './session.service';
import { GoogleOAuthGuard } from './guards/oauth.guards';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '../../config/config.service';
import { ReferralService } from '../referral/referral.service';
import { TrackingService } from '../tracking/tracking.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AccountDeletionService } from '../users/account-deletion.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';

@Controller('session-probe')
class SessionProbeController {
  @Get() probe(@CurrentUser() user: { id: string }) { return { id: user.id }; }
}

const databaseUrl = process.env.SESSION_TEST_DATABASE_URL;
const databaseTests = databaseUrl ? describe : describe.skip;
databaseTests('server sessions against PostgreSQL and HTTP', () => {
  let db: PrismaClient;
  let app: INestApplication;
  let sessions: SessionService;
  let tenantId: string;
  let userId: string;
  let otherId: string;
  let roleId: string;
  let hash: string;
  const origin = 'https://www.flyngo.test';
  const password = 'Password123!';
  const email = 'sessions@example.invalid';
  const config: any = {
    isProduction: true,
    get: (key: string, fallback?: string) => ({ FRONTEND_URL: origin, ADMIN_URL: origin,
      JWT_ACCESS_SECRET: 'integration-access-secret-not-production', JWT_REFRESH_EXPIRY: '24h', JWT_ACCESS_EXPIRY: '24h' }[key] || fallback || ''),
    getOrNull: () => null, getBoolean: () => false,
  };
  const jwt = new JwtService({ secret: config.get('JWT_ACCESS_SECRET') });
  const cookieName = '__Host-flyngo-refresh';
  const secretFrom = (res: request.Response) => {
    const cookies = res.headers['set-cookie'] as unknown as string[];
    const cookie = cookies?.find((value) => value.startsWith(cookieName + '=') && !value.startsWith(cookieName + '=;'));
    if (!cookie) throw new Error('Missing refresh cookie');
    return cookie.split(';')[0].slice(cookieName.length + 1);
  };
  const trusted = (req: request.Test) => req.set('Origin', origin).set('X-Requested-With', 'Flyngo');
  const cookie = (value: string) => cookieName + '=' + value;
  const body = (res: request.Response) => res.body.data ?? res.body;
  const probe = (access: string) => request(app.getHttpServer()).get('/api/v1/session-probe').set('Authorization', 'Bearer ' + access);
  async function login() {
    const res = await trusted(request(app.getHttpServer()).post('/api/v1/auth/login')).send({ email, password }).expect(200);
    return { access: body(res).accessToken as string, refresh: secretFrom(res), response: res, sid: (jwt.decode(body(res).accessToken) as any).sid as string };
  }
  const refresh = (token: string) => trusted(request(app.getHttpServer()).post('/api/v1/auth/refresh')).set('Cookie', cookie(token));

  beforeAll(async () => {
    if (!databaseUrl || new URL(databaseUrl).hostname !== '127.0.0.1' || new URL(databaseUrl).pathname !== '/flyngo_sessions_test') throw new Error('Use the disposable localhost flyngo_sessions_test database only');
    db = new PrismaClient({ datasourceUrl: databaseUrl });
    tenantId = (await db.tenant.create({ data: { name: 'Session integration', slug: randomUUID() } })).id;
    roleId = (await db.role.create({ data: { tenantId, code: 'customer', name: 'Customer' } })).id;
    hash = await bcrypt.hash(password, 4);
    userId = (await db.user.create({ data: { tenantId, roleId, email, fullName: 'Session test', passwordHash: hash } })).id;
    otherId = (await db.user.create({ data: { tenantId, roleId, fullName: 'Other session user' } })).id;
    const module = await Test.createTestingModule({ controllers: [AuthController, SessionProbeController], providers: [AuthService, SessionService,
      { provide: PrismaService, useValue: db }, { provide: ConfigService, useValue: config }, { provide: JwtService, useValue: jwt },
      { provide: ReferralService, useValue: { onUserVerified: jest.fn(), prepareRegistration: async () => ({ referralCode: randomUUID() }), finalizeRegistration: jest.fn(), awardSignupBonus: jest.fn() } },
      { provide: TrackingService, useValue: { emitServerEvent: jest.fn() } },
      { provide: NotificationsService, useValue: { sendEmail: jest.fn(), sendSms: jest.fn() } },
      { provide: AccountDeletionService, useValue: {} },
    ] }).overrideGuard(GoogleOAuthGuard).useValue({ canActivate: (context: any) => {
      context.switchToHttp().getRequest().user = { email, fullName: 'Session test', provider: 'google', providerId: 'test-google' }; return true;
    } }).compile();
    sessions = module.get(SessionService);
    app = module.createNestApplication();
    app.use(cookieParser());
    app.use((req: any, _res: any, next: () => void) => { req.tenantId = tenantId; next(); });
    app.useGlobalGuards(new JwtAuthGuard(jwt, new Reflector(), config, db as PrismaService));
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.setGlobalPrefix('api/v1');
    await app.init();
  });
  beforeEach(async () => { await db.user.update({ where: { id: userId }, data: { passwordHash: hash, isActive: true, deletedAt: null, mustChangePassword: false, tempPasswordExpiresAt: null } }); });
  afterEach(async () => { await db.authSession.deleteMany({ where: { tenantId } }); });
  afterAll(async () => {
    if (app) await app.close();
    if (db && tenantId) {
      await db.user.deleteMany({ where: { tenantId } });
      await db.role.deleteMany({ where: { tenantId } });
      await db.tenant.delete({ where: { id: tenantId } });
    }
    if (db) await db.$disconnect();
  });

  it('uses Secure HttpOnly host cookies and never returns refresh credentials in JSON', async () => {
    const result = await login();
    const header = (result.response.headers['set-cookie'] as unknown as string[]).find((value) => value.startsWith(cookieName + '='))!;
    expect(header).toContain('HttpOnly'); expect(header).toContain('Secure'); expect(header).toContain('SameSite=Lax'); expect(header).toContain('Path=/');
    expect(header).not.toContain('Domain=');
    expect(body(result.response)).not.toHaveProperty('refreshToken');
    expect(JSON.stringify(result.response.body)).not.toContain(result.refresh);
    expect(result.refresh).toMatch(/^[a-f0-9]{64}$/);
    const stored = await db.sessionRefreshToken.findUniqueOrThrow({ where: { tokenHash: sessionTokenHash(result.refresh) } });
    expect(JSON.stringify(stored)).not.toContain(result.refresh);
    const claims = jwt.decode(result.access) as any;
    expect(claims.exp - claims.iat).toBeLessThanOrEqual(900);
    await probe(result.access).expect(200);
  });
  it('rotates the cookie once and preserves the session family and absolute expiry', async () => {
    const first = await login();
    const res = await refresh(first.refresh).expect(200);
    const second = secretFrom(res);
    expect(second).not.toBe(first.refresh);
    expect((jwt.decode(body(res).accessToken) as any).sid).toBe(first.sid);
    expect(body(res)).not.toHaveProperty('refreshToken');
    expect((await db.sessionRefreshToken.findUniqueOrThrow({ where: { tokenHash: sessionTokenHash(first.refresh) } })).usedAt).not.toBeNull();
    expect(res.headers['cache-control']).toContain('no-store');
  });
  it('detects reuse and revokes the entire family, including issued access tokens', async () => {
    const first = await login();
    const second = await refresh(first.refresh).expect(200);
    await refresh(first.refresh).expect(401);
    await refresh(secretFrom(second)).expect(401);
    await probe(first.access).expect(401);
    await probe(body(second).accessToken).expect(401);
  });
  it('serializes concurrent uses of one refresh token and fails closed on reuse', async () => {
    const first = await login();
    const results = await Promise.all([refresh(first.refresh), refresh(first.refresh)]);
    expect(results.map((res) => res.status).sort()).toEqual([200, 401]);
    expect((await db.authSession.findUniqueOrThrow({ where: { id: first.sid } })).revokedAt).not.toBeNull();
  });
  it('does not revoke a valid family when an unrelated forged token is presented', async () => {
    const first = await login();
    await refresh('a'.repeat(64)).expect(401);
    await probe(first.access).expect(200);
  });
  it('does not accept refresh credentials from the request body', async () => {
    const first = await login();
    await trusted(request(app.getHttpServer()).post('/api/v1/auth/refresh')).send({ refreshToken: first.refresh }).expect(401);
    await probe(first.access).expect(200);
  });
  it('revokes the current session on logout and clears the cookie', async () => {
    const first = await login();
    const res = await trusted(request(app.getHttpServer()).post('/api/v1/auth/logout')).set('Cookie', cookie(first.refresh)).expect(200);
    expect((res.headers['set-cookie'] as unknown as string[]).some((value) => value.startsWith(cookieName + '=;'))).toBe(true);
    await probe(first.access).expect(401);
    await refresh(first.refresh).expect(401);
    await trusted(request(app.getHttpServer()).post('/api/v1/auth/logout')).set('Cookie', cookie(first.refresh)).expect(200);
  });
  it('revokes the access-token session on logout even if the browser has lost its refresh cookie', async () => {
    const first = await login();
    await trusted(request(app.getHttpServer()).post('/api/v1/auth/logout')).set('Authorization', 'Bearer ' + first.access).expect(200);
    await probe(first.access).expect(401);
    await refresh(first.refresh).expect(401);
  });
  it('signs out all sessions for one user without affecting another user', async () => {
    const first = await login(); const second = await login(); const other = await sessions.create(otherId, tenantId);
    await trusted(request(app.getHttpServer()).post('/api/v1/auth/logout-all')).set('Cookie', cookie(first.refresh)).set('Authorization', 'Bearer ' + first.access).expect(200);
    await probe(first.access).expect(401); await probe(second.access).expect(401);
    await refresh(second.refresh).expect(401); await probe(other.accessToken).expect(200);
  });
  it.each([
    { origin: 'https://evil.example', header: 'Flyngo' },
    { origin: 'https://evil.flyngo.test', header: 'Flyngo' },
    { origin, header: '' }, { origin: '', header: 'Flyngo' },
  ])('rejects cross-site/missing-origin session mutations: %j', async (headers) => {
    const first = await login();
    await request(app.getHttpServer()).post('/api/v1/auth/logout').set('Origin', headers.origin).set('X-Requested-With', headers.header).set('Cookie', cookie(first.refresh)).expect(403);
    await probe(first.access).expect(200);
  });
  it('rejects expired sessions even while an access JWT has time remaining', async () => {
    const first = await login();
    await db.authSession.update({ where: { id: first.sid }, data: { expiresAt: new Date(0) } });
    await probe(first.access).expect(401); await refresh(first.refresh).expect(401);
  });
  it('permanently revokes sessions on deactivation, including after reactivation', async () => {
    const first = await login();
    const users = new UsersService(db as PrismaService, {} as any, {} as any, {} as any);
    await users.updateUser(userId, tenantId, { isActive: false });
    await probe(first.access).expect(401); await refresh(first.refresh).expect(401);
    await users.updateUser(userId, tenantId, { isActive: true });
    await probe(first.access).expect(401); await refresh(first.refresh).expect(401);
  });
  it('revokes old sessions when an administrator changes the password', async () => {
    const first = await login();
    const users = new UsersService(db as PrismaService, {} as any, {} as any, {} as any);
    await users.updateUser(userId, tenantId, { password: 'DifferentPassword123!' });
    await probe(first.access).expect(401); await refresh(first.refresh).expect(401);
  });
  it('revokes old sessions when a reset link is consumed', async () => {
    const first = await login();
    const token = randomUUID();
    await db.passwordReset.create({ data: { tenantId, userId, tokenHash: createHash('sha256').update(token).digest('hex'), channel: 'email', expiresAt: new Date(Date.now() + 60000) } });
    await request(app.getHttpServer()).post('/api/v1/auth/reset-password').send({ token, password: 'DifferentPassword123!' }).expect(200);
    await probe(first.access).expect(401); await refresh(first.refresh).expect(401);
  });
  it('refreshes passwordless OAuth accounts using the same session policy', async () => {
    const result = await sessions.create(otherId, tenantId);
    await refresh(result.refreshToken).expect(200);
  });
  it('redirects OAuth without access or refresh tokens in the URL', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/auth/google/callback').expect(302);
    expect(res.headers.location).toBe(origin + '/auth/callback?provider=google');
    expect(res.headers.location).not.toContain('Token');
    await refresh(secretFrom(res)).expect(200);
  });
  it('rejects old stateless access and refresh JWTs after deployment', async () => {
    const old = jwt.sign({ sub: userId, tenantId });
    await probe(old).expect(401); await refresh(old).expect(401);
  });
  it('returns registration and temporary-password sessions only through HttpOnly cookies', async () => {
    const registration = await trusted(request(app.getHttpServer()).post('/api/v1/auth/register')).send({
      fullName: 'Registered customer', phone: '+8801712345678', password, email: 'registered@example.invalid',
    }).expect(201);
    expect(body(registration)).not.toHaveProperty('refreshToken');
    expect(secretFrom(registration)).toHaveLength(64);
    await db.user.update({ where: { id: userId }, data: { mustChangePassword: true } });
    const challenge = await trusted(request(app.getHttpServer()).post('/api/v1/auth/login')).send({ email, password }).expect(200);
    expect(body(challenge)).toHaveProperty('changePasswordToken');
    expect(body(challenge)).not.toHaveProperty('accessToken');
    const completed = await trusted(request(app.getHttpServer()).post('/api/v1/auth/change-password')).send({
      changePasswordToken: body(challenge).changePasswordToken, currentPassword: password, newPassword: 'ChangedPassword123!',
    }).expect(200);
    expect(body(completed)).not.toHaveProperty('refreshToken');
    expect(secretFrom(completed)).toHaveLength(64);
    await probe(body(completed).accessToken).expect(200);
  });
  it('replaces the old browser session when logging in again', async () => {
    const first = await login();
    const second = await trusted(request(app.getHttpServer()).post('/api/v1/auth/login')).set('Cookie', cookie(first.refresh)).send({ email, password }).expect(200);
    await probe(first.access).expect(401);
    await probe(body(second).accessToken).expect(200);
  });
  it('rejects refresh under another tenant without consuming the valid token', async () => {
    const first = await login();
    await expect(sessions.rotate(first.refresh, randomUUID())).rejects.toThrow();
    await refresh(first.refresh).expect(200);
  });
  it('cascades session and token history removal when an account is deleted', async () => {
    const temporary = await db.user.create({ data: { tenantId, roleId, fullName: 'Delete session fixture' } });
    const issued = await sessions.create(temporary.id, tenantId);
    const sid = (jwt.decode(issued.accessToken) as any).sid;
    await db.user.delete({ where: { id: temporary.id } });
    expect(await db.authSession.count({ where: { id: sid } })).toBe(0);
    expect(await db.sessionRefreshToken.count({ where: { sessionId: sid } })).toBe(0);
    await probe(issued.accessToken).expect(401);
    await refresh(issued.refreshToken).expect(401);
  });
  it('restores anonymous pages without an expected 401 console error', async () => {
    const res = await trusted(request(app.getHttpServer()).post('/api/v1/auth/session')).expect(200);
    expect(body(res)).toEqual({ authenticated: false });
    expect(res.headers['cache-control']).toContain('no-store');
  });
  it('restores and rotates an authenticated page reload using only its cookie', async () => {
    const first = await login();
    const res = await trusted(request(app.getHttpServer()).post('/api/v1/auth/session')).set('Cookie', cookie(first.refresh)).expect(200);
    expect(body(res)).toHaveProperty('accessToken');
    expect(secretFrom(res)).not.toBe(first.refresh);
    expect(body(res)).not.toHaveProperty('refreshToken');
  });
  it('does not mint a session from a password proof that became stale during a password change', async () => {
    await db.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash('UpdatedPassword123!', 4) } });
    await expect(sessions.create(userId, tenantId, hash)).rejects.toThrow();
    expect(await db.authSession.count({ where: { tenantId, userId } })).toBe(0);
  });
});
