"use client";

import { useState } from "react";
import styles from "../bookings/bookings.module.css";
import { Trash2, Edit } from "lucide-react";

type Ticket = {
  id: string;
  full_name: string;
  email: string;
  whatsapp: string;
  entrance_gate: string;
  exit_gate: string;
  check_in: Date;
  check_out: Date;
  number_of_pax: number;
  insurance_type: string;
  total_price: number;
  payment_status: string;
  doku_invoice: string | null;
  created_at: Date;
  member_data?: string;
};

export default function TicketsTable({ tickets: initialTickets }: { tickets: any[] }) {
  const [tickets, setTickets] = useState(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    whatsapp: "",
    entrance_gate: "",
    exit_gate: "",
    check_in: "",
    check_out: "",
    number_of_pax: 1,
    insurance_type: "",
    payment_status: "",
    member_data: "",
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      const res = await fetch(`/api/tickets/booking/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTickets(tickets.filter((t) => t.id !== id));
      } else {
        alert("Failed to delete");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting");
    }
  };

  const handleOpenDetails = (ticket: any) => {
    setSelectedTicket(ticket);
    setEditForm({
      full_name: ticket.full_name,
      email: ticket.email,
      whatsapp: ticket.whatsapp,
      entrance_gate: ticket.entrance_gate,
      exit_gate: ticket.exit_gate,
      check_in: new Date(ticket.check_in).toISOString().split("T")[0],
      check_out: new Date(ticket.check_out).toISOString().split("T")[0],
      number_of_pax: ticket.number_of_pax,
      insurance_type: ticket.insurance_type,
      payment_status: ticket.payment_status,
      member_data: ticket.member_data || "",
    });
  };

  const handleCloseDetails = () => {
    setSelectedTicket(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setIsSaving(true);

    try {
      const checkInDate = new Date(editForm.check_in);
      const checkOutDate = new Date(editForm.check_out);
      const durationInDays = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const insurancePrice = editForm.insurance_type === "regular" ? 10000 : 280000;
      const basePricePerPersonPerDay = 150000;
      const totalPrice = (basePricePerPersonPerDay * durationInDays * editForm.number_of_pax) + (insurancePrice * editForm.number_of_pax);

      const payload = {
        full_name: editForm.full_name,
        email: editForm.email,
        whatsapp: editForm.whatsapp,
        entrance_gate: editForm.entrance_gate,
        exit_gate: editForm.exit_gate,
        check_in: checkInDate,
        check_out: checkOutDate,
        number_of_pax: Number(editForm.number_of_pax),
        insurance_type: editForm.insurance_type,
        payment_status: editForm.payment_status,
        member_data: editForm.member_data,
        total_price: totalPrice,
      };

      const res = await fetch(`/api/tickets/booking/${selectedTicket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updatedTicket = await res.json();
        setTickets(tickets.map((t) => (t.id === selectedTicket.id ? updatedTicket : t)));
        alert("Booking updated successfully!");
        handleCloseDetails();
      } else {
        const errData = await res.json();
        alert(`Failed to update: ${errData.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error saving booking");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Guest</th>
            <th>Gates</th>
            <th>Dates</th>
            <th>Pax</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
              <td>
                <div style={{ fontWeight: 600 }}>{ticket.full_name}</div>
                <div style={{ fontSize: "0.85em", color: "#666" }}>{ticket.email}</div>
              </td>
              <td>
                <div>In: {ticket.entrance_gate}</div>
                <div>Out: {ticket.exit_gate}</div>
              </td>
              <td>
                <div>{new Date(ticket.check_in).toLocaleDateString()}</div>
                <div>{new Date(ticket.check_out).toLocaleDateString()}</div>
              </td>
              <td>{ticket.number_of_pax}</td>
              <td>Rp {ticket.total_price.toLocaleString()}</td>
              <td>
                <span className={`${styles.badge} ${styles.badgeGray}`} style={{ 
                  background: ticket.payment_status === "paid" ? "#10b981" : 
                              ticket.payment_status === "pending" ? "#f59e0b" : "#ef4444",
                  color: "white" 
                }}>
                  {ticket.payment_status}
                </span>
              </td>
              <td>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button 
                    onClick={() => handleOpenDetails(ticket)}
                    className={styles.expandBtn}
                    style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="View / Edit Details"
                  >
                    <Edit size={14} /> Details
                  </button>
                  <button 
                    onClick={() => handleDelete(ticket.id)}
                    className={styles.deleteBtn}
                    style={{ padding: '6px', border: '1px solid #ef4444', color: '#ef4444', background: 'transparent', borderRadius: '6px', cursor: 'pointer' }}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {tickets.length === 0 && (
            <tr>
              <td colSpan={8} style={{ textAlign: "center", padding: "40px" }}>
                No ticket bookings found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedTicket && (
        <div className={styles.modal}>
          <div className={styles.modalContent} style={{ maxWidth: '800px', width: '100%' }}>
            <div className={styles.modalHeader}>
              <h3>Ticket Booking Details</h3>
              <button className={styles.closeBtn} onClick={handleCloseDetails}>&times;</button>
            </div>
            
            <form onSubmit={handleSave}>
              <div className={styles.detailsGrid} style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                
                {/* Left Column: Guest Info & Trek details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Guest Full Name</label>
                    <input 
                      type="text" 
                      value={editForm.full_name} 
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} 
                      style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', width: '100%' }}
                      required
                    />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Guest Email</label>
                    <input 
                      type="email" 
                      value={editForm.email} 
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} 
                      style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', width: '100%' }}
                      required
                    />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>WhatsApp Number</label>
                    <input 
                      type="text" 
                      value={editForm.whatsapp} 
                      onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })} 
                      style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', width: '100%' }}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Entrance Gate</label>
                    <select 
                      value={editForm.entrance_gate}
                      onChange={(e) => setEditForm({ ...editForm, entrance_gate: e.target.value })}
                      style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white', width: '100%' }}
                    >
                      <option value="Sembalun">Sembalun</option>
                      <option value="Torean - Senange">Torean - Senange</option>
                      <option value="Senaru">Senaru</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Exit Gate</label>
                    <select 
                      value={editForm.exit_gate}
                      onChange={(e) => setEditForm({ ...editForm, exit_gate: e.target.value })}
                      style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white', width: '100%' }}
                    >
                      <option value="Sembalun">Sembalun</option>
                      <option value="Torean - Senange">Torean - Senange</option>
                      <option value="Senaru">Senaru</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Number of Pax</label>
                    <input 
                      type="number" 
                      min="1"
                      value={editForm.number_of_pax} 
                      onChange={(e) => setEditForm({ ...editForm, number_of_pax: Number(e.target.value) })} 
                      style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', width: '100%' }}
                      required
                    />
                  </div>
                </div>

                {/* Right Column: Dates, Insurance, Status, Guest Data */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Check-in</label>
                      <input 
                        type="date" 
                        value={editForm.check_in} 
                        onChange={(e) => setEditForm({ ...editForm, check_in: e.target.value })} 
                        style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', width: '100%' }}
                        required
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Check-out</label>
                      <input 
                        type="date" 
                        value={editForm.check_out} 
                        onChange={(e) => setEditForm({ ...editForm, check_out: e.target.value })} 
                        style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', width: '100%' }}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Insurance Type</label>
                    <select 
                      value={editForm.insurance_type}
                      onChange={(e) => setEditForm({ ...editForm, insurance_type: e.target.value })}
                      style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white', width: '100%' }}
                    >
                      <option value="regular">Regular Insurance (Rp 10,000)</option>
                      <option value="premium">Premium Insurance (Rp 280,000)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Payment Status</label>
                    <select 
                      value={editForm.payment_status}
                      onChange={(e) => setEditForm({ ...editForm, payment_status: e.target.value })}
                      style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white', width: '100%' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Guest/Member Details</label>
                    <textarea 
                      value={editForm.member_data} 
                      onChange={(e) => setEditForm({ ...editForm, member_data: e.target.value })} 
                      style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', minHeight: '120px', resize: 'vertical', fontSize: '0.85rem', width: '100%', fontFamily: 'inherit' }}
                    />
                  </div>

                  <div style={{ marginTop: '4px', padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#475569' }}>
                    <div style={{ marginBottom: '4px' }}><strong>Invoice No:</strong> {selectedTicket.doku_invoice || "N/A"}</div>
                    <div><strong>Original Total Price:</strong> Rp {selectedTicket.total_price.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.closeModalBtn} onClick={handleCloseDetails}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving} 
                  className={styles.approveBtn}
                  style={{ background: '#1a4d43', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
