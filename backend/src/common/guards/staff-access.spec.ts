import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { PermissionsGuard } from './permissions.guard';
import { TenantGuard } from './tenant.guard';
import { ConfigService } from '../../config/config.service';
import { PrismaService } from '../../database/prisma.service';
import { UsersController } from '../../modules/users/users.controller';
import { UsersService } from '../../modules/users/users.service';
import { ToursController } from '../../modules/tours/tours.controller';
import { ToursService } from '../../modules/tours/tours.service';
import { CmsController } from '../../modules/cms/cms.controller';
import { CmsService } from '../../modules/cms/cms.service';
import { AdminController } from '../../modules/admin/admin.controller';
import { AdminService } from '../../modules/admin/admin.service';
import { ResponseInterceptor } from '../interceptors/response.interceptor';

// Exercise real HTTP routing and the production guard chain, with signed test
// tokens and isolated data fixtures. No development database is read or changed.
describe('staff access over HTTP', () => {
  let app: INestApplication;
  const jwt = new JwtService({ secret: 'staff-access-test-secret' });
  const managerPermissions = ['tours', 'hotels', 'flights', 'visa', 'bookings', 'cms', 'marketing']
    .flatMap((group) => ['read', 'create', 'update', 'delete'].map((action) => `${group}.${action}`));
  const actors: Record<string, { roleCode: string; permissions: string[] }> = {
    manager: { roleCode: 'manager', permissions: managerPermissions },
    reader: { roleCode: 'custom_staff', permissions: ['cms.read', 'tours.read'] },
    author: { roleCode: 'custom_staff', permissions: ['tours.create'] },
    analyst: { roleCode: 'analyst', permissions: ['analytics.read'] },
    customer: { roleCode: 'customer', permissions: ['tours.create', 'cms.read', 'analytics.read'] },
    admin: { roleCode: 'admin', permissions: [] },
    super_admin: { roleCode: 'super_admin', permissions: [] },
  };
  const users = { listUsers: jest.fn().mockResolvedValue({ items: [], meta: { total: 0 } }), createUser: jest.fn() };
  const tours = { create: jest.fn().mockResolvedValue({ id: 'new-tour' }), update: jest.fn(), remove: jest.fn() };
  const cms = { listPages: jest.fn().mockResolvedValue({ items: [] }), createPage: jest.fn().mockResolvedValue({ id: 'page' }) };
  const admin = { getRoles: jest.fn().mockResolvedValue([]), createRole: jest.fn().mockResolvedValue({ id: 'role' }),
    getDashboardStats: jest.fn().mockResolvedValue({ totalBookings: 0 }) };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [UsersController, ToursController, CmsController, AdminController],
      providers: [
        { provide: UsersService, useValue: users }, { provide: ToursService, useValue: tours },
        { provide: CmsService, useValue: cms }, { provide: AdminService, useValue: admin },
      ],
    }).compile();
    app = module.createNestApplication();
    const config = { get: () => 'staff-access-test-secret', isMultiTenant: false } as unknown as ConfigService;
    const db = {
      authSession: { findFirst: jest.fn().mockResolvedValue({ id: 'session' }) },
      user: { findUnique: jest.fn(async ({ where }: { where: { id: string } }) => {
        const actor = actors[where.id];
        if (!actor) return null;
        return { id: where.id, tenantId: '00000000-0000-0000-0000-000000000001', isActive: true,
          role: { code: actor.roleCode, permissions: actor.permissions.map((code) => ({ permission: { code } })) } };
      }) },
    } as unknown as PrismaService;
    const reflector = new Reflector();
    app.useGlobalGuards(new JwtAuthGuard(jwt, reflector, config, db), new RolesGuard(reflector),
      new PermissionsGuard(reflector), new TenantGuard(config));
    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();
  });
  beforeEach(() => jest.clearAllMocks());
  afterAll(async () => { if (app) await app.close(); });
  const token = (id: string) => jwt.sign({ sub: id, sid: 'session' });

  it('loads the manager customer list with customer-only scope', async () => {
    await request(app.getHttpServer()).get('/users?page=1').auth(token('manager'), { type: 'bearer' }).expect(200);
    expect(users.listUsers).toHaveBeenCalledWith(expect.any(String), '1', undefined, undefined, true);
  });
  it('allows manager CMS reads and writes using saved permissions', async () => {
    await request(app.getHttpServer()).get('/cms/pages').auth(token('manager'), { type: 'bearer' }).expect(200);
    await request(app.getHttpServer()).post('/cms/pages').auth(token('manager'), { type: 'bearer' }).send({ title: 'Page' }).expect(201);
    await request(app.getHttpServer()).post('/tours').auth(token('manager'), { type: 'bearer' }).send({ title: 'Tour' }).expect(201);
    expect(tours.create).toHaveBeenCalledWith(expect.any(String), { title: 'Tour' });
  });
  it('keeps read-only custom staff from creating CMS pages', async () => {
    await request(app.getHttpServer()).get('/cms/pages').auth(token('reader'), { type: 'bearer' }).expect(200);
    await request(app.getHttpServer()).post('/cms/pages').auth(token('reader'), { type: 'bearer' }).send({}).expect(403);
    expect(cms.createPage).not.toHaveBeenCalled();
  });
  it('does not treat a create permission as update or delete permission', async () => {
    await request(app.getHttpServer()).post('/tours').auth(token('author'), { type: 'bearer' }).send({}).expect(201);
    await request(app.getHttpServer()).patch('/tours/123').auth(token('author'), { type: 'bearer' }).send({}).expect(403);
    await request(app.getHttpServer()).delete('/tours/123').auth(token('author'), { type: 'bearer' }).expect(403);
    expect(tours.update).not.toHaveBeenCalled();
    expect(tours.remove).not.toHaveBeenCalled();
  });
  it('reads current permissions rather than preserving revoked access in the token', async () => {
    const bearer = token('reader');
    const saved = actors.reader.permissions;
    try {
      actors.reader.permissions = [];
      await request(app.getHttpServer()).get('/cms/pages').auth(bearer, { type: 'bearer' }).expect(403);
      expect(cms.listPages).not.toHaveBeenCalled();
    } finally { actors.reader.permissions = saved; }
  });
  it('rejects customer accounts even with mistakenly assigned staff permissions', async () => {
    await request(app.getHttpServer()).get('/users').auth(token('customer'), { type: 'bearer' }).expect(403);
    await request(app.getHttpServer()).get('/cms/pages').auth(token('customer'), { type: 'bearer' }).expect(403);
    await request(app.getHttpServer()).post('/tours').auth(token('customer'), { type: 'bearer' }).send({}).expect(403);
    await request(app.getHttpServer()).get('/admin/dashboard').auth(token('customer'), { type: 'bearer' }).expect(403);
  });
  it('requires analytics.read for staff dashboard statistics', async () => {
    await request(app.getHttpServer()).get('/admin/dashboard').auth(token('manager'), { type: 'bearer' }).expect(403);
    await request(app.getHttpServer()).get('/admin/dashboard').auth(token('analyst'), { type: 'bearer' }).expect(200);
  });
  it('preserves manager restrictions on account and role administration', async () => {
    await request(app.getHttpServer()).post('/users').auth(token('manager'), { type: 'bearer' }).send({}).expect(403);
    await request(app.getHttpServer()).get('/admin/roles').auth(token('manager'), { type: 'bearer' }).expect(403);
    await request(app.getHttpServer()).post('/admin/roles').auth(token('manager'), { type: 'bearer' }).send({}).expect(403);
    expect(users.createUser).not.toHaveBeenCalled();
    expect(admin.createRole).not.toHaveBeenCalled();
  });
  it.each(['admin', 'super_admin'])('preserves %s access without new permission requirements', async (role) => {
    await request(app.getHttpServer()).get('/admin/roles').auth(token(role), { type: 'bearer' }).expect(200);
    await request(app.getHttpServer()).post('/tours').auth(token(role), { type: 'bearer' }).send({}).expect(201);
  });
  it('keeps role mutation exclusive to super admins', async () => {
    await request(app.getHttpServer()).post('/admin/roles').auth(token('admin'), { type: 'bearer' }).send({}).expect(403);
    await request(app.getHttpServer()).post('/admin/roles').auth(token('super_admin'), { type: 'bearer' }).send({}).expect(201);
  });
  it('rejects unauthenticated requests before calling services', async () => {
    await request(app.getHttpServer()).get('/users').expect(401);
    await request(app.getHttpServer()).get('/cms/pages').expect(401);
    expect(users.listUsers).not.toHaveBeenCalled();
    expect(cms.listPages).not.toHaveBeenCalled();
  });
});
