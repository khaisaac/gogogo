import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const latestBookings = await prisma.ticketBooking.findMany({
    orderBy: { created_at: 'desc' },
    take: 5
  });

  console.log("LATEST TICKET BOOKINGS:", JSON.stringify(latestBookings, null, 2));

  const latestPayments = await prisma.payment.findMany({
    orderBy: { created_at: 'desc' },
    take: 5
  });
  console.log("LATEST PAYMENTS:", JSON.stringify(latestPayments, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
