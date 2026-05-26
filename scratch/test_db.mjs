import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const urls = [
  "mysql://root@127.0.0.1:3306/u925900205_rinjani",
  "mysql://root:root@127.0.0.1:3306/u925900205_rinjani",
  "mysql://root:admin@127.0.0.1:3306/u925900205_rinjani",
  "mysql://root:Techind123@127.0.0.1:3306/u925900205_rinjani",
];

async function tryConnect(url) {
  console.log("Trying URL:", url.replace(/:[^:@]+@/, ':****@'));
  process.env.DATABASE_URL = url;
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: url
      }
    }
  });
  
  try {
    // Try to query some database info
    const res = await prisma.$queryRawUnsafe("SELECT 1");
    console.log("SUCCESS! Connected successfully.");
    await prisma.$disconnect();
    return true;
  } catch (err) {
    console.log("FAILED:", err.message);
    await prisma.$disconnect();
    return false;
  }
}

async function run() {
  for (const url of urls) {
    const success = await tryConnect(url);
    if (success) {
      console.log("\nFound working connection string:", url);
      // Let's create the user and database if needed, or we can just use this URL!
      return;
    }
  }
  console.log("\nNone of the standard local root credentials worked.");
}

run();
