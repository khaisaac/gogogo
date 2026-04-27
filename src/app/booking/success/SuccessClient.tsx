"use client";

import { useEffect, useState } from "react";
import styles from "./success.module.css";

type SuccessClientProps = {
  booking: any;
  cancelled: boolean;
  needsCapture: boolean;
  paypalOrderId: string | null;
};

export default function SuccessClient({
  booking,
  cancelled,
  needsCapture,
  paypalOrderId,
}: SuccessClientProps) {
  const [status, setStatus] = useState<
    "loading" | "success" | "cancelled" | "error"
  >(cancelled ? "cancelled" : needsCapture ? "loading" : "success");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!needsCapture || !paypalOrderId) return;

    const capturePayment = async () => {
      try {
        const res = await fetch("/api/payments/paypal/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id: paypalOrderId }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to capture payment");
        }

        if (data.status === "paid") {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMsg(
            "Payment was not completed. Please contact our support team."
          );
        }
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(
          err.message || "An error occurred while processing your payment."
        );
      }
    };

    capturePayment();
  }, [needsCapture, paypalOrderId]);

  if (status === "loading") {
    return (
      <div className={styles.card}>
        <div className={styles.spinnerWrap}>
          <div className={styles.spinner} />
        </div>
        <h1 className={styles.loadingTitle}>Processing Your Payment</h1>
        <p className={styles.loadingText}>
          Please wait while we confirm your payment with PayPal...
        </p>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <div className={styles.iconCancelled}>✕</div>
        </div>
        <h1 className={styles.cancelledTitle}>Payment Cancelled</h1>
        <p className={styles.cancelledText}>
          Your payment was cancelled. Your booking is still saved — you can try
          again anytime.
        </p>
        <div className={styles.bookingRef}>
          <span>Booking Reference</span>
          <strong>{booking.id.slice(0, 8).toUpperCase()}</strong>
        </div>
        <div className={styles.actions}>
          <a href="/packages" className={styles.btnSecondary}>
            Browse Packages
          </a>
          <a href="/dashboard" className={styles.btnPrimary}>
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <div className={styles.iconError}>!</div>
        </div>
        <h1 className={styles.errorTitle}>Payment Issue</h1>
        <p className={styles.errorText}>{errorMsg}</p>
        <div className={styles.bookingRef}>
          <span>Booking Reference</span>
          <strong>{booking.id.slice(0, 8).toUpperCase()}</strong>
        </div>
        <div className={styles.actions}>
          <a href="/dashboard" className={styles.btnPrimary}>
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Success state
  const isPaid =
    booking.payment_status === "fully_paid" ||
    booking.payment_status === "deposit_paid" ||
    status === "success";
  const isDeposit = booking.payment_type === "deposit";
  const amountPaid = booking.deposit_amount || booking.total_price;

  return (
    <div className={styles.card}>
      <div className={styles.iconWrap}>
        <div className={styles.iconSuccess}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>

      <h1 className={styles.successTitle}>Booking Confirmed!</h1>
      <p className={styles.successText}>
        Thank you, <strong>{booking.full_name}</strong>! Your trekking
        adventure has been successfully booked.
      </p>

      <div className={styles.detailsGrid}>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Booking Reference</span>
          <span className={styles.detailValue}>
            {booking.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Package</span>
          <span className={styles.detailValue}>
            {booking.package_title || "Rinjani Trek"}
          </span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Trekking Date</span>
          <span className={styles.detailValue}>{booking.trekking_date}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Participants</span>
          <span className={styles.detailValue}>
            {booking.number_of_trekkers} Adult
            {booking.number_of_trekkers > 1 ? "s" : ""}
          </span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>
            {isDeposit ? "Deposit Paid" : "Amount Paid"}
          </span>
          <span className={`${styles.detailValue} ${styles.priceValue}`}>
            ${amountPaid} USD
          </span>
        </div>
        {isDeposit && (
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Balance Remaining</span>
            <span className={styles.detailValue}>
              ${booking.balance_amount} USD
            </span>
          </div>
        )}
      </div>

      {isDeposit && (
        <div className={styles.depositNotice}>
          <strong>💡 Deposit Payment</strong>
          <p>
            You have paid a 30% deposit. The remaining balance of $
            {booking.balance_amount} USD is due before your trekking date. Our
            team will contact you with payment details.
          </p>
        </div>
      )}

      <div className={styles.nextSteps}>
        <h3>What&apos;s Next?</h3>
        <ul>
          <li>
            <span className={styles.stepNum}>1</span>
            <span>
              A confirmation email has been sent to{" "}
              <strong>{booking.email}</strong>
            </span>
          </li>
          <li>
            <span className={styles.stepNum}>2</span>
            <span>
              Our team will contact you via WhatsApp at{" "}
              <strong>{booking.whatsapp}</strong> to confirm pickup details
            </span>
          </li>
          <li>
            <span className={styles.stepNum}>3</span>
            <span>
              Pack your gear and get ready for an unforgettable Rinjani
              adventure!
            </span>
          </li>
        </ul>
      </div>

      <div className={styles.actions}>
        <a href="/dashboard" className={styles.btnPrimary}>
          View My Bookings
        </a>
        <a href="/" className={styles.btnSecondary}>
          Back to Home
        </a>
      </div>
    </div>
  );
}
