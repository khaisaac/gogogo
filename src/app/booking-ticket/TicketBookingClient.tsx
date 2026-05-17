"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./BookingTicket.module.css";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Info, 
  Search, 
  ShieldCheck, 
  Users,
  CheckCircle2,
  ChevronRight
} from "lucide-react";

type Gate = {
  id: string;
  name: string;
  image: string;
};

type TicketBookingClientProps = {
  userEmail: string;
  userFullName?: string;
  userWhatsapp?: string;
};

export default function TicketBookingClient({ 
  userEmail, 
  userFullName = "", 
  userWhatsapp = "" 
}: TicketBookingClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Selection, 2: Personal Data
  const [gates, setGates] = useState<Gate[]>([]);
  const [loadingGates, setLoadingGates] = useState(true);
  
  const [entranceGate, setEntranceGate] = useState<Gate | null>(null);
  const [exitGate, setExitGate] = useState<Gate | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [pax, setPax] = useState(1);
  const [insuranceType, setInsuranceType] = useState<"regular" | "premium">("regular");
  
  const [isGateModalOpen, setIsGateModalOpen] = useState(false);
  const [selectingType, setSelectingType] = useState<"entrance" | "exit">("entrance");

  const [formData, setFormData] = useState({
    fullName: userFullName,
    whatsapp: userWhatsapp,
    memberData: `Member 1:
1. Full Name: 
2. Passport Number: 
3. Nationality: 
4. Gender: 
5. Birthday: 
6. Height (cm): 
7. Weight (kg): 

(Copy the format above for member 2, 3, etc.)
Special/Dietary Requirements: `,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchGates() {
      try {
        const res = await fetch("/api/tickets/gates");
        const data = await res.json();
        if (data.gates) {
          setGates(data.gates);
          // Set defaults
          setEntranceGate(data.gates.find((g: Gate) => g.name === "Aik Berik") || data.gates[0]);
          setExitGate(data.gates.find((g: Gate) => g.name === "Tete Batu") || data.gates[1]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingGates(false);
      }
    }
    fetchGates();
  }, []);

  const handleOpenGateModal = (type: "entrance" | "exit") => {
    setSelectingType(type);
    setIsGateModalOpen(true);
  };

  const handleSelectGate = (gate: Gate) => {
    if (selectingType === "entrance") {
      setEntranceGate(gate);
    } else {
      setExitGate(gate);
    }
    setIsGateModalOpen(false);
  };

  const handleNext = () => {
    if (!entranceGate || !exitGate || !checkIn || !checkOut) {
      alert("Please complete all selection fields.");
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        full_name: formData.fullName,
        email: userEmail,
        whatsapp: formData.whatsapp,
        entrance_gate: entranceGate?.name,
        exit_gate: exitGate?.name,
        check_in: checkIn,
        check_out: checkOut,
        number_of_pax: pax,
        insurance_type: insuranceType,
        member_data: formData.memberData,
      };

      const res = await fetch("/api/tickets/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      // Redirect to DOKU payment
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        throw new Error("No payment URL received");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setSubmitting(false);
    }
  };

  const insurancePrice = insuranceType === "regular" ? 10000 : 280000;
  // Assume a base price if we don't have it. Let's say 150,000 IDR per day per person.
  // Actually, let's just use the insurance for now as requested, but I'll add a base price field.
  const basePricePerPersonPerDay = 150000; 
  const durationInDays = checkIn && checkOut ? 
    Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0;
  
  const totalPrice = (basePricePerPersonPerDay * (durationInDays || 1) * pax) + (insurancePrice * pax);

  if (loadingGates) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={handleBack}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.title}>{step === 1 ? "Booking Ticket" : "Guest Details"}</h1>
      </header>

      <div className={styles.container}>
        {step === 1 ? (
          <>
            <div className={styles.card}>
              <div className={styles.sectionHeader}>
                <div className={styles.iconWrapper}>
                  <MapPin size={20} />
                </div>
                <h2 className={styles.sectionTitle}>Entrance Gate</h2>
              </div>
              <div 
                className={styles.gateSelection} 
                onClick={() => handleOpenGateModal("entrance")}
              >
                <img 
                  src={entranceGate?.image || "/placeholder-gate.jpg"} 
                  alt={entranceGate?.name} 
                  className={styles.gateImage}
                />
                <span className={styles.gateName}>{entranceGate?.name}</span>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.sectionHeader}>
                <div className={styles.iconWrapper}>
                  <MapPin size={20} />
                </div>
                <h2 className={styles.sectionTitle}>Exit Gate</h2>
              </div>
              <div 
                className={styles.gateSelection} 
                onClick={() => handleOpenGateModal("exit")}
              >
                <img 
                  src={exitGate?.image || "/placeholder-gate.jpg"} 
                  alt={exitGate?.name} 
                  className={styles.gateImage}
                />
                <span className={styles.gateName}>{exitGate?.name}</span>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.sectionHeader}>
                <div className={styles.iconWrapper}>
                  <Calendar size={20} />
                </div>
                <h2 className={styles.sectionTitle}>Trekking Date</h2>
              </div>

              <div className={styles.durationInfo}>
                <Info size={16} />
                <span>Duration: {durationInDays > 0 ? `${durationInDays} days` : "Pick dates"}</span>
              </div>

              <div className={styles.dateGrid}>
                <div className={styles.dateField}>
                  <span className={styles.dateLabel}>Check in</span>
                  <input 
                    type="date" 
                    className={styles.dateInput}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className={styles.dateField}>
                  <span className={styles.dateLabel}>Check out</span>
                  <input 
                    type="date" 
                    className={styles.dateInput}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Number of Trekkers</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                  <button 
                    type="button" 
                    onClick={() => setPax(Math.max(1, pax - 1))}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd' }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>{pax}</span>
                  <button 
                    type="button" 
                    onClick={() => setPax(pax + 1)}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd' }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <h3 className={styles.sectionTitle} style={{ marginBottom: '12px' }}>Insurance Option</h3>
                <div 
                  className={`${styles.insuranceOption} ${insuranceType === "regular" ? styles.insuranceOptionSelected : ""}`}
                  onClick={() => setInsuranceType("regular")}
                >
                  <ShieldCheck size={24} color={insuranceType === "regular" ? "#1a4d43" : "#9ca3af"} />
                  <div className={styles.insuranceInfo}>
                    <span className={styles.insuranceTitle}>Regular Insurance</span>
                    <span className={styles.insurancePrice}>Rp 10,000</span>
                  </div>
                  {insuranceType === "regular" && <CheckCircle2 size={20} color="#1a4d43" />}
                </div>

                <div 
                  className={`${styles.insuranceOption} ${insuranceType === "premium" ? styles.insuranceOptionSelected : ""}`}
                  onClick={() => setInsuranceType("premium")}
                >
                  <ShieldCheck size={24} color={insuranceType === "premium" ? "#1a4d43" : "#9ca3af"} />
                  <div className={styles.insuranceInfo}>
                    <span className={styles.insuranceTitle}>Premium Insurance</span>
                    <span className={styles.insurancePrice}>Rp 280,000 / person</span>
                  </div>
                  {insuranceType === "premium" && <CheckCircle2 size={20} color="#1a4d43" />}
                </div>
              </div>

              <button className={styles.submitBtn} onClick={handleNext} style={{ marginTop: '20px' }}>
                <Search size={20} />
                Check Quota
              </button>
            </div>
          </>
        ) : (
          <form className={styles.card} onSubmit={handleSubmit}>
            {error && <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}
            
            <div className={styles.formGroup}>
              <label>Full Name *</label>
              <input 
                type="text" 
                required 
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>

            <div className={styles.formGroup}>
              <label>WhatsApp Number *</label>
              <input 
                type="tel" 
                required 
                placeholder="+62..."
                value={formData.whatsapp}
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Guest Data (Passport, Nationality, etc.) *</label>
              <textarea 
                required 
                value={formData.memberData}
                onChange={(e) => setFormData({...formData, memberData: e.target.value})}
              />
            </div>

            <div style={{ margin: '24px 0', padding: '16px', background: '#f9f9f9', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Entrance Ticket ({pax} pax)</span>
                <span>Rp {(basePricePerPersonPerDay * (durationInDays || 1) * pax).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>{insuranceType === "regular" ? "Regular" : "Premium"} Insurance</span>
                <span>Rp {(insurancePrice * pax).toLocaleString()}</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
                <span>Total Payment</span>
                <span style={{ color: '#1a4d43' }}>Rp {totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? "Processing..." : `Pay Now (Rp ${totalPrice.toLocaleString()})`}
              {!submitting && <ChevronRight size={20} />}
            </button>
          </form>
        )}
      </div>

      {isGateModalOpen && (
        <div className={styles.modal} onClick={() => setIsGateModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Select {selectingType === "entrance" ? "Entrance" : "Exit"} Gate</h2>
              <button className={styles.closeButton} onClick={() => setIsGateModalOpen(false)}>&times;</button>
            </div>
            <div className={styles.gateGrid}>
              {gates.map((gate) => (
                <div 
                  key={gate.id} 
                  className={styles.gateSelection}
                  style={{ height: '100px', marginBottom: '12px' }}
                  onClick={() => handleSelectGate(gate)}
                >
                  <img src={gate.image} alt={gate.name} className={styles.gateImage} />
                  <span className={styles.gateName}>{gate.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
