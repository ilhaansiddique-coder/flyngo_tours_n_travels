const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const visas = await prisma.visaService.findMany();
  console.log(JSON.stringify(visas, null, 2));
}
run().catch(console.error).finally(() => prisma.$disconnect());
