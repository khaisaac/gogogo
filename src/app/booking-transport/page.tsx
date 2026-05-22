import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import TransportBookingClient from "./TransportBookingClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Book Senaru Transport — Mt. Rinjani",
  description: "Secure your transport, airport transfer, or harbor shuttle to Mt. Rinjani.",
};

export default async function BookingTransportPage() {
  const user = await getUser();

  return (
    <TransportBookingClient
      userEmail={user?.email || ""}
      userFullName={user?.full_name || ""}
      userWhatsapp={(user as any)?.whatsapp || ""}
      isLoggedIn={!!user}
    />
  );
}
