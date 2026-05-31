const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.post.findMany({take: 5, orderBy: {created_at: 'desc'}}).then(console.log).finally(() => prisma.$disconnect());
