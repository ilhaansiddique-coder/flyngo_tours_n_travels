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
    console.log('✅ Successfully removed all services from the database.');
  } catch (error) {
    console.error('❌ Error cleaning services:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanServices();
