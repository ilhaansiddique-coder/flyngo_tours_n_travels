const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanServices() {
  console.log('🧹 Cleaning all services from database...');
  try {
    await prisma.visaDestination.deleteMany({});
    await prisma.visaService.deleteMany({});
    await prisma.visaCountry.deleteMany({});
    await prisma.tourDestination.deleteMany({});
    await prisma.itineraryDay.deleteMany({});
    await prisma.tour.deleteMany({});
    await prisma.hotelDestination.deleteMany({});
    await prisma.room.deleteMany({});
    await prisma.hotel.deleteMany({});
    await prisma.flight.deleteMany({});
    await prisma.transport.deleteMany({});
    await prisma.hajjPackage.deleteMany({});
    await prisma.umrahPackage.deleteMany({});

    // Remove any leftover demo destinations for Bangkok, Nepal, Singapore, Tokyo, Malaysia, Dubai, Thailand, Australia, UK
    const targetNames = [
      'bangkok', 'nepal', 'singapore', 'tokyo', 'malaysia',
      'united arab emirates', 'dubai', 'thailand', 'australia', 'united kingdom', 'uk'
    ];
    await prisma.destination.deleteMany({
      where: {
        OR: targetNames.map((t) => ({
          OR: [
            { name: { contains: t, mode: 'insensitive' } },
            { slug: { contains: t, mode: 'insensitive' } },
            { country: { contains: t, mode: 'insensitive' } },
          ],
        })),
      },
    });
    console.log('✅ Successfully removed all services and target destination records from the database.');
  } catch (error) {
    console.error('❌ Error cleaning services:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanServices();
