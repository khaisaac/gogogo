"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  userEmail?: string;
  userFullName?: string;
  userWhatsapp?: string;
  isLoggedIn?: boolean;
};

const TICKET_GATES: Gate[] = [
  { id: "sembalun", name: "Sembalun", image: "/sembalun.jpg" },
  { id: "torean", name: "Torean - Senange", image: "/n.jpg" },
  { id: "senaru", name: "Senaru", image: "/senaru.jpg" },
];

function getTrekDurationLimits(entrance: string, exit: string): { minDays: number; maxDays: number } {
  const ent = entrance.toLowerCase();
  const ex = exit.toLowerCase();
  
  const isSembalun = (name: string) => name.includes("sembalun");
  const isTorean = (name: string) => name.includes("torean");
  const isSenaru = (name: string) => name.includes("senaru");

  if (isSembalun(ent) && isSembalun(ex)) return { minDays: 2, maxDays: 4 };
  if (isSenaru(ent) && isSenaru(ex)) return { minDays: 2, maxDays: 4 };
  if (isTorean(ent) && isTorean(ex)) return { minDays: 2, maxDays: 4 };

  return { minDays: 3, maxDays: 4 };
}

function getDateWithOffset(baseDateStr: string, offsetDays: number): string {
  if (!baseDateStr) return "";
  const date = new Date(baseDateStr);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split("T")[0];
}

function calculateBasePrice(
  citizenType: "foreign" | "local",
  entranceGateName: string,
  checkInDateStr: string,
  checkOutDateStr: string
): number {
  if (!checkInDateStr || !checkOutDateStr) return 0;

  const isClass1 = (name: string) => {
    const n = name.toLowerCase();
    return n.includes("sembalun") || n.includes("senaru") || n.includes("torean");
  };

  const start = new Date(checkInDateStr);
  const end = new Date(checkOutDateStr);

  let totalBasePrice = 0;
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay(); // 0: Sunday, 6: Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let pricePerDay = 0;
    if (citizenType === "foreign") {
      pricePerDay = isClass1(entranceGateName) ? 250000 : 150000;
    } else {
      // Local (WNI)
      if (isClass1(entranceGateName)) {
        pricePerDay = isWeekend ? 75000 : 50000;
      } else {
        pricePerDay = isWeekend ? 15000 : 10000;
      }
    }
    totalBasePrice += pricePerDay;

    // Move to next day
    current.setDate(current.getDate() + 1);
  }

  return totalBasePrice;
}

interface TrekkerData {
  fullName: string;
  passportNumber: string;
  nationality: string;
  gender: string;
  birthday: string;
  height: string;
  weight: string;
}

export default function TicketBookingClient({ 
  userEmail = "", 
  userFullName = "", 
  userWhatsapp = "",
  isLoggedIn = false
}: TicketBookingClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1); // 1: Selection, 2: Personal Data
  const [gates, setGates] = useState<Gate[]>([]);
  const [loadingGates, setLoadingGates] = useState(true);
  
  const [entranceGate, setEntranceGate] = useState<Gate | null>(TICKET_GATES[0]);
  const [exitGate, setExitGate] = useState<Gate | null>(TICKET_GATES[2]);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [pax, setPax] = useState(1);
  const [insuranceType, setInsuranceType] = useState<"regular" | "premium">("regular");
  const [citizenType, setCitizenType] = useState<"foreign" | "local">("foreign");

  const [mounted, setMounted] = useState(false);
  const [todayStr, setTodayStr] = useState("");

  useEffect(() => {
    setMounted(true);
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setTodayStr(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Load selections from query params if coming back from login
  useEffect(() => {
    const entrance = searchParams?.get("entrance");
    const exit = searchParams?.get("exit");
    const checkin = searchParams?.get("checkin");
    const checkout = searchParams?.get("checkout");
    const paxParam = searchParams?.get("pax");
    const citizen = searchParams?.get("citizen");
    const insurance = searchParams?.get("insurance");
    const autoNext = searchParams?.get("step") === "2";

    if (entrance) {
      const found = TICKET_GATES.find(g => g.name.toLowerCase() === entrance.toLowerCase());
      if (found) setEntranceGate(found);
    }
    if (exit) {
      const found = TICKET_GATES.find(g => g.name.toLowerCase() === exit.toLowerCase());
      if (found) setExitGate(found);
    }
    if (checkin) setCheckIn(checkin);
    if (checkout) setCheckOut(checkout);
    if (paxParam) setPax(parseInt(paxParam) || 1);
    if (citizen === "local" || citizen === "foreign") setCitizenType(citizen);
    if (insurance === "regular" || insurance === "premium") setInsuranceType(insurance);
    
    if (autoNext && isLoggedIn) {
      setStep(2);
    }
  }, [searchParams, isLoggedIn]);

  // Pre-fill Member 1 and form data once user logs in
  useEffect(() => {
    if (userFullName) {
      setFormData(prev => ({ ...prev, fullName: userFullName }));
      setTrekkers(prev => {
        const copy = [...prev];
        if (copy[0] && !copy[0].fullName) {
          copy[0].fullName = userFullName;
        }
        return copy;
      });
    }
    if (userWhatsapp) {
      setFormData(prev => ({ ...prev, whatsapp: userWhatsapp }));
    }
  }, [userFullName, userWhatsapp]);

  const [trekkers, setTrekkers] = useState<TrekkerData[]>([
    { fullName: userFullName, passportNumber: "", nationality: "", gender: "Male", birthday: "", height: "", weight: "" }
  ]);

  // Dynamically update trekkers array size when pax changes
  useEffect(() => {
    setTrekkers((prev) => {
      const copy = [...prev];
      if (copy.length < pax) {
        while (copy.length < pax) {
          copy.push({ fullName: "", passportNumber: "", nationality: "", gender: "Male", birthday: "", height: "", weight: "" });
        }
      } else if (copy.length > pax) {
        copy.splice(pax);
      }
      return copy;
    });
  }, [pax]);

  const updateTrekker = (index: number, field: keyof TrekkerData, value: string) => {
    setTrekkers((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], [field]: value };
      }
      return copy;
    });
  };
  
  const [isGateModalOpen, setIsGateModalOpen] = useState(false);
  const [selectingType, setSelectingType] = useState<"entrance" | "exit">("entrance");

  const [formData, setFormData] = useState({
    fullName: userFullName,
    whatsapp: userWhatsapp,
    memberData: "",
  });

  const handleLeadNameChange = (val: string) => {
    setFormData(prev => ({ ...prev, fullName: val }));
    setTrekkers(prev => {
      const copy = [...prev];
      if (copy[0]) {
        copy[0].fullName = val;
      }
      return copy;
    });
  };

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [pageSettings, setPageSettings] = useState<any>({
    title: "e-Rinjani Entrance Tickets",
    description: "Secure your limited official Mt. Rinjani National Park entrance tickets first! Ensure flexible dates and instant confirmation before commencing your trek.",
    about_items: "Instant Booking: Avoid queues and secure your entry pass ahead of your climb.\nMedical Insurance Included: Covers basic search, rescue, and health care within the national park.\nOfficial Registration: Issued and verified directly through the Rinjani National Park registry.\nFlexible Routes: Valid for Sembalun, Senaru, and Torean trekking trails.",
    included_items: "Official Mt. Rinjani National Park Entrance Pass\nCustomized Entrance and Exit Gate route registry\nTrekking Health & Search and Rescue (SAR) Insurance\n24/7 client support for e-Rinjani processing",
    image: "/sembalun.jpg",
  });

  // Set gates on mount and fetch page settings
  useEffect(() => {
    setGates(TICKET_GATES);
    setLoadingGates(false);

    async function fetchSettings() {
      try {
        const res = await fetch("/api/tickets/settings");
        if (res.ok) {
          const data = await res.json();
          setPageSettings(data);
        }
      } catch (err) {
        console.error("Failed to load page settings", err);
      }
    }
    fetchSettings();
  }, []);

  // Dynamically manage and clamp checkout date based on trek route limits
  useEffect(() => {
    if (!checkIn || !entranceGate || !exitGate) return;
    
    const { minDays, maxDays } = getTrekDurationLimits(entranceGate.name, exitGate.name);
    const minCheckoutStr = getDateWithOffset(checkIn, minDays - 1);
    const maxCheckoutStr = getDateWithOffset(checkIn, maxDays - 1);
    
    if (checkOut) {
      if (checkOut < minCheckoutStr || checkOut > maxCheckoutStr) {
        setCheckOut(minCheckoutStr);
      }
    } else {
      setCheckOut(minCheckoutStr);
    }
  }, [checkIn, entranceGate, exitGate]);

  const handleCheckInChange = (val: string) => {
    if (!val) {
      setCheckIn("");
      return;
    }
    const selected = new Date(val);
    const today = new Date(todayStr);
    
    selected.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    if (selected < today) {
      alert("Past dates are not allowed. Please choose today or a future date.");
      setCheckIn(todayStr);
      return;
    }
    setCheckIn(val);
  };

  const handleCheckOutChange = (val: string) => {
    if (!val) {
      setCheckOut("");
      return;
    }
    if (!checkIn) {
      alert("Please select a check-in date first.");
      setCheckOut("");
      return;
    }
    
    const { minDays, maxDays } = getTrekDurationLimits(entranceGate?.name || "Sembalun", exitGate?.name || "Sembalun");
    const minCheckoutStr = getDateWithOffset(checkIn, minDays - 1);
    const maxCheckoutStr = getDateWithOffset(checkIn, maxDays - 1);
    
    if (val < minCheckoutStr || val > maxCheckoutStr) {
      alert(`For this route, the duration must be between ${minDays} and ${maxDays} days. Adjusting check-out date automatically.`);
      setCheckOut(minCheckoutStr);
      return;
    }
    setCheckOut(val);
  };

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

    if (!isLoggedIn) {
      const params = new URLSearchParams({
        entrance: entranceGate.name,
        exit: exitGate.name,
        checkin: checkIn,
        checkout: checkOut,
        pax: pax.toString(),
        citizen: citizenType,
        insurance: insuranceType,
        step: "2"
      });
      const callbackUrl = `/booking-ticket?${params.toString()}`;
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
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
      const formattedMemberData = trekkers.map((t, idx) => {
        return `Member ${idx + 1}:
1. Full Name: ${t.fullName}
2. Passport Number: ${t.passportNumber}
3. Nationality: ${t.nationality}
4. Gender: ${t.gender}
5. Birthday: ${t.birthday}
6. Height: ${t.height} cm
7. Weight: ${t.weight} kg`;
      }).join("\n\n");

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
        member_data: `Citizen Type: ${citizenType === "foreign" ? "Foreigner (WNA)" : "Local (WNI)"}\n\n${formattedMemberData}`,
      };

      const res = await fetch("/api/tickets/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const detailStr = data.details ? ` Details: ${JSON.stringify(data.details)}` : "";
        throw new Error((data.error || "Failed to create booking") + detailStr);
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

  const insurancePrice = insuranceType === "regular" ? 10000 : 290000;
  const durationInDays = checkIn && checkOut ? 
    Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0;
  
  const totalBasePrice = calculateBasePrice(
    citizenType,
    entranceGate?.name || "Sembalun",
    checkIn,
    checkOut
  ) * pax;
  
  const totalPrice = totalBasePrice + (insurancePrice * pax);

  const parseAboutLine = (line: string) => {
    const idx = line.indexOf(":");
    if (idx !== -1) {
      return (
        <>
          <strong>{line.substring(0, idx + 1)}</strong>
          {line.substring(idx + 1)}
        </>
      );
    }
    return line;
  };

  const aboutLines = pageSettings.about_items 
    ? pageSettings.about_items.split("\n").map((l: string) => l.trim()).filter(Boolean) 
    : [];
  
  const includedLines = pageSettings.included_items 
    ? pageSettings.included_items.split("\n").map((l: string) => l.trim()).filter(Boolean) 
    : [];

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

      <div className={styles.bookingWrapper}>
        <div className={styles.leftColumn}>
          <div className={styles.galleryWrapper}>
            <img 
              src={pageSettings.image || "/sembalun.jpg"} 
              alt={pageSettings.title || "Mount Rinjani Trekking"} 
              className={styles.galleryImageMain}
            />
          </div>
          <div className={styles.detailCard}>
            <h2 className={styles.detailTitle}>{pageSettings.title}</h2>
            <p className={styles.detailDesc}>
              {pageSettings.description}
            </p>
            {aboutLines.length > 0 && (
              <div className={styles.activityInfo}>
                <h3 className={styles.infoSectionTitle}>About This Ticket</h3>
                <ul className={styles.infoList}>
                  {aboutLines.map((line: string, idx: number) => (
                    <li key={idx}>{parseAboutLine(line)}</li>
                  ))}
                </ul>
              </div>
            )}
            {includedLines.length > 0 && (
              <div className={styles.includedSection}>
                <h3 className={styles.infoSectionTitle}>What's Included</h3>
                <ul className={styles.includedList}>
                  {includedLines.map((line: string, idx: number) => (
                    <li key={idx}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className={styles.rightColumn}>
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
                  <label className={styles.dateField}>
                    <span className={styles.dateLabel}>Check in</span>
                    <input 
                      type="date" 
                      className={styles.dateInput}
                      value={checkIn}
                      onChange={(e) => handleCheckInChange(e.target.value)}
                      min={mounted ? todayStr : ""}
                    />
                  </label>
                  <label className={styles.dateField}>
                    <span className={styles.dateLabel}>Check out</span>
                    <input 
                      type="date" 
                      className={styles.dateInput}
                      value={checkOut}
                      onChange={(e) => handleCheckOutChange(e.target.value)}
                      min={checkIn ? getDateWithOffset(checkIn, (entranceGate && exitGate ? getTrekDurationLimits(entranceGate.name, exitGate.name).minDays : 2) - 1) : (mounted ? todayStr : "")}
                      max={checkIn ? getDateWithOffset(checkIn, (entranceGate && exitGate ? getTrekDurationLimits(entranceGate.name, exitGate.name).maxDays : 4) - 1) : ""}
                      disabled={!checkIn}
                    />
                  </label>
                </div>

                <div className={styles.formGroup}>
                  <label>Number of Trekkers</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                    <button 
                      type="button" 
                      onClick={() => setPax(Math.max(1, pax - 1))}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer' }}
                    >
                      -
                    </button>
                    <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>{pax}</span>
                    <button 
                      type="button" 
                      onClick={() => setPax(pax + 1)}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer' }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                  <h3 className={styles.sectionTitle} style={{ marginBottom: '12px' }}>Nationality / Kewarganegaraan</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setCitizenType("foreign")}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: citizenType === "foreign" ? '2px solid #1a4d43' : '1px solid #ddd',
                        background: citizenType === "foreign" ? '#f0fdf4' : '#fff',
                        color: citizenType === "foreign" ? '#1a4d43' : '#475569',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      Foreigner (WNA)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCitizenType("local")}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: citizenType === "local" ? '2px solid #1a4d43' : '1px solid #ddd',
                        background: citizenType === "local" ? '#f0fdf4' : '#fff',
                        color: citizenType === "local" ? '#1a4d43' : '#475569',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                       Indonesian (WNI)
                    </button>
                  </div>
                  
                  <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#64748b', background: '#f8fafc', padding: '10px', borderRadius: '6px', lineHeight: '1.4' }}>
                    {citizenType === "foreign" ? (
                      <div>
                        <strong>Foreign National Fee:</strong> Class 1 gates (Sembalun, Senaru, Torean) are <strong>Rp 250,000 / day / person</strong>. Other gates are <strong>Rp 150,000 / day / person</strong>.
                      </div>
                    ) : (
                      <div>
                        <strong>Warga Negara Indonesia Fee:</strong> Class 1 gates (Sembalun, Senaru, Torean) are <strong>Rp 50,000 / day / person</strong> on normal weekdays and <strong>Rp 75,000 / day / person</strong> on weekend/holidays.
                      </div>
                    )}
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
                      <span className={styles.insurancePrice}>Rp 290,000 / person</span>
                    </div>
                    {insuranceType === "premium" && <CheckCircle2 size={20} color="#1a4d43" />}
                  </div>
                </div>

                <button className={styles.submitBtn} onClick={handleNext} style={{ marginTop: '20px' }}>
                  <Search size={20} />
                  Book Now
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
                  onChange={(e) => handleLeadNameChange(e.target.value)}
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

              <div style={{ marginTop: '24px', marginBottom: '24px' }}>
                <h3 className={styles.sectionTitle} style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Trekkers Information</h3>
                
                {trekkers.map((trekker, idx) => (
                  <div key={idx} style={{ 
                    padding: '20px', 
                    background: '#f8fafc', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px', 
                    marginBottom: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                  }}>
                    <h4 style={{ 
                      fontSize: '0.95rem', 
                      fontWeight: 700, 
                      color: '#1a4d43', 
                      marginBottom: '16px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      borderBottom: '1px solid #e2e8f0',
                      paddingBottom: '8px'
                    }}>
                      👤 Trekker {idx + 1} {idx === 0 ? "(Lead Booker)" : ""}
                    </h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className={styles.formGroup} style={{ gridColumn: 'span 2', marginBottom: '0' }}>
                        <label>Full Name *</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Enter full name"
                          value={trekker.fullName}
                          onChange={(e) => updateTrekker(idx, "fullName", e.target.value)}
                        />
                      </div>

                      <div className={styles.formGroup} style={{ marginBottom: '0' }}>
                        <label>Passport / NIK *</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Passport or ID Number"
                          value={trekker.passportNumber}
                          onChange={(e) => updateTrekker(idx, "passportNumber", e.target.value)}
                        />
                      </div>

                      <div className={styles.formGroup} style={{ marginBottom: '0' }}>
                        <label>Nationality *</label>
                        <input 
                          type="text" 
                          required 
                          placeholder={citizenType === "local" ? "Indonesia" : "e.g. Australia"}
                          value={trekker.nationality}
                          onChange={(e) => updateTrekker(idx, "nationality", e.target.value)}
                        />
                      </div>

                      <div className={styles.formGroup} style={{ marginBottom: '0' }}>
                        <label>Gender *</label>
                        <select 
                          value={trekker.gender}
                          onChange={(e) => updateTrekker(idx, "gender", e.target.value)}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>

                      <div className={styles.formGroup} style={{ marginBottom: '0' }}>
                        <label>Birthday *</label>
                        <input 
                          type="date" 
                          required 
                          value={trekker.birthday}
                          onChange={(e) => updateTrekker(idx, "birthday", e.target.value)}
                        />
                      </div>

                      <div className={styles.formGroup} style={{ marginBottom: '0' }}>
                        <label>Height (cm) *</label>
                        <input 
                          type="number" 
                          required 
                          placeholder="170"
                          value={trekker.height}
                          onChange={(e) => updateTrekker(idx, "height", e.target.value)}
                        />
                      </div>

                      <div className={styles.formGroup} style={{ marginBottom: '0' }}>
                        <label>Weight (kg) *</label>
                        <input 
                          type="number" 
                          required 
                          placeholder="60"
                          value={trekker.weight}
                          onChange={(e) => updateTrekker(idx, "weight", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ margin: '24px 0', padding: '16px', background: '#f9f9f9', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Entrance Ticket ({pax} pax)</span>
                  <span>Rp {totalBasePrice.toLocaleString()}</span>
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
