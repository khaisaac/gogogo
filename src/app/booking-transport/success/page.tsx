import Link from "next/link";
import { prisma } from "@/lib/db";
import styles from "../BookingTransport.module.css";
import { CheckCircle2, Home, MapPin, Calendar, Users, Phone } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Booking Success — Senaru Transport",
};

export default async function BookingSuccessPage(props: {
  searchParams: Promise<{ booking_id?: string }>;
}) {
  const params = await props.searchParams;
  const bookingId = params.booking_id;

  if (!bookingId) {
    return (
      <div className={styles.page}>
        <div className={styles.successContainer}>
          <h1 className={styles.successTitle} style={{ color: "#b91c1c" }}>
            Invalid Request
          </h1>
          <p className={styles.successDesc}>No booking identifier was provided.</p>
          <Link href="/" className={styles.actionBtn}>
            <Home size={18} /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const booking = await prisma.transportBooking.findUnique({
    where: { id: bookingId },
    include: {
      payments: true,
    },
  });

  if (!booking) {
    return (
      <div className={styles.page}>
        <div className={styles.successContainer}>
          <h1 className={styles.successTitle} style={{ color: "#b91c1c" }}>
            Booking Not Found
          </h1>
          <p className={styles.successDesc}>We couldn't retrieve your transport booking details.</p>
          <Link href="/" className={styles.actionBtn}>
            <Home size={18} /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isDeposit = booking.payment_type === "deposit";

  return (
    <div className={styles.page}>
      <div className={styles.successContainer}>
        <div className={styles.successIconWrapper}>
          <CheckCircle2 size={72} strokeWidth={1.5} />
        </div>
        <h1 className={styles.successTitle}>Booking Confirmed!</h1>
        <p className={styles.successDesc}>
          Thank you, {booking.full_name}. Your private transfer with Senaru Transport is scheduled successfully.
          Your invoice status is updated and a booking receipt has been sent to your registry email.
        </p>

        {/* Receipt Details */}
        <div className={styles.receiptCard}>
          <h2 className={styles.receiptTitle}>Transfer Ticket / Receipt</h2>

          <div className={styles.receiptRow}>
            <span className={styles.receiptLabel}>Invoice ID</span>
            <span className={styles.receiptVal} style={{ color: "#1a4d43" }}>
              {booking.doku_invoice || `TRP-${booking.id.slice(0, 8).toUpperCase()}`}
            </span>
          </div>

          <div className={styles.receiptRow}>
            <span className={styles.receiptLabel}>Route</span>
            <span className={styles.receiptVal}>{booking.route_title}</span>
          </div>

          <div className={styles.receiptRow}>
            <span className={styles.receiptLabel}>Date & Time</span>
            <span className={styles.receiptVal}>
              {formatDate(booking.booking_date)} at {booking.pickup_time || "N/A"}
            </span>
          </div>

          <div className={styles.receiptRow}>
            <span className={styles.receiptLabel}>Pickup Location</span>
            <span className={styles.receiptVal} style={{ textAlign: "right", maxWidth: "60%" }}>
              {booking.pickup_location}
            </span>
          </div>

          <div className={styles.receiptRow}>
            <span className={styles.receiptLabel}>Dropoff Location</span>
            <span className={styles.receiptVal} style={{ textAlign: "right", maxWidth: "60%" }}>
              {booking.dropoff_location}
            </span>
          </div>

          <div className={styles.receiptRow}>
            <span className={styles.receiptLabel}>Passenger Count</span>
            <span className={styles.receiptVal}>{booking.number_of_pax} Pax</span>
          </div>

          <div className={styles.receiptRow}>
            <span className={styles.receiptLabel}>Guest Name</span>
            <span className={styles.receiptVal}>{booking.full_name}</span>
          </div>

          <div className={styles.receiptRow}>
            <span className={styles.receiptLabel}>WhatsApp</span>
            <span className={styles.receiptVal}>{booking.whatsapp}</span>
          </div>

          <div className={styles.receiptRow}>
            <span className={styles.receiptLabel}>Passport / NIK</span>
            <span className={styles.receiptVal}>{booking.passport}</span>
          </div>

          <div className={styles.receiptRow}>
            <span className={styles.receiptLabel}>Payment Method</span>
            <span className={styles.receiptVal}>DOKU Payment Gateway</span>
          </div>

          {/* Pricing breakdown */}
          <div className={styles.receiptTotal}>
            <span>Total Route Price</span>
            <span>{formatPrice(booking.total_price)}</span>
          </div>

          {isDeposit ? (
            <>
              <div className={styles.receiptRow} style={{ marginTop: "12px", borderTop: "1px dashed #e2e8f0", paddingTop: "8px" }}>
                <span className={styles.receiptLabel} style={{ color: "#16a34a", fontWeight: 700 }}>Paid Today (30% Deposit)</span>
                <span className={styles.receiptVal} style={{ color: "#16a34a", fontWeight: 800 }}>{formatPrice(booking.deposit_amount || 0)}</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel} style={{ color: "#b91c1c", fontWeight: 700 }}>Remaining Balance (Due on Arrival)</span>
                <span className={styles.receiptVal} style={{ color: "#b91c1c", fontWeight: 800 }}>{formatPrice(booking.balance_amount || 0)}</span>
              </div>
            </>
          ) : (
            <div className={styles.receiptRow} style={{ marginTop: "12px", borderTop: "1px dashed #e2e8f0", paddingTop: "8px" }}>
              <span className={styles.receiptLabel} style={{ color: "#16a34a", fontWeight: 700 }}>Paid in Full (100%)</span>
              <span className={styles.receiptVal} style={{ color: "#16a34a", fontWeight: 800 }}>{formatPrice(booking.total_price)}</span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
          <Link href="/" className={styles.actionBtn}>
            <Home size={18} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
