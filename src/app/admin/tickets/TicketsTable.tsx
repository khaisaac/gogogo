"use client";

import { useState } from "react";
import styles from "../bookings/bookings.module.css";
import { Trash2, ExternalLink } from "lucide-react";

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
};

export default function TicketsTable({ tickets: initialTickets }: { tickets: any[] }) {
  const [tickets, setTickets] = useState(initialTickets);

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
                <span className={`${styles.statusBadge} ${styles[`status_${ticket.payment_status}`]}`}>
                  {ticket.payment_status}
                </span>
              </td>
              <td>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button 
                    onClick={() => handleDelete(ticket.id)}
                    className={styles.deleteBtn}
                    title="Delete"
                  >
                    <Trash2 size={16} />
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
    </div>
  );
}
