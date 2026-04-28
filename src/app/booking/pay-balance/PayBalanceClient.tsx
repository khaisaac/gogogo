"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./payBalance.module.css";

type PayBalanceClientProps = {
  booking: any;
};

export default function PayBalanceClient({ booking }: PayBalanceClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDepositPaid = booking.payment_status === "deposit_paid";
  const balanceAmount = booking.balance_amount || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/payments/paypal/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: booking.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Payment initiation failed");
      }

      if (data.approval_url) {
        window.location.href = data.approval_url;
      } else {
        throw new Error("Invalid payment response");
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (!isDepositPaid || balanceAmount <= 0) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.title}>Payment Not Required</h2>
          <p className={styles.description}>
            This booking does not have a pending balance or is already fully
            paid.
          </p>
          <button className={styles.submitBtn} onClick={() => router.push("/")}>
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Pay Remaining Balance</h2>
        <p className={styles.description}>
          Please complete your payment for{" "}
          <strong>{booking.package_title}</strong>.
        </p>

        <div className={styles.summaryBox}>
          <div className={styles.summaryRow}>
            <span>Trekking Date</span>
            <span>{booking.trekking_date}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Total Price</span>
            <span>${booking.total_price} USD</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Deposit Paid</span>
            <span>${booking.deposit_amount} USD</span>
          </div>
          <hr className={styles.divider} />
          <div className={styles.summaryRowTotal}>
            <span>Balance Due</span>
            <span>${balanceAmount} USD</span>
          </div>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.paymentMethods}>
            <h3>Payment Method</h3>
            <div
              style={{
                padding: "12px",
                backgroundColor: "#f5f5f5",
                borderRadius: "4px",
              }}
            >
              <strong>PayPal</strong>
              <p
                style={{
                  margin: "8px 0 0 0",
                  fontSize: "0.9em",
                  color: "#666",
                }}
              >
                Checkout securely using your PayPal account.
              </p>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Processing..." : `Pay $${balanceAmount} USD`}
          </button>
        </form>
      </div>
    </div>
  );
}
