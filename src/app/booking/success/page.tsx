import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
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
  const paypalToken = params.token;

  if (!bookingId) redirect("/");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payments: true },
  });

  if (!booking) redirect("/");

  const paypalPayment = booking.payments?.find(
    (p: any) => p.provider === "paypal" && p.status === "pending",
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
