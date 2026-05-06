"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./checkout.module.css";

type CheckoutClientProps = {
  packageId: string;
  packageTitle: string;
  date: string;
  pax: number;
  priceType: string;
  priceMode: string;
  totalDays: number;
  totalPrice: number;
};

export default function CheckoutClient({
  packageId,
  packageTitle,
  date,
  pax,
  priceType,
  priceMode,
  totalDays,
  totalPrice,
}: CheckoutClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    whatsapp: "",
    hotelPickup: "",
    specialRequirements: `Member 1:
1. Full Name: 
2. Passport Number: 
3. Nationality: 
4. Gender: 
5. Birthday: 
6. Height (cm): 
7. Weight (kg): 

(Copy the format above for member 2, 3, etc.)
Special/Dietary Requirements: `,
    orderNote: "",
    arrivalDay: "",
    paymentType: "full", // full | deposit
  });

  useEffect(() => {
    // get user email
    const fetchUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data.user?.email) {
        setEmail(data.user.email);
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();
        if (profile?.role === "admin") {
          setIsAdmin(true);
        }
      }
    };
    fetchUser();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Create Booking
      const bookingPayload = {
        package_id: packageId,
        full_name: formData.fullName,
        email,
        whatsapp: formData.whatsapp,
        trekking_date: date,
        number_of_trekkers: pax,
        price_type: priceType,
        price_mode: priceMode,
        total_days: totalDays,
        hotel_pickup_location: formData.hotelPickup,
        special_requirements: formData.specialRequirements,
        order_note: formData.orderNote,
        payment_type: formData.paymentType,
        arrival_day: formData.arrivalDay,
      };

      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      });

      const bookingData = await bookingRes.json();

      if (!bookingRes.ok) {
        throw new Error(bookingData.error || "Failed to create booking");
      }

      const bookingId = bookingData.booking.id;

      // 2. Generate Payment URL (PayPal only / DOKU) or Skip if Pay Later
      if (formData.paymentType === "pay_later") {
        window.location.href = `/booking/success?booking_id=${bookingId}`;
        return;
      }

      const paymentRes = await fetch("/api/payments/paypal/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId }),
      });

      const paymentData = await paymentRes.json();

      if (!paymentRes.ok) {
        throw new Error(paymentData.error || "Failed to create payment link");
      }

      // 3. Redirect to payment
      const paymentUrl = paymentData.payment_url || paymentData.approval_url;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        throw new Error("No payment URL received");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  let amountToPay = totalPrice;
  if (formData.paymentType === "deposit") {
    amountToPay = Math.round(totalPrice * 0.3);
  } else if (formData.paymentType === "pay_later") {
    amountToPay = 0;
  }

  return (
    <div className={styles.grid}>
      <div className={styles.formCol}>
        <form className={styles.formCard} onSubmit={handleSubmit}>
          {error && <div className={styles.errorAlert}>{error}</div>}

          <div className={styles.formGroup}>
            <label>Full Name *</label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Email Address {isAdmin && "(Admin Mode)"}</label>
            <input
              type="email"
              disabled={!isAdmin || loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={!isAdmin ? styles.disabledInput : ""}
              required
            />
            {!isAdmin && (
              <span className={styles.helpText}>
                To change email, sign out and log in again.
              </span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>WhatsApp Number *</label>
            <input
              type="tel"
              name="whatsapp"
              placeholder="e.g. +628123456789"
              required
              value={formData.whatsapp}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Arrival Day (Pick-up Date) *</label>
            <input
              type="date"
              name="arrivalDay"
              required
              value={formData.arrivalDay}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Hotel Pickup Location *</label>
            <input
              type="text"
              name="hotelPickup"
              placeholder="Name of hotel or address"
              required
              value={formData.hotelPickup}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Members data and special request *</label>
            <span className={styles.helpText} style={{ marginBottom: "8px", display: "block" }}>
              (the data for registration at national park mount rinjani)
            </span>
            <textarea
              name="specialRequirements"
              placeholder="Enter members data here..."
              required
              value={formData.specialRequirements}
              onChange={handleChange}
              disabled={loading}
              rows={12}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Order Note (Optional)</label>
            <textarea
              name="orderNote"
              value={formData.orderNote}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className={styles.paymentMethods}>
            <h3>Payment Option</h3>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="paymentType"
                value="full"
                checked={formData.paymentType === "full"}
                onChange={handleChange}
                disabled={loading}
              />
              <div className={styles.radioContent}>
                <strong>Pay in Full (100%)</strong>
                <span>Pay the total amount (${totalPrice} USD) now.</span>
              </div>
            </label>

            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="paymentType"
                value="deposit"
                checked={formData.paymentType === "deposit"}
                onChange={handleChange}
                disabled={loading}
              />
              <div className={styles.radioContent}>
                <strong>Pay Deposit Only (30%)</strong>
                <span>
                  Secure your booking now, pay the rest later. ($
                  {Math.round(totalPrice * 0.3)} USD)
                </span>
              </div>
            </label>

            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="paymentType"
                value="pay_later"
                checked={formData.paymentType === "pay_later"}
                onChange={handleChange}
                disabled={loading}
              />
              <div className={styles.radioContent}>
                <strong>Pay Later (On Arrival)</strong>
                <span>
                  Secure your booking now and pay the full amount ($
                  {totalPrice} USD) when you arrive.
                </span>
              </div>
            </label>
          </div>

          {formData.paymentType !== "pay_later" && (
            <div className={styles.paymentMethods}>
              <h3>Payment Method</h3>
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "4px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <img
                    src="/doku.svg"
                    alt="DOKU"
                    style={{ height: "24px", objectFit: "contain" }}
                  />
                </div>
                <p style={{ margin: "0", fontSize: "0.9em", color: "#666" }}>
                  Checkout securely using DOKU payment gateway.
                </p>
              </div>
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading
              ? "Processing..."
              : formData.paymentType === "pay_later"
                ? "Complete Booking (Pay on Arrival)"
                : `Proceed to Payment ($${amountToPay} USD)`}
          </button>
        </form>
      </div>

      <div className={styles.summaryCol}>
        <div className={styles.summaryCard}>
          <h3>Booking Summary</h3>
          <div className={styles.summaryItem}>
            <span>Package</span>
            <strong>{packageTitle}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Trekking Date</span>
            <strong>{date}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Service Type</span>
            <strong style={{ textTransform: "capitalize" }}>{priceType}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Pricing Mode</span>
            <strong>
              {priceMode === "total_package"
                ? `Total Package (${totalDays} days)`
                : "Per Person"}
            </strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Participants</span>
            <strong>{pax} Adults</strong>
          </div>
          <hr className={styles.divider} />
          <div className={styles.summaryTotal}>
            <span>Total Due</span>
            <div style={{ textAlign: "right" }}>
              <span>${amountToPay} USD</span>
              {formData.paymentType === "deposit" && (
                <div
                  style={{
                    fontSize: "0.85em",
                    color: "#666",
                    marginTop: "4px",
                    fontWeight: "normal",
                  }}
                >
                  (30% Deposit of ${totalPrice})
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
