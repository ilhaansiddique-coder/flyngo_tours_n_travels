const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const t = await prisma.tenant.findFirst();
  let d = await prisma.destination.findFirst();
  if (!d) {
    d = await prisma.destination.create({ data: { tenantId: t.id, name: 'Test Dest', slug: 'test-dest', country: 'Test Dest' }});
  }
  const v = await prisma.visaService.create({
    data: {
      tenantId: t.id,
      destinationId: d.id,
      title: "Test Visa",
      description: "Desc",
      price: 1500,
    },
    include: { country: true }
  });
  console.log(v);
}
run().catch(console.error).finally(() => prisma.$disconnect());
