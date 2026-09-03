/**
 * Backfill: provision accounts for existing guest bookings that were created
 * before the auto-provisioning feature was deployed.
 *
 * Usage:  npx ts-node scripts/backfill-guest-accounts.ts
 *
 * For every booking that has customerPhone but no linked user (or a user with
 * null passwordHash and provisional status), this script calls
 * resolveBookingAccount to create / upgrade the account with the well-known
 * temp password (12345678).
 */

import { PrismaClient } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

const GUEST_TEMP_PASSWORD = '12345678';

/** Last-10-digits phone key, same rule as phone.util.ts */
function phoneKey(raw?: string | null): string | null {
  const digits = String(raw ?? '').replace(/\D/g, '');
  return digits.length >= 9 ? digits.slice(-10) : null;
}

async function main() {
  // 1. Find all bookings with a phone number and no linked user (userId is null)
  const orphanBookings = await prisma.booking.findMany({
    where: { userId: null, customerPhone: { not: null }, deletedAt: null },
    select: { id: true, customerName: true, customerPhone: true, tenantId: true },
  });

  console.log(`Found ${orphanBookings.length} orphan guest bookings (no linked user)`);

  let provisioned = 0;

  for (const booking of orphanBookings) {
    const key = phoneKey(booking.customerPhone);
    if (!key) {
      console.log(`  Booking ${booking.id}: phone "${booking.customerPhone}" has no valid key, skipping`);
      continue;
    }

    // Check if a user already exists for this phone
    const existing = await prisma.user.findFirst({
      where: { tenantId: booking.tenantId, phoneKey: key, deletedAt: null },
      select: { id: true, accountStatus: true, passwordHash: true, fullName: true },
    });

    if (existing) {
      // Already has an account — maybe upgrade if provisional with no password
      if (existing.accountStatus === 'provisional' && !existing.passwordHash) {
        const tempHash = await bcryptjs.hash(GUEST_TEMP_PASSWORD, 12);
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            passwordHash: tempHash,
            accountStatus: 'invited',
            mustChangePassword: true,
            tempPasswordExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            fullName: existing.fullName || booking.customerName || 'Guest',
          },
        });
        // Link booking to existing user
        await prisma.booking.update({ where: { id: booking.id }, data: { userId: existing.id } });
        provisioned++;
        console.log(`  Booking ${booking.id}: upgraded existing provisional user ${existing.id} and linked`);
      } else {
        // Just link the booking
        await prisma.booking.update({ where: { id: booking.id }, data: { userId: existing.id } });
        console.log(`  Booking ${booking.id}: linked to existing user ${existing.id}`);
      }
      continue;
    }

    // No user exists — create one
    const customerRole = await prisma.role.findFirst({
      where: { code: 'customer', tenantId: booking.tenantId },
    });
    if (!customerRole) {
      console.log(`  Booking ${booking.id}: no customer role, skipping`);
      continue;
    }

    const tempHash = await bcryptjs.hash(GUEST_TEMP_PASSWORD, 12);
    const user = await prisma.user.create({
      data: {
        tenantId: booking.tenantId,
        roleId: customerRole.id,
        fullName: booking.customerName || 'Guest',
        phone: booking.customerPhone,
        phoneKey: key,
        passwordHash: tempHash,
        accountStatus: 'invited',
        mustChangePassword: true,
        tempPasswordExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      select: { id: true },
    });

    await prisma.booking.update({ where: { id: booking.id }, data: { userId: user.id } });
    provisioned++;
    console.log(`  Booking ${booking.id}: created user ${user.id} and linked`);
  }

  console.log(`\nDone. Provisioned ${provisioned} new accounts.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
