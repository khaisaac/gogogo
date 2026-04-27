import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SuccessClient from "./SuccessClient";
import styles from "./success.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Booking Confirmed — Trekking Mount Rinjani",
};

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const bookingId = params.booking_id;
  const cancelled = params.cancelled === "true";
  const paypalToken = params.token; // PayPal passes token= on return

  if (!bookingId) {
    redirect("/");
  }

  const adminSupabase = createAdminClient();

  // Fetch booking details using admin client to bypass RLS
  const { data: booking } = await adminSupabase
    .from("bookings")
    .select("*, payments(*)")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    redirect("/");
  }

  // Check if this is a PayPal return that needs capturing
  const paypalPayment = booking.payments?.find(
    (p: any) => p.provider === "paypal" && p.status === "pending"
  );
  const needsCapture = !!paypalToken && !!paypalPayment && !cancelled;

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className="container">
          <SuccessClient
            booking={booking}
            cancelled={cancelled}
            needsCapture={needsCapture}
            paypalOrderId={paypalPayment?.provider_order_id || null}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
