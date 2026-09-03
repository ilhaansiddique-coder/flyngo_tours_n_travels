/**
 * Clean Services Data (dev + production safe).
 *
 * Wipes all *service catalog* content and *booking / payment* records while
 * PRESERVING:
 *   - business logic / UI code (untouched, this only touches the DB)
 *   - users & their identities (User, roles, permissions)
 *   - bank accounts + bKash payment settings (BankAccount / tenant payment config)
 *   - loyalty & reward balances / transactions (kept intact per request)
 *   - tenant settings, CMS, blog, faq, nav/footer, hero, about, landing pages,
 *     referral/affiliate config, coupons, etc.
 *
 * Usage (runs against whatever DATABASE_URL the env provides):
 *   npx ts-node scripts/clean-services-data.ts
 * Prepend DATABASE_URL=... to target a specific DB.
 *
 * WARNING: This is destructive and irreversible. Run only when intended.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tables: string[] = [
    // booking / payment
    'payment_milestones',
    'booking_travelers',
    'invoices',
    'payments',
    'pilgrims',
    'bookings',
    'hajj_umrah_bookings',
    'hajj_pre_registrations',
    // reviews (customer reviews on services)
    'reviews',
    // services catalog
    'itinerary_days',
    'tour_destinations',
    'hotel_destinations',
    'visa_destinations',
    'rooms',
    'tours',
    'hotels',
    'flights',
    'visa_services',
    'hajj_packages',
    'umrah_packages',
    'transports',
    'media',
    'globe_routes',
    'globe_cities',
    'visa_countries',
    'destinations',
    'testimonials',
  ];

  console.log('Clean Services Data');
  console.log('====================');
  console.log(`Will DELETE from ${tables.length} tables (service + booking/payment).`);
  console.log(
    `Will PRESERVE (among others): users, bank_accounts, loyalty/points, tenant settings, CMS, config.\n`,
  );

  // Safety: confirm the connection works before doing anything.
  await prisma.$queryRaw`SELECT 1`;

  let total = 0;
  for (const table of tables) {
    const existing = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT count(*)::bigint AS count FROM "${table}"`,
    );
    const count = Number(existing?.[0]?.count ?? 0);
    if (count === 0) {
      console.log(`  ${table.padEnd(28)} 0 rows (skip)`);
      continue;
    }
    const res = await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
    total += Number(res ?? 0);
    console.log(`  ${table.padEnd(28)} deleted ${String(res)} rows`);
  }

  console.log(`\nDone. Deleted ${total} rows across service + booking/payment data.`);
  console.log('Preserved: users, bank accounts + bKash config, loyalty/reward balances, code/config.\n');
}

main()
  .catch((err) => {
    console.error('Cleanup failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
