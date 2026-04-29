"use client";

import { useState } from "react";
import styles from "./refund-request.module.css";

type RefundRequestModalProps = {
  bookingId: string;
  refundAmount: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function RefundRequestModal({
  bookingId,
  refundAmount,
  isOpen,
  onClose,
  onSuccess,
}: RefundRequestModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bookings/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: bookingId,
          reason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit refund request");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Request Refund</h3>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.warningBox}>
            <p>
              <strong>⚠️ Important:</strong> Once you submit a refund request,
              it will need to be approved by our admin team.
            </p>
          </div>

          <div className={styles.refundInfo}>
            <p className={styles.infoLabel}>Refund Amount:</p>
            <p className={styles.refundAmount}>${refundAmount} USD</p>
          </div>

          {error && <div className={styles.errorAlert}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="reason">Reason for Refund *</label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please explain why you would like to request a refund..."
                required
                disabled={loading}
                minLength={10}
                rows={5}
              />
              <p className={styles.helpText}>Minimum 10 characters required</p>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading || reason.length < 10}
              >
                {loading ? "Submitting..." : "Submit Refund Request"}
              </button>
            </div>
          </form>

          <div className={styles.infoBox}>
            <p>
              <strong>What happens next?</strong>
            </p>
            <ul>
              <li>Your refund request will be reviewed by our admin team</li>
              <li>You'll receive an email with the status within 24 hours</li>
              <li>
                If approved, funds will be returned to your original payment
                method (PayPal) within 3-5 business days
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
