import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Backfills flagUrl for destinations that have none by copying the flag from
// the country row (seeded for every ISO country). Fixes city entries such as
// "Bangkok" (country: Thailand) so they carry the Thai flag too.
async function main() {
  const missing = await prisma.destination.findMany({
    where: { flagUrl: null },
    select: { id: true, name: true, country: true, tenantId: true },
  });

  let updated = 0;
  for (const dest of missing) {
    if (!dest.country) continue;
    const source = await prisma.destination.findFirst({
      where: {
        tenantId: dest.tenantId,
        name: { equals: dest.country, mode: 'insensitive' },
        flagUrl: { not: null },
        id: { not: dest.id },
      },
      select: { flagUrl: true },
    });
    if (!source?.flagUrl) continue;
    await prisma.destination.update({
      where: { id: dest.id },
      data: { flagUrl: source.flagUrl },
    });
    updated++;
  }

  console.log(`Flag backfill complete: updated ${updated}/${missing.length} destinations`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });