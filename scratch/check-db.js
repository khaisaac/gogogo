const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      featured_image: true
    }
  });
  console.log(posts);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
