"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import RefundRequestModal from "@/app/dashboard/RefundRequestModal";
import styles from "./dashboard.module.css";

export default function BookingHistory({ user }: { user: any }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refundModal, setRefundModal] = useState<{
    isOpen: boolean;
    bookingId: string;
    amount: number;
  }>({ isOpen: false, bookingId: "", amount: 0 });

  useEffect(() => {
    const fetchBookings = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setBookings(data);
      }
      setLoading(false);
    };

    fetchBookings();
  }, [user.id]);

  const handleRefundClick = (booking: any) => {
    const refundAmount = booking.deposit_amount || booking.total_price;
    setRefundModal({
      isOpen: true,
      bookingId: booking.id,
      amount: refundAmount,
    });
  };

  const handleRefundSuccess = () => {
    // Refresh bookings
    const fetchBookings = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setBookings(data);
      }
    };
    fetchBookings();
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "fully_paid":
        return "#10b981"; // green
      case "deposit_paid":
        return "#f59e0b"; // amber
      case "pending":
        return "#6b7280"; // gray
      default:
        return "#6b7280";
    }
  };

  const getRefundStatusColor = (status: string | null) => {
    switch (status) {
      case "approved":
        return "#10b981"; // green
      case "requested":
        return "#f59e0b"; // amber
      case "rejected":
        return "#ef4444"; // red
      case "completed":
        return "#3b82f6"; // blue
      default:
        return "#6b7280";
    }
  };

  if (loading) return <p>Loading bookings...</p>;

  if (bookings.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>You haven't made any bookings yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className={styles.contentTitle}>My Bookings</h2>

      {bookings.map((booking) => {
        const isPaid =
          booking.payment_status === "fully_paid" ||
          booking.payment_status === "deposit_paid";
        const canRefund =
          isPaid &&
          !booking.refund_status &&
          booking.trekking_date > new Date().toISOString().split("T")[0];

        return (
          <div key={booking.id} className={styles.bookingCard}>
            <div className={styles.bookingHeader}>
              <div>
                <div className={styles.bookingTitle}>
                  {booking.package_title}
                </div>
                <div className={styles.bookingDate}>
                  Booked on: {new Date(booking.created_at).toLocaleDateString()}
                </div>
              </div>
              <div
                className={styles.statusBadge}
                style={{
                  backgroundColor: getPaymentStatusColor(
                    booking.payment_status,
                  ),
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "999px",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                }}
              >
                {booking.payment_status === "fully_paid"
                  ? "Fully Paid"
                  : booking.payment_status === "deposit_paid"
                    ? "Deposit Paid"
                    : booking.payment_status === "pending"
                      ? "Pending"
                      : "Payment Failed"}
              </div>
            </div>

            <div className={styles.bookingDetails}>
              <div className={styles.detailItem}>
                <span>Trekking Date</span>
                <strong>
                  {new Date(booking.trekking_date).toLocaleDateString()}
                </strong>
              </div>
              <div className={styles.detailItem}>
                <span>Participants</span>
                <strong>{booking.number_of_trekkers} Persons</strong>
              </div>
              <div className={styles.detailItem}>
                <span>Total Price</span>
                <strong>${booking.total_price}</strong>
              </div>
              {booking.payment_type === "deposit" &&
                booking.balance_amount > 0 && (
                  <div className={styles.detailItem}>
                    <span>Balance Due</span>
                    <strong>${booking.balance_amount}</strong>
                  </div>
                )}
            </div>

            {booking.refund_status && (
              <div
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  backgroundColor: "#f8fafc",
                  borderRadius: "6px",
                  borderLeft: `4px solid ${getRefundStatusColor(booking.refund_status)}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: "0 0 0.5rem 0",
                        fontSize: "0.9rem",
                        color: "#64748b",
                      }}
                    >
                      Refund Status:
                    </p>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.25rem 0.75rem",
                        backgroundColor: getRefundStatusColor(
                          booking.refund_status,
                        ),
                        color: "white",
                        borderRadius: "999px",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                      }}
                    >
                      {booking.refund_status === "requested"
                        ? "⏳ Pending Review"
                        : booking.refund_status === "approved"
                          ? "✓ Approved"
                          : booking.refund_status === "completed"
                            ? "✓ Completed"
                            : "✕ Rejected"}
                    </span>
                  </div>
                </div>
                {booking.refund_reason && (
                  <p
                    style={{
                      margin: "0.5rem 0 0 0",
                      fontSize: "0.85rem",
                      color: "#475569",
                    }}
                  >
                    Reason: {booking.refund_reason}
                  </p>
                )}
              </div>
            )}

            {canRefund && !booking.refund_status && (
              <button
                onClick={() => handleRefundClick(booking)}
                style={{
                  marginTop: "1rem",
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) =>
                  ((e.target as any).style.backgroundColor = "#dc2626")
                }
                onMouseOut={(e) =>
                  ((e.target as any).style.backgroundColor = "#ef4444")
                }
              >
                Request Refund
              </button>
            )}
          </div>
        );
      })}

      <RefundRequestModal
        bookingId={refundModal.bookingId}
        refundAmount={refundModal.amount}
        isOpen={refundModal.isOpen}
        onClose={() => setRefundModal({ ...refundModal, isOpen: false })}
        onSuccess={handleRefundSuccess}
      />
    </div>
  );
}
