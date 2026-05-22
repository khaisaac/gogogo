"use client";

import { useState } from "react";
import { 
  Trash2, 
  Edit3, 
  Plus, 
  Car, 
  Calendar, 
  Phone, 
  DollarSign, 
  Check, 
  X, 
  Upload,
  User,
  Users,
  MapPin,
  Clock
} from "lucide-react";
import styles from "../../booking-transport/BookingTransport.module.css";
import adminStyles from "../bookings/bookings.module.css";

type PaymentRecord = {
  id: string;
  amount: number;
  status: string;
  invoice: string | null;
  payment_type: string | null;
};

type TransportBooking = {
  id: string;
  user_id: string | null;
  full_name: string;
  whatsapp: string;
  passport: string;
  booking_date: Date | string;
  pickup_time: string | null;
  pickup_location: string | null;
  dropoff_location: string | null;
  number_of_pax: number;
  route_title: string;
  total_price: number;
  payment_type: string;
  deposit_amount: number | null;
  balance_amount: number | null;
  payment_status: string;
  doku_invoice: string | null;
  created_at: Date | string;
  payments: PaymentRecord[];
};

type TransportOption = {
  id: string;
  route: string;
  price: number;
  image: string | null;
  is_active: boolean;
};

type TransportAdminClientProps = {
  initialBookings: TransportBooking[];
  initialOptions: TransportOption[];
};

export default function TransportAdminClient({
  initialBookings,
  initialOptions,
}: TransportAdminClientProps) {
  const [activeTab, setActiveTab] = useState<"bookings" | "routes">("bookings");
  const [bookings, setBookings] = useState<TransportBooking[]>(initialBookings);
  const [options, setOptions] = useState<TransportOption[]>(initialOptions);

  // CRUD State for Routes
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<TransportOption | null>(null);
  const [route, setRoute] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Search/Filter state
  const [searchTerm, setSearchTerm] = useState("");

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // --- CRUD API calls for Transport options ---
  const handleOpenNewForm = () => {
    setEditingOption(null);
    setRoute("");
    setPrice("");
    setImage("");
    setIsActive(true);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (opt: TransportOption) => {
    setEditingOption(opt);
    setRoute(opt.route);
    setPrice(opt.price.toString());
    setImage(opt.image || "");
    setIsActive(opt.is_active);
    setIsFormOpen(true);
  };

  const handleSaveOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!route || !price) return;

    try {
      const url = "/api/transport/options";
      const method = editingOption ? "PUT" : "POST";
      const body = {
        id: editingOption?.id,
        route,
        price: parseInt(price),
        image: image || null,
        is_active: isActive,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save option");

      const saved = await res.json();
      if (editingOption) {
        setOptions(options.map((o) => (o.id === saved.id ? saved : o)));
      } else {
        setOptions([saved, ...options]);
      }

      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error saving transfer route option.");
    }
  };

  const handleDeleteOption = async (id: string) => {
    if (!confirm("Are you sure you want to delete this route option?")) return;

    try {
      const res = await fetch(`/api/transport/options?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete option");

      setOptions(options.filter((o) => o.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete transfer route option.");
    }
  };

  // --- CRUD API calls for bookings ---
  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/transport/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, payment_status: status }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      const updated = await res.json();
      setBookings(bookings.map((b) => (b.id === id ? { ...b, payment_status: status } : b)));
    } catch (err) {
      console.error(err);
      alert("Failed to update payment status.");
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking record?")) return;

    try {
      const res = await fetch(`/api/transport/bookings?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete booking");

      setBookings(bookings.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete transport booking.");
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const term = searchTerm.toLowerCase();
    return (
      b.full_name.toLowerCase().includes(term) ||
      b.whatsapp.toLowerCase().includes(term) ||
      b.passport.toLowerCase().includes(term) ||
      b.route_title.toLowerCase().includes(term) ||
      (b.doku_invoice && b.doku_invoice.toLowerCase().includes(term))
    );
  });

  return (
    <div>
      {/* Tab Selectors */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", borderBottom: "2px solid #e2e8f0", paddingBottom: "10px" }}>
        <button
          onClick={() => setActiveTab("bookings")}
          style={{
            background: "none",
            border: "none",
            fontSize: "1.1rem",
            fontWeight: 700,
            color: activeTab === "bookings" ? "#1a4d43" : "#64748b",
            borderBottom: activeTab === "bookings" ? "3px solid #1a4d43" : "3px solid transparent",
            padding: "8px 16px",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          🚗 Transport Bookings
        </button>
        <button
          onClick={() => setActiveTab("routes")}
          style={{
            background: "none",
            border: "none",
            fontSize: "1.1rem",
            fontWeight: 700,
            color: activeTab === "routes" ? "#1a4d43" : "#64748b",
            borderBottom: activeTab === "routes" ? "3px solid #1a4d43" : "3px solid transparent",
            padding: "8px 16px",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          ⚙️ Manage Shuttle Routes (CRUD)
        </button>
      </div>

      {/* TABS CONTENT */}
      {activeTab === "bookings" ? (
        /* TAB 1: BOOKINGS LIST */
        <div>
          <div style={{ display: "flex", gap: "16px", marginBottom: "20px", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search by Name, WhatsApp, Passport, Route or Invoice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                padding: "12px 16px",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
          </div>

          <div style={{ overflowX: "auto", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                  <th style={{ padding: "16px", fontSize: "0.85rem", fontWeight: 700, color: "#475569" }}>Invoice ID</th>
                  <th style={{ padding: "16px", fontSize: "0.85rem", fontWeight: 700, color: "#475569" }}>Guest Details</th>
                  <th style={{ padding: "16px", fontSize: "0.85rem", fontWeight: 700, color: "#475569" }}>Route / Transfer Details</th>
                  <th style={{ padding: "16px", fontSize: "0.85rem", fontWeight: 700, color: "#475569" }}>Pricing & Payment</th>
                  <th style={{ padding: "16px", fontSize: "0.85rem", fontWeight: 700, color: "#475569" }}>Status</th>
                  <th style={{ padding: "16px", fontSize: "0.85rem", fontWeight: 700, color: "#475569" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                      No transport bookings found.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "16px", verticalAlign: "top" }}>
                        <span style={{ fontWeight: 800, color: "#1a4d43", fontSize: "0.9rem", display: "block" }}>
                          {b.doku_invoice || "PENDING"}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          Created: {formatDate(b.created_at)}
                        </span>
                      </td>

                      <td style={{ padding: "16px", verticalAlign: "top" }}>
                        <span style={{ fontWeight: 700, display: "block", color: "#1e2937" }}>
                          {b.full_name}
                        </span>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "0.8rem", color: "#475569", marginTop: "4px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <Phone size={12} /> {b.whatsapp}
                          </span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <User size={12} /> ID: {b.passport}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: "16px", verticalAlign: "top" }}>
                        <span style={{ fontWeight: 800, color: "#1f2937", display: "block" }}>
                          {b.route_title}
                        </span>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <Calendar size={12} /> {formatDate(b.booking_date)} at {b.pickup_time || "N/A"}
                          </span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <MapPin size={12} /> Pickup: {b.pickup_location}
                          </span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <MapPin size={12} /> Dropoff: {b.dropoff_location}
                          </span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <Users size={12} /> Passengers: {b.number_of_pax}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: "16px", verticalAlign: "top" }}>
                        <span style={{ fontWeight: 800, color: "#0f172a", display: "block" }}>
                          {formatPrice(b.total_price)}
                        </span>
                        <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          Mode: {b.payment_type === "deposit" ? "30% Deposit" : "100% Full"}
                        </span>
                        {b.payment_type === "deposit" && (
                          <div style={{ fontSize: "0.75rem", marginTop: "4px", background: "#f1f5f9", padding: "4px 8px", borderRadius: "6px" }}>
                            <div style={{ color: "#16a34a", fontWeight: 700 }}>DP: {formatPrice(b.deposit_amount || 0)}</div>
                            <div style={{ color: "#475569", fontWeight: 600 }}>Bal: {formatPrice(b.balance_amount || 0)}</div>
                          </div>
                        )}
                      </td>

                      <td style={{ padding: "16px", verticalAlign: "middle" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            textTransform: "uppercase",
                            backgroundColor:
                              b.payment_status === "fully_paid"
                                ? "#dcfce7"
                                : b.payment_status === "deposit_paid"
                                ? "#dbeafe"
                                : b.payment_status === "failed"
                                ? "#fee2e2"
                                : "#fef9c3",
                            color:
                              b.payment_status === "fully_paid"
                                ? "#166534"
                                : b.payment_status === "deposit_paid"
                                ? "#1e40af"
                                : b.payment_status === "failed"
                                ? "#991b1b"
                                : "#854d0e",
                          }}
                        >
                          {b.payment_status.replace("_", " ")}
                        </span>
                      </td>

                      <td style={{ padding: "16px", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <select
                            value={b.payment_status}
                            onChange={(e) => handleUpdateStatus(b.id, e.target.value)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: "8px",
                              border: "1px solid #cbd5e1",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              outline: "none",
                              cursor: "pointer"
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="deposit_paid">Deposit Paid</option>
                            <option value="fully_paid">Fully Paid</option>
                            <option value="failed">Failed</option>
                          </select>
                          <button
                            onClick={() => handleDeleteBooking(b.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#b91c1c",
                              cursor: "pointer",
                              padding: "6px"
                            }}
                            title="Delete Booking"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TAB 2: SHUTTLE ROUTES CRUD */
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "center" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1e2937", margin: 0 }}>
              Shuttle Routes list ({options.length})
            </h3>
            <button
              onClick={handleOpenNewForm}
              style={{
                backgroundColor: "#1a4d43",
                color: "white",
                border: "none",
                borderRadius: "10px",
                padding: "10px 18px",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <Plus size={16} /> Add New Shuttle Route
            </button>
          </div>

          {/* Route form overlay modal */}
          {isFormOpen && (
            <div className={styles.modal}>
              <div className={styles.modalContent} style={{ maxWidth: "500px" }}>
                <div className={styles.modalHeader}>
                  <h3 className={styles.modalTitle}>
                    {editingOption ? "Edit Transfer Route" : "Add New Transfer Route"}
                  </h3>
                  <button className={styles.closeButton} onClick={() => setIsFormOpen(false)}>
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSaveOption}>
                  <div className={styles.formGroup}>
                    <label>Route Title (e.g. Airport Transfer to Senaru)</label>
                    <input
                      type="text"
                      placeholder="Enter transfer route title"
                      value={route}
                      onChange={(e) => setRoute(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Price in IDR (e.g., 750000)</label>
                    <input
                      type="number"
                      placeholder="e.g. 750000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Image cover URL or Path (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., /airport.jpg"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      style={{ width: "20px", height: "20px", cursor: "pointer" }}
                    />
                    <label htmlFor="isActive" style={{ margin: 0, cursor: "pointer" }}>
                      Active (visible to clients)
                    </label>
                  </div>

                  <button type="submit" className={styles.submitBtn} style={{ marginTop: "16px" }}>
                    Save Route <Check size={18} />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Options Grid / Table */}
          <div style={{ overflowX: "auto", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                  <th style={{ padding: "16px", fontSize: "0.85rem", fontWeight: 700, color: "#475569" }}>Route Cover</th>
                  <th style={{ padding: "16px", fontSize: "0.85rem", fontWeight: 700, color: "#475569" }}>Route Title</th>
                  <th style={{ padding: "16px", fontSize: "0.85rem", fontWeight: 700, color: "#475569" }}>Price (IDR)</th>
                  <th style={{ padding: "16px", fontSize: "0.85rem", fontWeight: 700, color: "#475569" }}>Status</th>
                  <th style={{ padding: "16px", fontSize: "0.85rem", fontWeight: 700, color: "#475569" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {options.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                      No transport routes created.
                    </td>
                  </tr>
                ) : (
                  options.map((opt) => (
                    <tr key={opt.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "16px", width: "120px" }}>
                        <div style={{ width: "100px", height: "60px", borderRadius: "8px", overflow: "hidden", background: "#f1f5f9", border: "1px solid #cbd5e1" }}>
                          <img
                            src={opt.image || "/shuttle.jpg"}
                            alt={opt.route}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/shuttle.jpg";
                            }}
                          />
                        </div>
                      </td>

                      <td style={{ padding: "16px", verticalAlign: "middle" }}>
                        <span style={{ fontWeight: 800, color: "#1e2937", fontSize: "1rem" }}>
                          {opt.route}
                        </span>
                      </td>

                      <td style={{ padding: "16px", verticalAlign: "middle" }}>
                        <span style={{ fontWeight: 800, color: "#1a4d43", fontSize: "1.1rem" }}>
                          {formatPrice(opt.price)}
                        </span>
                      </td>

                      <td style={{ padding: "16px", verticalAlign: "middle" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            textTransform: "uppercase",
                            backgroundColor: opt.is_active ? "#dcfce7" : "#fee2e2",
                            color: opt.is_active ? "#166534" : "#991b1b",
                          }}
                        >
                          {opt.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td style={{ padding: "16px", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            onClick={() => handleOpenEditForm(opt)}
                            style={{
                              background: "#f1f5f9",
                              border: "1px solid #cbd5e1",
                              borderRadius: "8px",
                              padding: "8px",
                              color: "#475569",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center"
                            }}
                            title="Edit Route"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteOption(opt.id)}
                            style={{
                              background: "#fee2e2",
                              border: "1px solid #fecaca",
                              borderRadius: "8px",
                              padding: "8px",
                              color: "#b91c1c",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center"
                            }}
                            title="Delete Route"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
