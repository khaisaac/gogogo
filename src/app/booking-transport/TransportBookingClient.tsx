"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./BookingTransport.module.css";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  CreditCard,
  ChevronRight,
  ShieldCheck,
  Info,
  CheckCircle2,
} from "lucide-react";

type TransportOption = {
  id: string;
  route: string;
  price: number;
  image: string | null;
  is_active: boolean;
};

type TransportBookingClientProps = {
  userEmail?: string;
  userFullName?: string;
  userWhatsapp?: string;
  isLoggedIn?: boolean;
};

export default function TransportBookingClient({
  userEmail = "",
  userFullName = "",
  userWhatsapp = "",
  isLoggedIn = false,
}: TransportBookingClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Selection, 2: Guest Details
  const [options, setOptions] = useState<TransportOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Form State
  const [selectedRoute, setSelectedRoute] = useState<TransportOption | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [pax, setPax] = useState(1);
  const [paymentType, setPaymentType] = useState<"full" | "deposit">("deposit");

  // Guest Details State
  const [fullName, setFullName] = useState(userFullName);
  const [whatsapp, setWhatsapp] = useState(userWhatsapp);
  const [passport, setPassport] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [todayStr, setTodayStr] = useState("");

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setTodayStr(`${yyyy}-${mm}-${dd}`);

    // Load active transport options
    async function loadOptions() {
      try {
        const res = await fetch("/api/transport/options");
        if (res.ok) {
          const data = await res.json();
          const active = data.filter((o: TransportOption) => o.is_active);
          setOptions(active);
          if (active.length > 0) {
            setSelectedRoute(active[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load options:", err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  // Sync details when user updates
  useEffect(() => {
    if (userFullName) setFullName(userFullName);
    if (userWhatsapp) setWhatsapp(userWhatsapp);
  }, [userFullName, userWhatsapp]);

  const handleNextStep = () => {
    if (!selectedRoute) {
      alert("Please select a transport route.");
      return;
    }
    if (!bookingDate) {
      alert("Please choose a booking date.");
      return;
    }
    if (!pickupTime) {
      alert("Please enter a pickup time.");
      return;
    }
    if (!pickupLocation) {
      alert("Please specify a pickup location.");
      return;
    }
    if (!dropoffLocation) {
      alert("Please specify a dropoff location.");
      return;
    }

    if (!isLoggedIn) {
      // Redirect to login page and redirect back here
      const redirectPath = `/admin-login?redirect=${encodeURIComponent(window.location.pathname)}`;
      router.push(redirectPath);
      return;
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackStep = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !whatsapp || !passport) {
      setError("Please fill out all required fields.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/transport/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          whatsapp,
          passport,
          route_id: selectedRoute?.id,
          booking_date: bookingDate,
          pickup_time: pickupTime,
          pickup_location: pickupLocation,
          dropoff_location: dropoffLocation,
          number_of_pax: pax,
          payment_type: paymentType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize booking");
      }

      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        throw new Error("No payment url returned from server.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalPrice = selectedRoute?.price || 0;
  const depositAmount = Math.round(totalPrice * 0.3);
  const balanceAmount = totalPrice - depositAmount;
  const toPayNow = paymentType === "deposit" ? depositAmount : totalPrice;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.push("/")}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.title}>🚗 Senaru Transport Booking</h1>
      </header>

      <div className={styles.bookingWrapper}>
        {/* Left Column (Forms) */}
        <div className={styles.leftColumn}>
          {step === 1 ? (
            <>
              {/* Route Selector */}
              <div className={styles.card}>
                <div className={styles.sectionHeader}>
                  <div className={styles.iconWrapper}>
                    <MapPin size={20} />
                  </div>
                  <h2 className={styles.sectionTitle}>Select Shuttle / Transfer Route</h2>
                </div>

                {loadingOptions ? (
                  <div style={{ padding: "20px 0", textAlign: "center", color: "#64748b" }}>
                    Loading transfer routes...
                  </div>
                ) : options.length === 0 ? (
                  <div style={{ padding: "20px 0", textAlign: "center", color: "#64748b" }}>
                    No transport routes available at the moment.
                  </div>
                ) : (
                  <div className={styles.routeSelectorGrid}>
                    {options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`${styles.routeItem} ${
                          selectedRoute?.id === opt.id ? styles.routeItemSelected : ""
                        }`}
                        onClick={() => setSelectedRoute(opt)}
                      >
                        <div className={styles.routeImageWrapper}>
                          <img
                            src={opt.image || "/shuttle.jpg"}
                            alt={opt.route}
                            className={styles.routeImage}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/shuttle.jpg";
                            }}
                          />
                        </div>
                        <div className={styles.routeInfo}>
                          <span className={styles.routeName}>{opt.route}</span>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className={styles.routePrice}>{formatPrice(opt.price)}</span>
                            {selectedRoute?.id === opt.id && (
                              <CheckCircle2 size={24} color="#1a4d43" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Transfer Details Form */}
              <div className={styles.card}>
                <div className={styles.sectionHeader}>
                  <div className={styles.iconWrapper}>
                    <Calendar size={20} />
                  </div>
                  <h2 className={styles.sectionTitle}>Shuttle Transfer Details</h2>
                </div>

                <div className={styles.grid2}>
                  <div className={styles.formGroup}>
                    <label>Transfer Date</label>
                    <input
                      type="date"
                      min={todayStr}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Pickup Time</label>
                    <input
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Pickup Location Details (e.g., Hotel Name, Airport Terminal)</label>
                  <input
                    type="text"
                    placeholder="Enter pickup address, hotel or airport flight number"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Dropoff Location Details (e.g., Senaru Office, Harbor)</label>
                  <input
                    type="text"
                    placeholder="Enter dropoff location address or harbor name"
                    value={dropoffLocation}
                    onChange={(e) => setDropoffLocation(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.grid2}>
                  <div className={styles.formGroup}>
                    <label>Number of Passengers</label>
                    <select value={pax} onChange={(e) => setPax(parseInt(e.target.value))}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>
                          {n} Pax
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Type Selector */}
              <div className={styles.card}>
                <div className={styles.sectionHeader}>
                  <div className={styles.iconWrapper}>
                    <CreditCard size={20} />
                  </div>
                  <h2 className={styles.sectionTitle}>Payment Option</h2>
                </div>

                <div
                  className={`${styles.paymentModeOption} ${
                    paymentType === "deposit" ? styles.paymentModeOptionSelected : ""
                  }`}
                  onClick={() => setPaymentType("deposit")}
                >
                  <input
                    type="radio"
                    className={styles.paymentRadio}
                    checked={paymentType === "deposit"}
                    onChange={() => setPaymentType("deposit")}
                  />
                  <div>
                    <span className={styles.paymentTitle}>30% Deposit Payment (Recommended)</span>
                    <span className={styles.paymentDesc}>
                      Secure your transfer with a 30% deposit now. Pay the remaining 70% balance directly
                      to your driver on the day of travel.
                    </span>
                  </div>
                </div>

                <div
                  className={`${styles.paymentModeOption} ${
                    paymentType === "full" ? styles.paymentModeOptionSelected : ""
                  }`}
                  onClick={() => setPaymentType("full")}
                >
                  <input
                    type="radio"
                    className={styles.paymentRadio}
                    checked={paymentType === "full"}
                    onChange={() => setPaymentType("full")}
                  />
                  <div>
                    <span className={styles.paymentTitle}>100% Full Payment</span>
                    <span className={styles.paymentDesc}>
                      Pay the total booking price in full today. Enjoy a hassle-free, fully paid transfer
                      with zero payments required on arrival.
                    </span>
                  </div>
                </div>
              </div>

              {/* Continue button */}
              <button className={styles.submitBtn} onClick={handleNextStep}>
                Continue to Guest Details <ChevronRight size={18} />
              </button>
            </>
          ) : (
            /* Step 2: Guest Details Form */
            <form onSubmit={handleCheckoutSubmit} className={styles.card}>
              <div className={styles.sectionHeader}>
                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "#1a4d43", cursor: "pointer", padding: 0 }}
                  onClick={handleBackStep}
                >
                  <ArrowLeft size={20} style={{ marginRight: 8, verticalAlign: "middle" }} />
                </button>
                <h2 className={styles.sectionTitle}>Enter Guest Details</h2>
              </div>

              {error && (
                <div
                  style={{
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#b91c1c",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                    fontSize: "0.9rem",
                  }}
                >
                  {error}
                </div>
              )}

              <div className={styles.formGroup}>
                <label>Nama Lengkap (Full Name) *</label>
                <input
                  type="text"
                  placeholder="Enter your full name (matching your passport)"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Nomor Whatsapp (WhatsApp Number) *</label>
                <input
                  type="tel"
                  placeholder="e.g. +62812345678"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Passport Number / NIK *</label>
                <input
                  type="text"
                  placeholder="Enter your passport or ID card number"
                  value={passport}
                  onChange={(e) => setPassport(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginTop: "28px" }}>
                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                  {submitting ? (
                    <>
                      <div className={styles.loadingSpinner}></div> Initializing Payment Gateway...
                    </>
                  ) : (
                    <>
                      Proceed to Secure Checkout ({formatPrice(toPayNow)}) <ShieldCheck size={20} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column (Sidebars / Detail cards) */}
        <div className={styles.rightColumn}>
          {/* Summary Card */}
          <div className={styles.summaryCard}>
            <h3 className={styles.summaryTitle}>Booking Summary</h3>

            {selectedRoute ? (
              <>
                <div className={styles.summaryRow}>
                  <span>Selected Route:</span>
                  <span style={{ fontWeight: 700, color: "#1f2937", textAlign: "right" }}>
                    {selectedRoute.route}
                  </span>
                </div>
                {bookingDate && (
                  <div className={styles.summaryRow}>
                    <span>Date:</span>
                    <span style={{ fontWeight: 700 }}>{bookingDate}</span>
                  </div>
                )}
                {pickupTime && (
                  <div className={styles.summaryRow}>
                    <span>Pickup Time:</span>
                    <span style={{ fontWeight: 700 }}>{pickupTime}</span>
                  </div>
                )}
                <div className={styles.summaryRow}>
                  <span>Passengers:</span>
                  <span style={{ fontWeight: 700 }}>{pax} Passenger(s)</span>
                </div>

                <div className={styles.summaryTotalRow}>
                  <span>Total Transfer Price</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>

                {paymentType === "deposit" ? (
                  <>
                    <div className={styles.summaryDepositRow}>
                      <span>Paid Today (30% Deposit)</span>
                      <span>{formatPrice(depositAmount)}</span>
                    </div>
                    <div className={styles.summaryBalanceRow}>
                      <span>Balance on Arrival (70%)</span>
                      <span>{formatPrice(balanceAmount)}</span>
                    </div>
                  </>
                ) : (
                  <div className={styles.summaryDepositRow}>
                    <span>Paid Today (100% Full)</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                )}
              </>
            ) : (
              <div style={{ color: "#64748b", fontSize: "0.9rem" }}>
                Select a transfer route to see the booking pricing breakdown here.
              </div>
            )}
          </div>

          {/* Info Card */}
          <div className={styles.detailCard} style={{ marginTop: "24px" }}>
            <h4 className={styles.infoSectionTitle}>
              <Info size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Why Book With Us?
            </h4>
            <ul className={styles.infoList}>
              <li>Comfortable Private Vehicles (Full A/C, spacious luggage space)</li>
              <li>Experienced, English-speaking professional local drivers</li>
              <li>Flexibility: Flight delayed or plans changed? We adjust seamlessly</li>
              <li>Safe & Secure transactions via DOKU Payment Gateway</li>
              <li>Official transport partner of e-Rinjani Mount Rinjani Treks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
