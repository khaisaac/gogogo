const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.package.findFirst({ where: { slug: '2-days-to-3-days-sharing-group-on-budget' } })
  .then(pkg => console.log("PKG FOUND:", !!pkg))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
