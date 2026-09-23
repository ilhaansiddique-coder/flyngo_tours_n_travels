const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const tenant = await prisma.tenant.findFirst();
  const v = await prisma.visaService.create({
    data: {
      tenantId: tenant.id,
      destinationId: '00000000-0000-0000-0000-000000000000', // invalid
      title: "Test",
      description: "Test",
      price: 100
    }
  }).catch(e => e.message);
  console.log(v);
}
run().then(() => prisma.$disconnect());
