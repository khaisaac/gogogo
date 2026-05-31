import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  try {
    const booking = await prisma.ticketBooking.findFirst();
    if (!booking) return console.log("No bookings found");
    
    // Try updating with a string date
    await prisma.ticketBooking.update({
      where: { id: booking.id },
      data: {
        check_in: "2026-06-05T00:00:00.000Z" as any,
      }
    });
    console.log("Success string update");
  } catch (e: any) {
    console.error("String update failed:", e.message);
  }
}
test();
