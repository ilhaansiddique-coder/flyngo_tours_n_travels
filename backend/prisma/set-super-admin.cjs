#!/usr/bin/env node
/*
 * Idempotent super-admin setup — safe to run against any Flyngo database.
 *
 *   docker exec -it flyngo-backend node prisma/set-super-admin.cjs
 *
 * Ensures a super_admin user exists with the agreed credentials and resets its
 * password. Credentials are overridable via env:
 *   SUPER_ADMIN_EMAIL     (default: admin@flyngo.com)
 *   SUPER_ADMIN_PASSWORD  (REQUIRED — no default, never printed)
 *
 * Requires the tenant + super_admin role to already exist (created by the seed
 * on first boot). Prints what it did; never deletes anything; never echoes the
 * password.
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.SUPER_ADMIN_EMAIL || 'admin@flyngo.com').toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD;
  if (!password || password.length < 12) {
    throw new Error(
      'SUPER_ADMIN_PASSWORD must be set and at least 12 characters long. ' +
        'Refusing to use a weak or default password.',
    );
  }
  const passwordHash = await bcrypt.hash(password, 12);

  const tenant = await prisma.tenant.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!tenant) throw new Error('No tenant found — let the app seed once (first boot) before running this.');

  const role = await prisma.role.findFirst({ where: { tenantId: tenant.id, code: 'super_admin' } });
  if (!role) throw new Error('No super_admin role for the tenant — let the app seed once first.');

  const existing = await prisma.user.findFirst({ where: { email, tenantId: tenant.id } });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash, roleId: role.id, isActive: true, deletedAt: null, emailVerifiedAt: existing.emailVerifiedAt ?? new Date() },
    });
    console.log(`✅ Updated existing super admin: ${email} (password reset, role=super_admin, active).`);
  } else {
    // Unique referral code for the new user.
    let referralCode = '';
    for (let i = 0; i < 10; i++) {
      const candidate = 'ADM' + Math.random().toString(36).slice(2, 8).toUpperCase();
      const clash = await prisma.user.findFirst({ where: { referralCode: candidate } });
      if (!clash) { referralCode = candidate; break; }
    }
    await prisma.user.create({
      data: {
        email,
        fullName: 'Super Admin',
        passwordHash,
        tenantId: tenant.id,
        roleId: role.id,
        emailVerifiedAt: new Date(),
        referralCode: referralCode || undefined,
      },
    });
    console.log(`✅ Created super admin: ${email} (role=super_admin).`);
  }
  console.log(`✅ Super admin ready: ${email} (role=super_admin). Password set from environment; never printed.`);
}

main()
  .catch((e) => { console.error('❌ set-super-admin failed:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
