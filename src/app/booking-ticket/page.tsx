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

  return (
    <TicketBookingClient 
      userEmail={user?.email || ""} 
      userFullName={user?.full_name || ""} 
      userWhatsapp={(user as any)?.whatsapp || ""} 
      isLoggedIn={!!user}
    />
  );
}
