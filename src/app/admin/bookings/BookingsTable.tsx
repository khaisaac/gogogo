"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./bookings.module.css";

type Booking = any;

type BookingsTableProps = {
  bookings: Booking[];
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "fully_paid":
      return "#10b981"; // green
    case "deposit_paid":
      return "#f59e0b"; // amber
    case "pending":
      return "#6b7280"; // gray
    case "payment_failed":
      return "#ef4444"; // red
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

export default function BookingsTable({ bookings }: BookingsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "paid" | "refund">(
    "all",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "pending") return booking.payment_status === "pending";
    if (filter === "paid")
      return (
        booking.payment_status === "fully_paid" ||
        booking.payment_status === "deposit_paid"
      );
    if (filter === "refund")
      return (
        booking.refund_status === "requested" ||
        booking.refund_status === "approved"
      );
    return true;
  });

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div>
      <div className={styles.filterBar}>
        <button
          className={`${styles.filterBtn} ${filter === "all" ? styles.active : ""}`}
          onClick={() => { setFilter("all"); setCurrentPage(1); }}
        >
          All ({bookings.length})
        </button>
        <button
          className={`${styles.filterBtn} ${filter === "pending" ? styles.active : ""}`}
          onClick={() => { setFilter("pending"); setCurrentPage(1); }}
        >
          Pending Payment (
          {bookings.filter((b) => b.payment_status === "pending").length})
        </button>
        <button
          className={`${styles.filterBtn} ${filter === "paid" ? styles.active : ""}`}
          onClick={() => { setFilter("paid"); setCurrentPage(1); }}
        >
          Paid (
          {
            bookings.filter(
              (b) =>
                b.payment_status === "fully_paid" ||
                b.payment_status === "deposit_paid",
            ).length
          }
          )
        </button>
        <button
          className={`${styles.filterBtn} ${filter === "refund" ? styles.active : ""}`}
          onClick={() => { setFilter("refund"); setCurrentPage(1); }}
        >
          Refund Requests (
          {bookings.filter((b) => b.refund_status === "requested").length})
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Guest</th>
              <th>Package</th>
              <th>Trek Date</th>
              <th>Payment Status</th>
              <th>Amount</th>
              <th>Refund</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBookings.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  No bookings found
                </td>
              </tr>
            ) : (
              paginatedBookings.map((booking: any) => (
                <tr
                  key={booking.id}
                  className={
                    expandedId === booking.id ? styles.expandedRow : ""
                  }
                >
                  <td>
                    <div className={styles.guestInfo}>
                      <div className={styles.guestName}>
                        {booking.full_name}
                      </div>
                      <div className={styles.guestEmail}>{booking.email}</div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.packageInfo}>
                      {booking.package_title || "Custom"}
                    </div>
                  </td>
                  <td>{booking.trekking_date}</td>
                  <td>
                    <span
                      className={styles.badge}
                      style={{
                        backgroundColor: getPaymentStatusColor(
                          booking.payment_status,
                        ),
                      }}
                    >
                      {booking.payment_status === "fully_paid"
                        ? "Fully Paid"
                        : booking.payment_status === "deposit_paid"
                          ? "Deposit Paid"
                          : booking.payment_status === "pending"
                            ? "Pending"
                            : "Failed"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.priceInfo}>
                      <div>${booking.total_price} USD</div>
                      {booking.payment_type === "deposit" && (
                        <div className={styles.priceSmall}>
                          Dep: ${booking.deposit_amount}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    {booking.refund_status ? (
                      <span
                        className={styles.badge}
                        style={{
                          backgroundColor: getRefundStatusColor(
                            booking.refund_status,
                          ),
                        }}
                      >
                        {booking.refund_status === "requested"
                          ? "⚠️ Requested"
                          : booking.refund_status === "approved"
                            ? "✓ Approved"
                            : booking.refund_status === "completed"
                              ? "✓ Completed"
                              : "✕ Rejected"}
                      </span>
                    ) : (
                      <span className={styles.badgeGray}>—</span>
                    )}
                  </td>
                  <td>
                    <button
                      className={styles.expandBtn}
                      onClick={() =>
                        setExpandedId(
                          expandedId === booking.id ? null : booking.id,
                        )
                      }
                    >
                      {expandedId === booking.id ? "▼" : "▶"} View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className={styles.pageBtn}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}

      {expandedId && (
        <BookingDetail
          booking={filteredBookings.find((b) => b.id === expandedId)}
          onClose={() => setExpandedId(null)}
        />
      )}
    </div>
  );
}

function BookingDetail({
  booking,
  onClose,
}: {
  booking: Booking;
  onClose: () => void;
}) {
  const [processing, setProcessing] = useState(false);

  const handleRefundApproval = async (approved: boolean) => {
    setProcessing(true);
    try {
      const res = await fetch("/api/admin/refunds/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refund_id: booking.refunds?.[0]?.id,
          approved,
          approval_notes: approved
            ? "Refund approved by admin"
            : "Refund rejected by admin",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Error: " + (data.error || "Failed to process refund"));
      } else {
        alert(
          approved
            ? "Refund approved and processed"
            : "Refund request rejected",
        );
        onClose();
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (!booking) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Booking Details</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.detailsGrid}>
          <div className={styles.section}>
            <h4>Guest Information</h4>
            <p>
              <strong>Name:</strong> {booking.full_name}
            </p>
            <p>
              <strong>Email:</strong> {booking.email}
            </p>
            <p>
              <strong>WhatsApp:</strong> {booking.whatsapp}
            </p>
            <p>
              <strong>Passport:</strong> {booking.passport_number || "N/A"}
            </p>
            <p>
              <strong>Nationality:</strong> {booking.nationality || "N/A"}
            </p>
          </div>

          <div className={styles.section}>
            <h4>Trek Details</h4>
            <p>
              <strong>Package:</strong> {booking.package_title}
            </p>
            <p>
              <strong>Date:</strong> {booking.trekking_date}
            </p>
            <p>
              <strong>Arrival Day:</strong> {booking.arrival_day || "N/A"}
            </p>
            <p>
              <strong>Pickup Location:</strong> {booking.hotel_pickup_location}
            </p>
            <p>
              <strong>Participants:</strong> {booking.number_of_trekkers}
            </p>
          </div>

          <div className={styles.section}>
            <h4>Payment Information</h4>
            <p>
              <strong>Total Price:</strong> ${booking.total_price} USD
            </p>
            <p>
              <strong>Payment Type:</strong>{" "}
              {booking.payment_type === "full" ? "Full Payment" : "Deposit"}
            </p>
            {booking.payment_type === "deposit" && (
              <>
                <p>
                  <strong>Deposit Amount:</strong> ${booking.deposit_amount} USD
                </p>
                <p>
                  <strong>Balance Due:</strong> ${booking.balance_amount} USD
                </p>
              </>
            )}
            <p>
              <strong>Payment Status:</strong> {booking.payment_status}
            </p>
          </div>

          {booking.refund_status && (
            <div className={styles.section}>
              <h4>Refund Request</h4>
              <p>
                <strong>Status:</strong> {booking.refund_status}
              </p>
              <p>
                <strong>Reason:</strong> {booking.refund_reason || "N/A"}
              </p>
              <p>
                <strong>Requested At:</strong>{" "}
                {new Date(booking.refund_requested_at).toLocaleString()}
              </p>
              {booking.refund_status === "requested" && (
                <div className={styles.refundActions}>
                  <button
                    className={styles.approveBtn}
                    onClick={() => handleRefundApproval(true)}
                    disabled={processing}
                  >
                    ✓ Approve Refund
                  </button>
                  <button
                    className={styles.rejectBtn}
                    onClick={() => handleRefundApproval(false)}
                    disabled={processing}
                  >
                    ✕ Reject Refund
                  </button>
                </div>
              )}
            </div>
          )}

          {booking.special_requirements && (
            <div className={styles.section}>
              <h4>Special Requirements</h4>
              <p>{booking.special_requirements}</p>
            </div>
          )}

          {booking.order_note && (
            <div className={styles.section}>
              <h4>Order Note</h4>
              <p>{booking.order_note}</p>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.closeModalBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
