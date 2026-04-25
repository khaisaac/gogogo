"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./dashboard.module.css";

export default function BookingHistory({ user }: { user: any }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      
      {bookings.map(booking => (
        <div key={booking.id} className={styles.bookingCard}>
          <div className={styles.bookingHeader}>
            <div>
              <div className={styles.bookingTitle}>{booking.package_title}</div>
              <div className={styles.bookingDate}>
                Booked on: {new Date(booking.created_at).toLocaleDateString()}
              </div>
            </div>
            <div className={`${styles.statusBadge} ${styles[`status${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}`]}`}>
              {booking.status}
            </div>
          </div>
          
          <div className={styles.bookingDetails}>
            <div className={styles.detailItem}>
              <span>Trekking Date</span>
              <strong>{new Date(booking.trekking_date).toLocaleDateString()}</strong>
            </div>
            <div className={styles.detailItem}>
              <span>Participants</span>
              <strong>{booking.number_of_trekkers} Persons</strong>
            </div>
            <div className={styles.detailItem}>
              <span>Total Price</span>
              <strong>${booking.total_price}</strong>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
