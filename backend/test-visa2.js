const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const v = await prisma.visaService.update({
    where: { id: "2124e78e-cb45-4d8d-8632-4d6cf5545071" },
    data: { requirements: ["Passport", "Photo"] }
  });
  console.log(v.requirements);
}
run().catch(console.error).finally(() => prisma.$disconnect());
