// Isolated release fixtures. Never use the normal production seed or reset data.
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

async function main() {
  const value = process.env.RELEASE_TEST_DATABASE_BASE_URL;
  if (!value) throw new Error('RELEASE_TEST_DATABASE_BASE_URL is required');
  const base = new URL(value);
  if (base.hostname !== '127.0.0.1' || base.pathname !== '/postgres') {
    throw new Error('Release fixtures require the explicit localhost postgres maintenance database');
  }
  const browserOnly = process.argv.includes('--browser-only');
  const names = browserOnly ? ['flyngo_browser_test'] : [
    'flyngo_sessions_test', 'flyngo_private_media_test', 'flyngo_account_deletion_test',
  ];
  const admin = new PrismaClient({ datasourceUrl: base.toString() });
  try {
    for (const name of names) {
      const rows = await admin.$queryRaw`SELECT datname FROM pg_database WHERE datname = ${name}`;
      if (!rows.length) await admin.$executeRawUnsafe(`CREATE DATABASE "${name}"`);
      const url = new URL(base);
      url.pathname = `/${name}`;
      url.search = '?schema=public';
      const cli = path.join(path.dirname(require.resolve('prisma/package.json')), 'build/index.js');
      const result = spawnSync(process.execPath, [cli, 'migrate', 'deploy'], {
        cwd: process.cwd(), env: { ...process.env, DATABASE_URL: url.toString() }, stdio: 'inherit',
      });
      if (result.status !== 0) throw new Error(`Migration failed for ${name}`);
      const drift = spawnSync(process.execPath, [cli, 'migrate', 'diff', '--from-url', url.toString(),
        '--to-schema-datamodel', 'prisma/schema.prisma', '--exit-code'], { stdio: 'inherit' });
      if (drift.status !== 0) throw new Error(`Migrated schema differs from Prisma for ${name}`);
      if (browserOnly) await seedBrowser(url.toString());
    }
  } finally { await admin.$disconnect(); }
}

async function seedBrowser(url) {
  const db = new PrismaClient({ datasourceUrl: url });
  try {
    const tenantId = '00000000-0000-0000-0000-000000000001';
    await db.tenant.upsert({ where: { id: tenantId }, update: {},
      create: { id: tenantId, name: 'Release test tenant', slug: 'release-tests' } });
    const adminRole = await db.role.upsert({ where: { tenantId_code: { tenantId, code: 'super_admin' } }, update: {},
      create: { tenantId, code: 'super_admin', name: 'Test Admin' } });
    await db.role.upsert({ where: { tenantId_code: { tenantId, code: 'customer' } }, update: {},
      create: { tenantId, code: 'customer', name: 'Customer' } });
    const passwordHash = await hash('Release-test-only-123!', 4);
    const adminUser = await db.user.findFirst({ where: { tenantId, email: 'admin@release.invalid' } });
    if (!adminUser) await db.user.create({ data: { tenantId, roleId: adminRole.id,
      email: 'admin@release.invalid', fullName: 'Release Test Admin', passwordHash } });
    const layoutRole = await db.role.upsert({ where: { tenantId_code: { tenantId, code: 'layout_test' } }, update: {},
      create: { tenantId, code: 'layout_test', name: 'Regional Corporate Travel Operations Supervisor' } });
    const layoutEmail = 'responsive.layout.long.customer.account@example.invalid';
    if (!await db.user.findFirst({ where: { tenantId, email: layoutEmail } })) {
      await db.user.create({ data: { tenantId, roleId: layoutRole.id, email: layoutEmail,
        fullName: 'Customer with a very long name for corporate travel account management',
        phone: '+880 1700000456', phoneKey: '1700000456', passwordHash, creationSource: 'system',
        nationalId: 'TEST-NID-12345678901234567890', passportNumber: 'TEST-PASSPORT-123456789012345' } });
    }
    const destination = await db.destination.upsert({ where: { tenantId_slug: { tenantId, slug: 'release-destination' } }, update: {},
      create: { tenantId, name: 'Release Test Destination', slug: 'release-destination', country: 'Bangladesh', isFeatured: true } });
    await db.tour.upsert({ where: { tenantId_slug: { tenantId, slug: 'release-test-tour' } }, update: {},
      create: { tenantId, destinationId: destination.id, title: 'Release Test Tour', slug: 'release-test-tour',
        description: 'Deterministic browser test package', price: 1000, currency: 'BDT', duration: 2, maxGuests: 10, isActive: true } });
    await db.bankAccount.upsert({ where: { id: 'release-test-bank' }, update: {}, create: {
      id: 'release-test-bank', tenantId, bankName: 'Test Bank', accountName: 'Release Test Tenant', accountNumber: 'TEST-ONLY',
    } });
    console.log('Browser fixtures ready (disposable database only)');
  } finally { await db.$disconnect(); }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
