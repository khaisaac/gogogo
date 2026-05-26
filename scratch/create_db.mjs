import { PrismaClient } from '@prisma/client';

async function run() {
  const rootUrl = "mysql://root@127.0.0.1:3306/mysql";
  console.log("Connecting to root MySQL database to set up user and schema...");

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: rootUrl
      }
    }
  });

  try {
    // 1. Create database
    console.log("Creating database 'u925900205_rinjani' if not exists...");
    await prisma.$executeRawUnsafe("CREATE DATABASE IF NOT EXISTS u925900205_rinjani;");
    
    // 2. Create user 'u925900205_rinjani' and grant privileges
    console.log("Creating user 'u925900205_rinjani'...");
    try {
      await prisma.$executeRawUnsafe("CREATE USER 'u925900205_rinjani'@'%' IDENTIFIED BY 'Techind123';");
    } catch (e) {
      console.log("User might already exist (normal if rerun).");
    }
    
    console.log("Granting privileges...");
    await prisma.$executeRawUnsafe("GRANT ALL PRIVILEGES ON u925900205_rinjani.* TO 'u925900205_rinjani'@'%';");
    await prisma.$executeRawUnsafe("FLUSH PRIVILEGES;");

    console.log("Database and user created successfully!");
  } catch (err) {
    console.error("Error creating database/user:", err);
  } finally {
    await prisma.$disconnect();
  }

  // Verify the new user works
  const newUserUrl = "mysql://u925900205_rinjani:Techind123@127.0.0.1:3306/u925900205_rinjani";
  console.log("\nVerifying connection with the new credentials...");
  const userPrisma = new PrismaClient({
    datasources: {
      db: {
        url: newUserUrl
      }
    }
  });

  try {
    await userPrisma.$queryRawUnsafe("SELECT 1;");
    console.log("SUCCESS! Verified connection using new u925900205_rinjani credentials.");
  } catch (err) {
    console.error("Verification failed:", err.message);
  } finally {
    await userPrisma.$disconnect();
  }
}

run();
