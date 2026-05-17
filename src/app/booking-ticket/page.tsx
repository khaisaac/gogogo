import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import TicketBookingClient from "./TicketBookingClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Booking Ticket — Mt. Rinjani",
  description: "Book your entrance ticket to Mt. Rinjani National Park.",
};

export default async function BookingTicketPage() {
  const user = await getUser();

  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/booking-ticket")}`);
  }

  return (
    <TicketBookingClient 
      userEmail={user.email} 
      userFullName={user.full_name || ""} 
      userWhatsapp={(user as any).whatsapp || ""} 
    />
  );
}
